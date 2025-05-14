# E2E Test Coverage Tracking

This tool tracks functional coverage of Playwright E2E tests against core business workflows.

## Features

- Maps tests to specific user journeys/workflows
- Creates a coverage matrix showing which tests cover which workflows
- Generates HTML, JSON, and CSV reports
- Calculates coverage percentage weighted by workflow importance
- Identifies test gaps

## Usage

1. Run the Playwright tests with JSON reporter:
   ```
   npx playwright test --reporter=json,html
   ```

2. Generate the coverage report:
   ```
   npm run coverage
   ```

3. View the reports in the `coverage-report` directory:
   - `coverage-report.html` - HTML report with visualizations
   - `coverage-report.json` - JSON data for programmatic use
   - `coverage-matrix.csv` - CSV matrix of workflows vs tests

## Configuration

The coverage tool is configured in `config.ts`:

- `CORE_WORKFLOWS` - Defines the core business workflows to track
- `TEST_WORKFLOW_MAPPING` - Maps tests to workflows

To add a new workflow:
1. Add it to the `CORE_WORKFLOWS` array
2. Update the `TEST_WORKFLOW_MAPPING` to link tests to the workflow

To add a new test:
1. Add it to the `TEST_WORKFLOW_MAPPING` array with the appropriate workflow IDs

## Coverage Calculation

Coverage is calculated as follows:
- Each workflow has a list of tests that cover it
- A workflow's coverage is the percentage of passing tests
- Overall coverage is weighted by workflow importance:
  - Critical: 60%
  - High: 30%
  - Medium: 10%

The target coverage is 80% across all workflows.
