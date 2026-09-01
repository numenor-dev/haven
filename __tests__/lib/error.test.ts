import { describe, it, expect } from 'vitest'
import {
    AppError,
    FirmNotFoundError,
    AttorneyNotFoundError,
    TrialExhaustedError,
    SessionNotFoundError,
    ConcurrentSessionError,
    ChatRecordNotFoundError,
    handleApiError,
} from '@/lib/errors'

const fixtures = [
    new FirmNotFoundError('acme-law'),
    new AttorneyNotFoundError('att_123'),
    new TrialExhaustedError(),
    new SessionNotFoundError('sess_abc'),
    new ConcurrentSessionError('att_123'),
    new ChatRecordNotFoundError('sess_abc'),
]


describe('AppError subclasses', () => {
    it.each(fixtures.map(err => ({ name: err.name, err })))(
        '$name is instanceof AppError and Error',
        ({ err }) => {
            expect(err).toBeInstanceOf(AppError)
            expect(err).toBeInstanceOf(Error)
        }
    )

    it.each(fixtures.map(err => ({ name: err.name, err })))(
        '$name.name matches the class name',
        ({ name, err }) => {
            expect(err.name).toBe(name)
        }
    )
})

describe('error messages', () => {
    it('FirmNotFoundError includes the slug', () => {
        expect(new FirmNotFoundError('acme-law').message).toBe('No firm found for acme-law')
    })

    it('AttorneyNotFoundError includes the attorney ID', () => {
        expect(new AttorneyNotFoundError('att_123').message).toBe('Attorney not found: att_123')
    })

    it('TrialExhaustedError has a fixed message', () => {
        expect(new TrialExhaustedError().message).toBe('Trial already used')
    })

    it('SessionNotFoundError includes the session ID', () => {
        expect(new SessionNotFoundError('sess_abc').message).toBe('Session not found: sess_abc')
    })

    it('ConcurrentSessionError includes the attorney ID', () => {
        expect(new ConcurrentSessionError('att_123').message).toBe('Active trial att_123 already in progress')
    })

    it('ChatRecordNotFoundError includes the session ID', () => {
        expect(new ChatRecordNotFoundError('sess_abc').message).toBe('Chat record not found: sess_abc')
    })
})

describe('handleApiError', () => {
    it.each([
        { label: 'FirmNotFoundError', error: new FirmNotFoundError('acme-law'), status: 404 },
        { label: 'AttorneyNotFoundError', error: new AttorneyNotFoundError('att_123'), status: 404 },
        { label: 'SessionNotFoundError', error: new SessionNotFoundError('sess_abc'), status: 404 },
        { label: 'ChatRecordNotFoundError', error: new ChatRecordNotFoundError('sess_abc'), status: 404 },
        { label: 'TrialExhaustedError', error: new TrialExhaustedError(), status: 403 },
        { label: 'ConcurrentSessionError', error: new ConcurrentSessionError('att_123'), status: 409 },
    ])('maps $label → $status', ({ error, status }) => {
        expect(handleApiError(error).status).toBe(status)
    })

    it('passes err.message through to the response body', async () => {
        const err = new FirmNotFoundError('acme-law')
        const body = await handleApiError(err).json()
        expect(body.error).toBe('No firm found for acme-law')
    })

    it('maps an unknown Error → 500', () => {
        expect(handleApiError(new Error('unexpected')).status).toBe(500)
    })

    it('returns a generic message for unknown errors, not the raw error message', async () => {
        const body = await handleApiError(new Error('db connection string')).json()
        expect(body.error).toBe('Internal server error')
    })

    it.each([
        { label: 'string', value: 'something broke' },
        { label: 'null', value: null },
        { label: 'undefined', value: undefined },
        { label: 'object', value: { code: 42 } },
    ])('does not throw on a non-Error value ($label)', ({ value }) => {
        expect(() => handleApiError(value)).not.toThrow()
        expect(handleApiError(value).status).toBe(500)
    })
})