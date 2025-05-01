# Playwright Test Framework for OWASP Juice Shop

This framework provides a structured approach to UI automation testing for the OWASP Juice Shop application using Playwright with TypeScript.

## Features

- Page Object Model (POM) design pattern
- TypeScript support
- Reusable utilities for common operations
- Environment switching (local, dev, staging, production)
- Headless mode support
- Parallel test execution
- Reporting
- Linting with ESLint

## Project Structure

```
e2e-tests/
├── config/                  # Configuration files
│   ├── base.config.ts       # Base Playwright configuration
│   ├── environments.ts      # Environment configurations
│   ├── headless.config.ts   # Headless mode configuration
│   ├── parallel.config.ts   # Parallel execution configuration
│   └── env.config.ts        # Environment-specific configuration
├── src/
│   ├── pages/               # Page Object Models
│   │   ├── BasePage.ts      # Base page with common methods
│   │   ├── LoginPage.ts     # Login page object
│   │   ├── HomePage.ts      # Home page object
│   │   ├── ProductPage.ts   # Product page object
│   │   └── BasketPage.ts    # Basket page object
│   └── utils/               # Utility functions
│       ├── auth.ts          # Authentication utilities
│       ├── navigation.ts    # Navigation utilities
│       ├── testData.ts      # Test data generation
│       └── helpers.ts       # Helper functions
├── tests/                   # Test files
│   └── example.spec.ts      # Example test
├── playwright.config.ts     # Main Playwright configuration
├── package.json             # Project dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the e2e-tests directory
3. Install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npx playwright install
```

### Running Tests

Run tests in normal mode:

```bash
npm test
```

Run tests in headless mode:

```bash
npm run test:headless
```

Run tests in UI mode:

```bash
npm run test:ui
```

Run tests in debug mode:

```bash
npm run test:debug
```

Run tests in parallel:

```bash
npm run test:parallel
```

Run tests in specific environment:

```bash
npm run test:local
npm run test:dev
npm run test:staging
npm run test:prod
```

View test report:

```bash
npm run report
```

## Linting and Verification

The framework includes ESLint for code quality and style checking. ESLint is configured with TypeScript and Playwright-specific rules.

Run linting:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint:fix
```

Verify the project (lint and test):

```bash
npm run verify
```

## Headless Mode

Headless mode runs tests without a visible browser UI, which is useful for CI/CD pipelines. To run tests in headless mode:

```bash
npm run test:headless
```

This uses the configuration in `config/headless.config.ts`.

## Environment Switching

The framework supports running tests against different environments. Environment configurations are defined in `config/environments.ts`.

To run tests against a specific environment:

```bash
# Set the ENV environment variable
ENV=dev npm test

# Or use the predefined scripts
npm run test:local
npm run test:dev
npm run test:staging
npm run test:prod
```

## Parallel Test Execution

The framework supports running tests in parallel to speed up test execution. Parallel execution is configured in `config/parallel.config.ts`.

To run tests in parallel:

```bash
npm run test:parallel
```

You can also specify the number of workers in the `.env` file:

```
WORKERS=4
```

The framework includes example tests in `tests/parallel.spec.ts` that demonstrate how to:
- Run tests in parallel using `test.describe.configure({ mode: 'parallel' })`
- Run tests in sequence when needed using `test.describe.configure({ mode: 'serial' })`
- Create multiple test cases that run in parallel
