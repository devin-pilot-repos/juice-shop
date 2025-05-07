echo "Verifying Playwright test fixes against public endpoint..."

export ENV=tunnel

echo "Running tests with Firefox..."
npx playwright test login-logout.spec.ts --project=firefox

echo "Running tests with Chromium..."
npx playwright test login-logout.spec.ts --project=chromium

echo "Running tests with WebKit..."
npx playwright test login-logout.spec.ts --project=webkit

echo "All tests completed."
