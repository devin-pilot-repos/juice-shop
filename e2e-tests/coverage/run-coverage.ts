import { CoverageReporter } from './reporter';
import fs from 'fs';
import path from 'path';

async function runCoverageReport() {
  const resultsPath = path.join(__dirname, '../playwright-report/results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.error(`Test results file not found at ${resultsPath}`);
    console.error('Please run the tests with JSON reporter first:');
    console.error('npx playwright test --reporter=json,html');
    process.exit(1);
  }
  
  const reporter = new CoverageReporter();
  reporter.processTestResults(resultsPath);
  reporter.generateReports();
  
  console.log('Coverage reports generated successfully!');
}

runCoverageReport().catch(console.error);
