import { test, expect } from '@playwright/test'

function uniqueEmail() {
    return `haven.test+${Date.now()}@example.com`
}

test.describe('Sign Up', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sign-up')
    })

    test('renders the form with all required fields', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
        await expect(page.getByLabel('Name')).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
    })

    test('redirects to /onboarding after a successful sign-up', async ({ page }) => {
        await page.getByLabel('Name').fill('Jane Doe')
        await page.getByLabel('Email').fill(uniqueEmail())
        await page.getByLabel('Password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()

        await expect(page).toHaveURL('/onboarding')
    })

    test('disables the button and updates its label while submitting', async ({ page }) => {
        await page.getByLabel('Name').fill('Jane Doe')
        await page.getByLabel('Email').fill(uniqueEmail())
        await page.getByLabel('Password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()

        const pendingButton = page.getByRole('button', { name: 'Creating account…' })
        await expect(pendingButton).toBeDisabled()
    })

    test('shows an error toast when the email is already registered', async ({ page, browser }) => {
        const email = uniqueEmail()

        const setupContext = await browser.newContext()
        const setupPage = await setupContext.newPage()
        await setupPage.goto('/sign-up')
        await setupPage.getByLabel('Name').fill('Jane Doe')
        await setupPage.getByLabel('Email').fill(email)
        await setupPage.getByLabel('Password').fill('Password1!')
        await setupPage.getByRole('button', { name: 'Create account' }).click()
        await expect(setupPage).toHaveURL('/onboarding')
        await setupContext.close()

        // Will attempt to register same email again
        await page.getByLabel('Name').fill('Jane Doe')
        await page.getByLabel('Email').fill(email)
        await page.getByLabel('Password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()

        // Toast error
        await expect(page.locator('[data-sonner-toast]')).toBeVisible()
    })

    test('"Sign in" link navigates to /login', async ({ page }) => {
        await page.getByRole('link', { name: 'Sign in' }).click()
        await expect(page).toHaveURL('/login')
    })

    test('"Go back" link navigates to the homepage', async ({ page }) => {
        await page.getByRole('link', { name: /go back/i }).click()
        await expect(page).toHaveURL('/')
    })
})