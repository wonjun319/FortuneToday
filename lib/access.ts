import { TEAM_SLUGS, type TeamSlug } from "@/lib/types";

export const ACCESS_COOKIE_NAME = "lmd_access";
const DEFAULT_URL_TOKEN_TTL_MINUTES = 60 * 24 * 30;
const DEFAULT_SESSION_TTL_MINUTES = 1;

type AccessPayload = {
  team: TeamSlug;
  exp: number | null;
};

let cachedSecret = "";
let cachedSecretKeyPromise: Promise<CryptoKey> | null = null;

function getSecret() {
  return process.env.LMD_ACCESS_SECRET?.trim() ?? "";
}

async function getSecretKey() {
  const secret = getSecret();

  if (!secret) {
    throw new Error("LMD_ACCESS_SECRET is not configured.");
  }

  if (cachedSecret !== secret || !cachedSecretKeyPromise) {
    cachedSecret = secret;
    cachedSecretKeyPromise = crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(secret))
      .then((hash) =>
        crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
      );
  }

  return cachedSecretKeyPromise;
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function getExpiryTimestamp(ttlMinutes: number) {
  return Date.now() + ttlMinutes * 60 * 1000;
}

export function getUrlTokenTtlMinutes() {
  const value = Number(process.env.LMD_URL_TOKEN_TTL_MINUTES);
  if (!Number.isFinite(value)) {
    return DEFAULT_URL_TOKEN_TTL_MINUTES;
  }

  return value;
}

export function getSessionTtlMinutes() {
  const value = Number(process.env.LMD_SESSION_TTL_MINUTES);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_SESSION_TTL_MINUTES;
}

export async function createAccessToken(
  team: TeamSlug,
  ttlMinutes = getUrlTokenTtlMinutes()
) {
  const payload: AccessPayload = {
    team,
    exp: ttlMinutes <= 0 ? null : getExpiryTimestamp(ttlMinutes)
  };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await getSecretKey(),
    plaintext
  );

  return `${encodeBase64Url(iv)}.${encodeBase64Url(new Uint8Array(ciphertext))}`;
}

export async function readAccessToken(token: string) {
  try {
    const [encodedIv, encodedCiphertext] = token.split(".");

    if (!encodedIv || !encodedCiphertext) {
      return null;
    }

    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decodeBase64Url(encodedIv) },
      await getSecretKey(),
      decodeBase64Url(encodedCiphertext)
    );
    const payload = JSON.parse(new TextDecoder().decode(plaintext)) as AccessPayload;

    if (!TEAM_SLUGS.includes(payload.team)) {
      return null;
    }

    if (payload.exp !== null && payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
