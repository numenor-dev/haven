
import { describe, it, expect } from 'vitest'
import {
  capitalizeName,
  formatTitle,
  formatDate,
  formatEstateSize,
  yesNo
} from '@/lib/utils'


describe('capitalizeName', () => {


  it('capitalizes each word', () => {
    expect(capitalizeName('john doe')).toBe('John Doe')
  })

  it('is idempotent on already-correct input', () => {
    expect(capitalizeName('John Doe')).toBe('John Doe')
  })

  it('handles all-caps input', () => {
    expect(capitalizeName('JOHN DOE')).toBe('John Doe')
  })

  it('returns empty string for empty input', () => {
    expect(capitalizeName('')).toBe('')
  })

  it('does not return the raw lowercased string', () => {
    expect(capitalizeName('john doe')).not.toBe('john doe')
  })

  it('does not throw on whitespace-only input', () => {
    expect(() => capitalizeName('   ')).not.toThrow()
  })
})

describe('formatTitle', () => {
  
  it('returns em-dash for null', () => {
    expect(formatTitle(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatTitle(undefined)).toBe('—')
  })

  it('returns em-dash for empty string', () => {
    expect(formatTitle('')).toBe('—')
  })

  it('replaces underscores with spaces and title-cases', () => {
    expect(formatTitle('hello_world')).toBe('Hello World')
  })

  it('title-cases a plain space-separated string', () => {
    expect(formatTitle('hello world')).toBe('Hello World')
  })

  it('handles multiple underscores', () => {
    expect(formatTitle('one_two_three')).toBe('One Two Three')
  })

  it('handles a single word', () => {
    expect(formatTitle('hello')).toBe('Hello')
  })
})

describe('formatDate', () => {
  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('formats a Date object into a readable string', () => {
    const date = new Date(2025, 0, 15)
    const result = formatDate(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('accepts a date string', () => {
    const result = formatDate('2024-06-01T12:00:00')
    expect(result).toContain('June')
    expect(result).toContain('2024')
  })

  it('returns a non-empty, non-dash string for any valid date', () => {
    expect(formatDate(new Date())).not.toBe('—')
  })
})

describe('formatEstateSize', () => {
  it('returns em-dash for undefined', () => {
    expect(formatEstateSize(undefined)).toBe('—')
  })

  it.each([
    ['under_500k',  'Under $500,000'],
    ['500k_to_1m',  '$500,000 – $1,000,000'],
    ['1m_to_5m',    '$1,000,000 – $5,000,000'],
    ['over_5m',     'Over $5,000,000'],
    ['unknown',     'Unknown'],
  ])('maps "%s" to "%s"', (input, expected) => {
    expect(formatEstateSize(input)).toBe(expected)
  })

  it('falls back to formatTitle for an unmapped value', () => {
    expect(formatEstateSize('custom_range')).toBe('Custom Range')
  })
})

describe('yesNo', () => {
  it('returns "Yes" for true', () => {
    expect(yesNo(true)).toBe('Yes')
  })

  it('returns "No" for false', () => {
    expect(yesNo(false)).toBe('No')
  })

  it('returns em-dash for null', () => {
    expect(yesNo(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(yesNo(undefined)).toBe('—')
  })

  it('distinguishes false from null since false means no, not unkown', () => {
    expect(yesNo(false)).not.toBe('—')
  })
})