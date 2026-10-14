import { useEffect, useState } from 'react'

import { fetchHealth, type HealthResponse } from '../api/health'

type HealthState = 'checking' | 'online' | 'offline'

const statusCopy: Record<HealthState, string> = {
  checking: 'Verificando conexão',
  online: 'API online',
  offline: 'API offline',
}

export function HealthStatus() {
  const [state, setState] = useState<HealthState>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchHealth(controller.signal)
      .then((response) => {
        setHealth(response)
        setState('online')
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        setHealth(null)
        setState('offline')
      })

    return () => controller.abort()
  }, [attempt])

  return (
    <section
      className="status-panel"
      data-state={state}
      aria-labelledby="status-title"
    >
      <h2 id="status-title" className="status-heading">
        Conexão com a API
      </h2>
      <div className="status-indicator" role="status" aria-live="polite">
        <span className="status-dot" aria-hidden="true" />
        <span>{statusCopy[state]}</span>
      </div>
      <p className="status-detail">
        {state === 'checking' && 'Aguardando resposta da API.'}
        {state === 'online' && 'A aplicação está conectada ao backend.'}
        {state === 'offline' &&
          'Não foi possível conectar. Confirme que o backend está iniciado.'}
      </p>
      <button
        type="button"
        disabled={state === 'checking'}
        onClick={() => {
          setState('checking')
          setHealth(null)
          setAttempt((value) => value + 1)
        }}
      >
        Verificar novamente
      </button>
      {health ? (
        <dl className="service-meta" aria-label="Informações do serviço">
          <div>
            <dt>Serviço</dt>
            <dd>{health.serviceName ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Versão</dt>
            <dd>{health.version ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Ambiente</dt>
            <dd>{health.environment ?? 'Não informado'}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}
