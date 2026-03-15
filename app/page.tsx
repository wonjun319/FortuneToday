import { LuNfc } from "react-icons/lu";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.e === "string" ? params.e : null;

  const errorMessage =
    errorCode === "invalid-token" || errorCode === "unauthorized"
      ? "등록된 태그를 다시 찍어 오늘의 운세를 확인해 주세요."
      : null;

  return (
    <main className="home-shell">
      <section className="home-stage">
        <div className="home-glow home-glow--one" />
        <div className="home-glow home-glow--two" />

        <div className="home-hero">
          <p className="home-label">LuckMatchDay</p>
          <div className="home-tagmark" aria-hidden="true">
            <LuNfc className="home-tagmark__icon" />
          </div>
          <div className="home-copy stack">
            <h1>오늘의 운세를 확인해보세요</h1>
          </div>

          {errorMessage ? (
            <div className="home-alert">
              <p>{errorMessage}</p>
            </div>
          ) : null}

          <div className="home-steps">
            <article className="home-card">
              <span className="home-card__index">01</span>
              <h2>태그 인식</h2>
              <p>키링이나 태그를 휴대폰 뒷면에 가까이 대어 주세요.</p>
            </article>
            <article className="home-card">
              <span className="home-card__index">02</span>
              <h2>링크 열기</h2>
              <p>인식된 링크를 열면 해당 팀 운세 페이지로 이동합니다.</p>
            </article>
            <article className="home-card">
              <span className="home-card__index">03</span>
              <h2>운세 확인</h2>
              <p>오늘의 흐름과 키플레이어를 바로 확인할 수 있습니다.</p>
            </article>
          </div>

          <div className="home-note">
            <strong>안내</strong>
            <p>등록된 태그를 찍으면 해당 팀의 오늘 운세 화면으로 바로 연결됩니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
