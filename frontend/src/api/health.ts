export type HealthResponse = {
  status: string
  serviceName?: string
  version?: string
  environment?: string
}

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  const timeout = AbortSignal.timeout(5000)
  const response = await fetch('/api/health/live', {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  })

  if (!response.ok) {
    throw new Error('Health request failed')
  }

  return response.json() as Promise<HealthResponse>
}
