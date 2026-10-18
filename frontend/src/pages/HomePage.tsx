import { HealthStatus } from '../components/HealthStatus'

export function HomePage() {
  return (
    <main className="landing">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Projeto acadêmico · UFABC</p>
        <h1 id="page-title">Predição de Diabetes Mellitus</h1>
        <p>
          Explorar predição de diabetes, usabilidade e inteligência artificial
          explicável.
        </p>
      </section>

      <HealthStatus />
    </main>
  )
}
