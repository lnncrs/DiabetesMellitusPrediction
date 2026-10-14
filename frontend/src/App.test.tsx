import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import App from './App'

const mockFetch = vi.fn<typeof fetch>()

globalThis.fetch = mockFetch

afterEach(() => {
  cleanup()
  mockFetch.mockReset()
})

describe('App', () => {
  it('shows the initial checking state', () => {
    mockFetch.mockImplementation(() => new Promise(() => undefined))

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Verificando conexão')
  })

  it('shows the online state after a successful health response', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'ok',
          serviceName: 'Diabetes Mellitus Prediction',
          version: '0.1.0',
          environment: 'test',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    render(<App />)

    expect(await screen.findByRole('status')).toHaveTextContent('API online')
    const serviceDetails = screen.getByLabelText('Informações do serviço')
    expect(
      within(serviceDetails).getByText('Diabetes Mellitus Prediction'),
    ).toBeInTheDocument()
    expect(within(serviceDetails).getByText('0.1.0')).toBeInTheDocument()
    expect(within(serviceDetails).getByText('test')).toBeInTheDocument()
  })

  it('shows the offline state after a failed health request', async () => {
    mockFetch.mockRejectedValue(new Error('network failed'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('API offline')
    })
  })

  it('renders accessible status output', () => {
    mockFetch.mockImplementation(() => new Promise(() => undefined))

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Diabetes Mellitus Prediction' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName('')
    expect(screen.getByRole('status')).toHaveTextContent('Verificando conexão')
  })

  it('recovers when the backend becomes available and the user retries', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network failed'))
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    )
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('API offline')
    })
    await userEvent.click(
      screen.getByRole('button', { name: 'Verificar novamente' }),
    )
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('API online')
    })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('shows offline when the API returns an HTTP error', async () => {
    mockFetch.mockResolvedValue(new Response('Unavailable', { status: 503 }))
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('API offline')
    })
  })

  it('requests backend health through /api', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ status: 'ok' })))

    render(<App />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/health/live',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })
  })
})
