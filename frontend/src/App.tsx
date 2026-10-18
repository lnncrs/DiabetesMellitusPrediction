import { LandingPage } from './pages/LandingPage'
import { HomePage } from './pages/HomePage'
import './App.css'

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  return (
    <div className="app-shell">
      <header className="top-bar">
        <a
          className="brand-lockup"
          href="/"
          aria-label="Predição de Diabetes Mellitus"
        >
          <span className="brand-mark" aria-hidden="true">
            DM
          </span>
          <span>Predição de Diabetes Mellitus</span>
        </a>
        <nav className="site-nav" aria-label="Navegação principal">
          <a href="/home" aria-current={path === '/home' ? 'page' : undefined}>
            Home
          </a>
          <a href="/" aria-current={path === '/' ? 'page' : undefined}>
            Predição
          </a>
        </nav>
      </header>
      {path === '/' ? (
        <LandingPage />
      ) : path === '/home' ? (
        <HomePage />
      ) : (
        <main className="prediction-page">
          <h1>Página não encontrada</h1>
          <a href="/">Voltar ao formulário</a>
        </main>
      )}
    </div>
  )
}

export default App
