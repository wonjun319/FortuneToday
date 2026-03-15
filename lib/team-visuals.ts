import { existsSync } from "node:fs";
import { join } from "node:path";
import type { TeamSlug } from "@/lib/types";
import { getTeamRouteSlug } from "@/lib/team-route";

type TeamVisuals = {
  introImageSrc: string | null;
  loadingImageSrc: string | null;
};

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "avif"] as const;

function findTeamImage(team: TeamSlug, kind: "intro" | "loading") {
  const routeSlug = getTeamRouteSlug(team);

  for (const extension of IMAGE_EXTENSIONS) {
    const relativePath = join("team-images", routeSlug, `${kind}.${extension}`);
    const absolutePath = join(process.cwd(), "public", relativePath);

    if (existsSync(absolutePath)) {
      return `/${relativePath.replace(/\\/g, "/")}`;
    }
  }

  return null;
}

export function getTeamVisuals(team: TeamSlug): TeamVisuals {
  return {
    introImageSrc: findTeamImage(team, "intro"),
    loadingImageSrc: findTeamImage(team, "loading")
  };
}
