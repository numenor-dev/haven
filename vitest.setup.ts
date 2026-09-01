import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
}))

afterEach(() => {
  vi.clearAllMocks()
})