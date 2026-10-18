import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { predictionCases } from './fixtures/predictionCases'

const mockFetch = vi.fn<typeof fetch>()
const result = {
  predicted_class: 1,
  probability_diabetes: 0.823,
  model_name: 'niddk-diabetes-xgboost',
  model_version: 5,
}

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  vi.stubGlobal('fetch', mockFetch)
})
afterEach(() => {
  cleanup()
  mockFetch.mockReset()
  vi.unstubAllGlobals()
})

describe('Formulário de predição', () => {
  it('opens the form at / with empty required fields and home navigation', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Predição de diabetes' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/home',
    )
    expect(screen.getAllByRole('spinbutton')).toHaveLength(8)
    for (const input of screen.getAllByRole('spinbutton')) {
      expect(input).toHaveValue(null)
      expect(input).toBeRequired()
    }
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it.each(predictionCases)(
    '$name fills all eight fields without submitting',
    async (item) => {
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: item.name }))
      for (const [name, value] of Object.entries(item.values)) {
        expect(document.getElementById(name)).toHaveValue(value)
      }
      expect(mockFetch).not.toHaveBeenCalled()
    },
  )

  it('posts numeric fields and shows the prediction and model version', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(result)))
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    expect(await screen.findByText('82,3%')).toBeInTheDocument()
    expect(screen.getByText('Classe 1 · Diabetes')).toBeInTheDocument()
    expect(screen.getByText('niddk-diabetes-xgboost')).toBeInTheDocument()
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/predict')
    expect(options?.method).toBe('POST')
    expect(JSON.parse(options?.body as string)).toEqual(
      predictionCases[0].values,
    )
    expect(
      screen.getByRole('heading', { name: 'Resultado da predição' }),
    ).toHaveFocus()
  })

  it('clears fields and result', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(result)))
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 2' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    await screen.findByText('82,3%')
    await userEvent.click(
      screen.getByRole('button', { name: 'Limpar formulário' }),
    )
    expect(screen.queryByText('82,3%')).not.toBeInTheDocument()
    expect(screen.getByText('Aguardando consulta')).toBeInTheDocument()
    for (const input of screen.getAllByRole('spinbutton'))
      expect(input).toHaveValue(null)
  })

  it('discards the old prediction when another case is selected', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify(result)))
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    await screen.findByText('82,3%')
    await userEvent.click(screen.getByRole('button', { name: 'Caso 3' }))
    expect(screen.queryByText('82,3%')).not.toBeInTheDocument()
  })

  it('does not submit an incomplete or fractional integer input', () => {
    render(<App />)
    const form = screen
      .getByRole('button', { name: 'Consultar modelo' })
      .closest('form')!
    fireEvent.submit(form)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Confira o campo')
  })

  it.each([503, 422, 500])(
    'handles HTTP %i without stale results',
    async (status) => {
      mockFetch.mockResolvedValue(new Response('Unavailable', { status }))
      render(<App />)
      await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
      await userEvent.click(
        screen.getByRole('button', { name: 'Consultar modelo' }),
      )
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Consulta não concluída',
      )
      expect(screen.queryByText('82,3%')).not.toBeInTheDocument()
    },
  )

  it('handles a network failure and permits retry', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'))
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(result)))
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    await screen.findByRole('alert')
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    expect(await screen.findByText('82,3%')).toBeInTheDocument()
  })

  it('rejects malformed output', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ ...result, probability_diabetes: 2 })),
    )
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'resultado inválido',
    )
  })

  it('reset cancels the request and prevents a late result', async () => {
    let finish!: (response: Response) => void
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Caso 1' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Consultar modelo' }),
    )
    expect(screen.getByRole('button', { name: 'Consultando…' })).toBeDisabled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Limpar formulário' }),
    )
    finish(new Response(JSON.stringify(result)))
    await waitFor(() =>
      expect(screen.getByText('Aguardando consulta')).toBeInTheDocument(),
    )
    expect(screen.queryByText('82,3%')).not.toBeInTheDocument()
  })
})
