export type PredictionInput = {
  gestacoes: number
  glicose_plasmatica: number
  pressao_arterial_diastolica: number
  espessura_triceps: number
  insulina_serica: number
  imc: number
  indice_hereditariedade_diabetes: number
  idade: number
}

export type PredictionOutput = {
  predicted_class: 0 | 1
  probability_diabetes: number
  model_name: string
  model_version: number
}

export async function fetchPrediction(
  inputs: PredictionInput,
  signal: AbortSignal,
): Promise<PredictionOutput> {
  let response: Response
  try {
    response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputs),
      signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
    })
  } catch (error) {
    if (signal.aborted) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error(
        'A consulta demorou mais que o esperado. Tente novamente.',
        { cause: error },
      )
    }
    throw new Error(
      'Não foi possível conectar à API. Verifique a conexão e tente novamente.',
      { cause: error },
    )
  }
  if (!response.ok) {
    if (response.status === 503)
      throw new Error(
        'O modelo está indisponível. Tente novamente após iniciar a API e carregar o modelo.',
      )
    if (response.status === 422)
      throw new Error(
        'Os dados não foram aceitos. Confira os campos e tente novamente.',
      )
    throw new Error('Não foi possível concluir a predição. Tente novamente.')
  }
  const result: unknown = await response.json().catch(() => null)
  if (
    !result ||
    typeof result !== 'object' ||
    !('predicted_class' in result) ||
    ![0, 1].includes(result.predicted_class as number) ||
    !('probability_diabetes' in result) ||
    typeof result.probability_diabetes !== 'number' ||
    !Number.isFinite(result.probability_diabetes) ||
    result.probability_diabetes < 0 ||
    result.probability_diabetes > 1 ||
    !('model_name' in result) ||
    typeof result.model_name !== 'string' ||
    !result.model_name ||
    !('model_version' in result) ||
    typeof result.model_version !== 'number' ||
    !Number.isInteger(result.model_version) ||
    result.model_version < 1
  )
    throw new Error('A API retornou um resultado inválido. Tente novamente.')
  return result as PredictionOutput
}
