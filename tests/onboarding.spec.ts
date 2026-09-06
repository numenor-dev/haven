import { test, expect, type Page } from '@playwright/test'

function uniqueEmail() {
    return `haven.test+${Date.now()}@example.com`
}

function uniqueFirmName() {
    return `Test Firm ${Date.now()}`
}

// Redirects to /onboarding on successful sign-up
async function newSignUp(page: Page): Promise<void> {
    await page.goto('/sign-up')
    await page.getByLabel('Name').fill('Test Attorney')
    await page.getByLabel('Email').fill(uniqueEmail())
    await page.getByLabel('Password').fill('Password1!')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(
        page.getByText('Please set up your firm')
    ).toBeVisible({ timeout: 15000 })
}

test.describe('Onboarding', () => {
    test.beforeEach(async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'webkit drops session cookie during redirects')
        await newSignUp(page)
    })

    test('renders the firm name form', async ({ page }) => {
        await expect(page.getByText('Please set up your firm')).toBeVisible()
        await expect(page.getByLabel('Firm Name')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    })

    test('Continue button is disabled before any input', async ({ page }) => {
        await expect(page.getByLabel('Firm Name')).toBeEditable()
        await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
    })

    test('shows the custom URL when the slug is available', async ({ page }) => {
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByText(/Your custom URL is:/)).toBeVisible({ timeout: 5000 })
    })

    test('Continue button becomes enabled when slug is available', async ({ page }) => {
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
    })

    test('shows taken message and keeps Continue disabled when slug is already in use', async ({ page, browser }) => {
        const firmName = uniqueFirmName()

        // Unique slug is set for the firm and is redirected to /dashboard
        await page.getByLabel('Firm Name').fill(firmName)
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
        await page.getByRole('button', { name: 'Continue' }).click()
        await expect(
            page.getByRole('heading', { name: 'Clients' })
        ).toBeVisible({ timeout: 15000 })


        // Second user attempts to enter a duplicate firm name in a new session
        const context2 = await browser.newContext()
        const page2 = await context2.newPage()
        await newSignUp(page2)
        await page2.getByLabel('Firm Name').fill(firmName)
        await expect(page2.getByText(/is taken/)).toBeVisible({ timeout: 5000 })
        await expect(page2.getByRole('button', { name: 'Continue' })).toBeDisabled()
        await context2.close()
    })

    test('clears the slug status when the firm name field is emptied', async ({ page }) => {
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByText(/Your custom URL is:/)).toBeVisible({ timeout: 5000 })

        await page.getByLabel('Firm Name').clear()
        await expect(page.getByText(/Your custom URL is:/)).not.toBeVisible()
        await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()
    })

    test('shows "Creating your firm…" and disables the button while submitting', async ({ page }) => {
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
        await page.getByRole('button', { name: 'Continue' }).click()
        await expect(page.getByRole('button', { name: 'Creating your firm…' })).toBeDisabled()
    })

    test('redirects to /dashboard after creating the firm', async ({ page }) => {
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
        await page.getByRole('button', { name: 'Continue' }).click()
        await expect(
            page.getByRole('heading', { name: 'Clients' })
        ).toBeVisible({ timeout: 15000 })

    })
})

test.describe('Full attorney registration flow', () => {
    test('sign-up, onboarding, and dashboard workflow end to end', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'webkit drops session cookie during redirects')
        // Sign up
        await page.goto('/sign-up')
        await page.getByLabel('Name').fill('Jane Attorney')
        await page.getByLabel('Email').fill(uniqueEmail())
        await page.getByLabel('Password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()
        await expect(
            page.getByText('Please set up your firm')
        ).toBeVisible({ timeout: 15000 })

        // Create firm
        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
        await page.getByRole('button', { name: 'Continue' }).click()

        // Land on dashboard
        await expect(
            page.getByRole('heading', { name: 'Clients' })
        ).toBeVisible({ timeout: 15000 })

    })

    test('navigating back to /onboarding after firm is created redirects to /dashboard', async ({ page, browserName }) => {
        test.skip(browserName === 'webkit', 'webkit drops session cookie during redirects')
        await page.goto('/sign-up')
        await page.getByLabel('Name').fill('Jane Attorney')
        await page.getByLabel('Email').fill(uniqueEmail())
        await page.getByLabel('Password').fill('Password1!')
        await page.getByRole('button', { name: 'Create account' }).click()
        await expect(
            page.getByText('Please set up your firm')
        ).toBeVisible({ timeout: 15000 })

        await page.getByLabel('Firm Name').fill(uniqueFirmName())
        await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled({ timeout: 5000 })
        await page.getByRole('button', { name: 'Continue' }).click()
        await expect(
            page.getByRole('heading', { name: 'Clients' })
        ).toBeVisible({ timeout: 15000 })

        // Try to go back
        await page.goto('/onboarding')
        await expect(
            page.getByRole('heading', { name: 'Clients' })
        ).toBeVisible({ timeout: 15000 })
    })
})