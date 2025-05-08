# Running Playwright Tests for OWASP Juice Shop

This guide explains how to run the Playwright tests against the public Juice Shop demo instance.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:

```bash
cd e2e-tests
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

The tests are configured to run against the public Juice Shop demo instance at https://juice-shop.herokuapp.com by default.

Run a specific test:

```bash
npx playwright test login-logout.spec.ts
```

Run all tests:

```bash
npx playwright test
```

Run tests with browser UI visible:

```bash
npx playwright test --headed
```

## Troubleshooting

### Chromium is blocked by corporate policy

If you encounter issues with Chromium being blocked, try using Firefox instead:

```bash
npx playwright test --project=firefox
```

### SSL Certificate Issues

If you encounter SSL certificate issues, you can configure npm to bypass SSL verification:

```bash
npm config set strict-ssl false
```

## Test Credentials

The tests use the following default credentials:

- Admin: admin@juice-sh.op / admin123
- Customer: demo@juice-sh.op / demo

These credentials are pre-configured in the environments.ts file.
