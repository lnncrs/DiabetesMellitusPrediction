import { HealthStatus } from '../components/HealthStatus'

export function LandingPage() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand-lockup" aria-label="Diabetes Mellitus Prediction">
          <span className="brand-mark" aria-hidden="true">
            DM
          </span>
          <span>Diabetes Mellitus Prediction</span>
        </div>
        <span className="runtime-label">FastAPI + React + TypeScript</span>
      </header>

      <main className="landing">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Projeto acadêmico · UFABC</p>
          <h1 id="page-title">Diabetes Mellitus Prediction</h1>
          <p>
            Uma experiência em construção para explorar predição de diabetes,
            usabilidade e inteligência artificial explicável.
          </p>
        </section>

        <HealthStatus />
      </main>
    </div>
  )
}
