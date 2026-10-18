import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  fetchPrediction,
  type PredictionInput,
  type PredictionOutput,
} from '../api/prediction'
import { predictionCases } from '../fixtures/predictionCases'

const fields: {
  name: keyof PredictionInput
  label: string
  help: string
  integer: boolean
}[] = [
  {
    name: 'idade',
    label: 'Idade',
    help: 'Idade em anos completos.',
    integer: true,
  },
  {
    name: 'gestacoes',
    label: 'Gestações',
    help: 'Número de gestações registradas.',
    integer: true,
  },
  {
    name: 'glicose_plasmatica',
    label: 'Glicose plasmática',
    help: 'Medida de glicose plasmática do registro.',
    integer: true,
  },
  {
    name: 'pressao_arterial_diastolica',
    label: 'Pressão arterial diastólica',
    help: 'Medida da pressão arterial diastólica.',
    integer: true,
  },
  {
    name: 'espessura_triceps',
    label: 'Espessura do tríceps',
    help: 'Medida da dobra cutânea na região do tríceps.',
    integer: true,
  },
  {
    name: 'insulina_serica',
    label: 'Insulina sérica',
    help: 'Medida de insulina sérica do registro.',
    integer: true,
  },
  {
    name: 'imc',
    label: 'IMC',
    help: 'Índice de massa corporal.',
    integer: false,
  },
  {
    name: 'indice_hereditariedade_diabetes',
    label: 'Índice de hereditariedade de diabetes',
    help: 'Índice numérico presente no dataset; não é uma resposta de sim ou não.',
    integer: false,
  },
]

type FormValues = Record<keyof PredictionInput, string>
type PredictionState =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; result: PredictionOutput }

function emptyForm(): FormValues {
  return Object.fromEntries(fields.map(({ name }) => [name, ''])) as FormValues
}

export function LandingPage() {
  const [values, setValues] = useState<FormValues>(emptyForm)
  const [state, setState] = useState<PredictionState>({ status: 'idle' })
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const request = useRef<AbortController | null>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (state.status === 'success' || state.status === 'error')
      resultHeading.current?.focus()
  }, [state.status])

  function clearResult() {
    request.current?.abort()
    request.current = null
    setState({ status: 'idle' })
  }

  function resetForm() {
    clearResult()
    setValues(emptyForm())
    setSelectedCase(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    request.current?.abort()
    const payload = {} as PredictionInput
    for (const field of fields) {
      const value = Number(values[field.name])
      if (
        values[field.name].trim() === '' ||
        !Number.isFinite(value) ||
        value < 0 ||
        (field.integer && !Number.isInteger(value))
      ) {
        setState({
          status: 'error',
          message: `Confira o campo ${field.label}. Informe um número ${field.integer ? 'inteiro ' : ''}maior ou igual a zero.`,
        })
        return
      }
      payload[field.name] = value
    }
    const controller = new AbortController()
    request.current = controller
    setState({ status: 'loading' })
    try {
      const result = await fetchPrediction(payload, controller.signal)
      if (!controller.signal.aborted) setState({ status: 'success', result })
    } catch (error) {
      if (!controller.signal.aborted) {
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Não foi possível concluir a consulta.',
        })
      }
    } finally {
      if (request.current === controller) request.current = null
    }
  }

  return (
    <main className="prediction-page">
      <section className="prediction-intro" aria-labelledby="prediction-title">
        <p className="eyebrow">Projeto acadêmico · UFABC</p>
        <h1 id="prediction-title">Predição de diabetes</h1>
        <p>Preencha os dados ou escolha um exemplo para consultar o modelo.</p>
        <p className="educational-note">
          Demonstração educacional. O resultado não constitui diagnóstico
          médico.
        </p>
      </section>

      <div className="prediction-layout">
        <section className="form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <span className="step-number" aria-hidden="true">
              01
            </span>
            <h2 id="form-title">Dados para a consulta</h2>
          </div>
          <div
            className="case-picker"
            role="group"
            aria-labelledby="cases-title"
          >
            <h3 id="cases-title">Casos de teste</h3>
            <p>
              Cinco registros de exemplo do dataset NIDDK. Os botões apenas
              preenchem os campos.
            </p>
            <div className="case-buttons">
              {predictionCases.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  aria-pressed={selectedCase === item.name}
                  onClick={() => {
                    clearResult()
                    setValues(
                      Object.fromEntries(
                        Object.entries(item.values).map(([key, value]) => [
                          key,
                          String(value),
                        ]),
                      ) as FormValues,
                    )
                    setSelectedCase(item.name)
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} onReset={resetForm}>
            <fieldset
              disabled={state.status === 'loading'}
              className="fields-grid"
            >
              <legend className="sr-only">
                Oito atributos utilizados pelo modelo. Todos são obrigatórios.
              </legend>
              {fields.map((field) => (
                <div className="form-field" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode={field.integer ? 'numeric' : 'decimal'}
                    min="0"
                    step={field.integer ? '1' : 'any'}
                    required
                    value={values[field.name]}
                    aria-describedby={`${field.name}-help`}
                    onChange={(event) => {
                      clearResult()
                      setValues((previous) => ({
                        ...previous,
                        [field.name]: event.target.value,
                      }))
                      setSelectedCase(null)
                    }}
                  />
                  <small id={`${field.name}-help`}>{field.help}</small>
                </div>
              ))}
            </fieldset>
            <div className="form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={state.status === 'loading'}
              >
                {state.status === 'loading'
                  ? 'Consultando…'
                  : 'Consultar modelo'}
              </button>
              <button type="reset" className="secondary-button">
                Limpar formulário
              </button>
            </div>
          </form>
        </section>

        <section
          className="result-panel"
          aria-labelledby="result-title"
          aria-busy={state.status === 'loading'}
        >
          <div className="panel-heading">
            <span className="step-number" aria-hidden="true">
              02
            </span>
            <h2 id="result-title" ref={resultHeading} tabIndex={-1}>
              Resultado da predição
            </h2>
          </div>
          <div aria-live="polite" aria-atomic="true">
            {state.status === 'idle' && (
              <div className="empty-result">
                <span className="result-symbol" aria-hidden="true">
                  ◇
                </span>
                <h3>Aguardando consulta</h3>
                <p>O resultado aparecerá aqui após o envio do formulário.</p>
              </div>
            )}
            {state.status === 'loading' && (
              <p role="status" className="result-message">
                Consultando o modelo. Aguarde…
              </p>
            )}
            {state.status === 'error' && (
              <div role="alert" className="prediction-error">
                <h3>Consulta não concluída</h3>
                <p>{state.message}</p>
              </div>
            )}
            {state.status === 'success' && (
              <div className="prediction-result">
                <p className="result-label">
                  Probabilidade estimada para a classe 1
                </p>
                <p className="probability">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                    maximumFractionDigits: 1,
                  }).format(state.result.probability_diabetes)}
                </p>
                <p className="class-result">
                  Classe {state.result.predicted_class} ·{' '}
                  {state.result.predicted_class === 1
                    ? 'Diabetes'
                    : 'Sem diabetes'}
                </p>
                <p className="result-caption">
                  Classificação do modelo segundo os rótulos do dataset. A
                  estimativa não confirma nem descarta um diagnóstico.
                </p>
                <dl className="prediction-meta">
                  <div>
                    <dt>Modelo</dt>
                    <dd>{state.result.model_name}</dd>
                  </div>
                  <div>
                    <dt>Versão</dt>
                    <dd>{state.result.model_version}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
