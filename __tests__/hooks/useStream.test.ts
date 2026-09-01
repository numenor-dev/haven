import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useStream } from '@/components/hooks/useStream'
import type { StreamChunk, Message, StreamOptions } from '@/types/types'


function mockSSEResponse(chunks: StreamChunk[]): Response {
    const encoder = new TextEncoder()
    const text = chunks.map(chunk => `data: ${JSON.stringify(chunk)}`).join('\n') + '\n'
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode(text))
            controller.close()
        },
    })
    return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

function hangingFetch(_input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
    })
}

const textDeltaChunk: StreamChunk = {
    type: 'content_block_delta',
    delta: { type: 'text_delta', text: 'Hello' },
}

const secondDeltaChunk: StreamChunk = {
    type: 'content_block_delta',
    delta: { type: 'text_delta', text: ', world' },
}

const messageStopChunk: StreamChunk = { type: 'message_stop' }
const sessionCompleteChunk: StreamChunk = { type: 'session_complete' }
const errorChunk: StreamChunk = { type: 'error', error: 'API overloaded' }

const messages: Message[] = []
const demoOptions: StreamOptions = { isDemo: true, localHour: Date.now() }

function renderUseStream() {
    const onChunk = vi.fn()
    const onComplete = vi.fn()
    const onSessionComplete = vi.fn()
    const onError = vi.fn()

    const { result } = renderHook(() =>
        useStream({ onChunk, onComplete, onSessionComplete, onError })
    )

    return { result, onChunk, onComplete, onSessionComplete, onError }
}

describe('useStream', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    describe('startStream — happy path', () => {
        it('calls onChunk with the text from a text_delta chunk', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([textDeltaChunk, messageStopChunk])
            )

            const { result, onChunk } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onChunk).toHaveBeenCalledWith('Hello')
            expect(onChunk).toHaveBeenCalledTimes(1)
        })

        it('calls onChunk once per delta — multiple deltas fire multiple calls', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([textDeltaChunk, secondDeltaChunk, messageStopChunk])
            )

            const { result, onChunk } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello')
            expect(onChunk).toHaveBeenNthCalledWith(2, ', world')
            expect(onChunk).toHaveBeenCalledTimes(2)
        })

        it('calls onComplete when message_stop is received', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([textDeltaChunk, messageStopChunk])
            )

            const { result, onComplete } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onComplete).toHaveBeenCalledTimes(1)
        })

        it('calls onSessionComplete when session_complete is received', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([messageStopChunk, sessionCompleteChunk])
            )

            const { result, onSessionComplete } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onSessionComplete).toHaveBeenCalledTimes(1)
        })

        it('calls onComplete if the stream closes without a stop event', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([textDeltaChunk])
            )

            const { result, onComplete } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onComplete).toHaveBeenCalledTimes(1)
        })

        it('will not call onChunk for non-text chunks', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                mockSSEResponse([messageStopChunk])
            )

            const { result, onChunk } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onChunk).not.toHaveBeenCalled()
        })

        it('POSTs to /api/chat/stream with the message history and options', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(mockSSEResponse([messageStopChunk]))

            const history: Message[] = [{ role: 'user', content: 'I was in an accident' }]
            const { result } = renderUseStream()
            await result.current.startStream(history, demoOptions)

            expect(fetch).toHaveBeenCalledWith(
                '/api/chat/stream',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ messages: history, ...demoOptions }),
                })
            )
        })
    })

    describe('startStream with error handling', () => {
        it('calls onError if status not ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }))

            const { result, onError, onComplete } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onError).toHaveBeenCalledTimes(1)
            expect(onComplete).not.toHaveBeenCalled()
        })

        it('includes the status code in the onError message', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 503 }))

            const { result, onError } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('503') })
            )
        })

        it('calls onError with the error message from an error chunk', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(mockSSEResponse([errorChunk]))

            const { result, onError, onComplete } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'API overloaded' })
            )
            // onError returned early and onComplete must not also fire
            expect(onComplete).not.toHaveBeenCalled()
        })

        it('calls onError when fetch rejects (network failure)', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))

            const { result, onError } = renderUseStream()
            await result.current.startStream(messages, demoOptions)

            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Network failure' })
            )
        })
    })

    describe('cancelStream', () => {
        it('does not call onError when the stream is cancelled', async () => {
            vi.mocked(fetch).mockImplementationOnce(hangingFetch)

            const { result, onError } = renderUseStream()
            const promise = result.current.startStream(messages, demoOptions)
            result.current.cancelStream()
            await promise

            expect(onError).not.toHaveBeenCalled()
        })

        it('does not call onComplete when the stream is cancelled', async () => {
            vi.mocked(fetch).mockImplementationOnce(hangingFetch)

            const { result, onComplete } = renderUseStream()
            const promise = result.current.startStream(messages, demoOptions)
            result.current.cancelStream()
            await promise

            expect(onComplete).not.toHaveBeenCalled()
        })
    })

    describe('timeout', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        afterEach(() => {
            vi.useRealTimers()
        })

        it('calls onError with "Response timed out" after 180 seconds', async () => {
            vi.mocked(fetch).mockImplementationOnce(hangingFetch)

            const { result, onError } = renderUseStream()
            const promise = result.current.startStream(messages, demoOptions)

            await vi.advanceTimersByTimeAsync(180_000)
            await promise

            expect(onError).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Response timed out' })
            )
        })

        it('does not call onError before the timeout fires', async () => {
            vi.mocked(fetch).mockImplementationOnce(hangingFetch)

            const { result, onError } = renderUseStream()
            result.current.startStream(messages, demoOptions)

            await vi.advanceTimersByTimeAsync(179_999)

            expect(onError).not.toHaveBeenCalled()
        })
    })
})