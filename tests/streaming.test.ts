import { describe, it, expect } from 'vitest'
import {
    parseSSELine,
    getTextDelta,
    isMessageStop,
    isSessionComplete,
    isStreamError,
} from '@/lib/streaming'
import type { StreamChunk } from '@/types/types'

const textDeltaChunk: StreamChunk = {
    type: 'content_block_delta',
    delta: { type: 'text_delta', text: 'Hello, world' },
}

const messageStopChunk: StreamChunk = { type: 'message_stop' }

const sessionCompleteChunk: StreamChunk = { type: 'session_complete' }

const errorChunk: StreamChunk = { type: 'error', error: 'Something went wrong' }

function toSSELine(chunk: StreamChunk): string {
    return `data: ${JSON.stringify(chunk)}`
}

describe('parseSSELine', () => {
    describe('lines that always return null', () => {
        it.each([
            ['empty string', ''],
            ['comment line', ': ping'],
            ['event: line', 'event: message'],
            ['id: line', 'id: 12345'],
        ])('%s', (_label, line) => {
            expect(parseSSELine(line)).toBeNull()
        })

        it('data: [DONE] sentinel', () => {
            expect(parseSSELine('data: [DONE]')).toBeNull()
        })

        it('malformed JSON', () => {
            expect(parseSSELine('data: {broken')).toBeNull()
        })

        // Valid JSON with an unknown type such as message_start,
        // content_block_start, message_delta, etc. are intentionally
        // ingnored and returns null
        it.each([
            'message_start',
            'message_delta',
            'content_block_start',
            'content_block_stop',
            'ping',
        ])('unknown type "%s" is filtered out', (type) => {
            expect(parseSSELine(`data: ${JSON.stringify({ type })}`)).toBeNull()
        })
    })

    describe('known chunk types are returned', () => {
        it('parses a content_block_delta chunk', () => {
            const result = parseSSELine(toSSELine(textDeltaChunk))
            expect(result).toMatchObject({ type: 'content_block_delta' })
        })

        it('parses a message_stop chunk', () => {
            expect(parseSSELine(toSSELine(messageStopChunk))).toMatchObject({ type: 'message_stop' })
        })

        it('parses a session_complete chunk', () => {
            expect(parseSSELine(toSSELine(sessionCompleteChunk))).toMatchObject({ type: 'session_complete' })
        })

        it('parses an error chunk', () => {
            expect(parseSSELine(toSSELine(errorChunk))).toMatchObject({ type: 'error' })
        })

        it('preserves the full payload — not just the type field', () => {
            const result = parseSSELine(toSSELine(textDeltaChunk))
            expect(result).toMatchObject({ delta: { type: 'text_delta', text: 'Hello, world' } })
        })
    })

    it('returns null for a JSON array payload', () => {
        expect(parseSSELine('data: []')).toBeNull()
    })

    it('returns null for a JSON null payload', () => {
        expect(parseSSELine('data: null')).toBeNull()
    })
})

describe('getTextDelta', () => {
    it('returns the text string from a text_delta chunk', () => {
        expect(getTextDelta(textDeltaChunk)).toBe('Hello, world')
    })
    
    it.each([
        ['message_stop', messageStopChunk],
        ['session_complete', sessionCompleteChunk],
        ['error', errorChunk],
    ])('returns null for %s chunks', (_label, chunk) => {
        expect(getTextDelta(chunk)).toBeNull()
    })

    it('returns empty string (not null) when text delta is an empty string', () => {
        const emptyDelta: StreamChunk = {
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: '' },
        }
        expect(getTextDelta(emptyDelta)).toBe('')
    })
})

describe('isMessageStop', () => {
    it('returns true for message_stop', () => {
        expect(isMessageStop(messageStopChunk)).toBe(true)
    })

    it.each([
        ['content_block_delta', textDeltaChunk],
        ['session_complete', sessionCompleteChunk],
        ['error', errorChunk],
    ])('returns false for %s', (_label, chunk) => {
        expect(isMessageStop(chunk)).toBe(false)
    })
})

describe('isSessionComplete', () => {
    it('returns true for session_complete', () => {
        expect(isSessionComplete(sessionCompleteChunk)).toBe(true)
    })

    it.each([
        ['content_block_delta', textDeltaChunk],
        ['message_stop', messageStopChunk],
        ['error', errorChunk],
    ])('returns false for %s', (_label, chunk) => {
        expect(isSessionComplete(chunk)).toBe(false)
    })
})

describe('isStreamError', () => {
    it('returns true for error chunks', () => {
        expect(isStreamError(errorChunk)).toBe(true)
    })

    it('narrows the type so error.error is accessible without a cast', () => {
        if (isStreamError(errorChunk)) {
            expect(typeof errorChunk.error).toBe('string')
        }
    })

    it.each([
        ['content_block_delta', textDeltaChunk],
        ['message_stop', messageStopChunk],
        ['session_complete', sessionCompleteChunk],
    ])('returns false for %s', (_label, chunk) => {
        expect(isStreamError(chunk)).toBe(false)
    })
})