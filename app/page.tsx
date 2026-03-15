import Link from "next/link";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const hasInvalidToken = params.e === "invalid-token";

  return (
    <main className="stack">
      <h1>LuckMatchDay</h1>
      <p className="muted">
        NFC 키링을 태그하면 팀별 최근 10경기와 오늘의 승리 운세를 보여줍니다.
      </p>
      {hasInvalidToken ? (
        <div className="card">
          <strong>유효하지 않은 토큰입니다.</strong>
          <p className="muted">키링을 다시 스캔해 주세요.</p>
        </div>
      ) : null}
      <div className="card stack">
        <h2>URL 형식</h2>
        <p className="muted">NFC 태그에는 아래 형식만 저장합니다.</p>
        <code>https://luckmatchday.xyz/t/{"{token}"}</code>
      </div>
      <div className="card stack">
        <h2>예시 팀 페이지</h2>
        <Link href="/team/tigers">/team/tigers</Link>
      </div>
    </main>
  );
}
