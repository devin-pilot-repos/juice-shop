export interface TestResult {
  testFile: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  duration: number;
}

export interface WorkflowCoverage {
  workflowId: string;
  workflowName: string;
  description: string;
  importance: string;
  associatedChallenges?: string[];
  coveredByTests: string[];
  passedTests: number;
  totalTests: number;
  coveragePercentage: number;
}

export interface CoverageReport {
  timestamp: string;
  overallCoverage: number; // Percentage of workflows covered
  workflowCoverage: WorkflowCoverage[];
  testResults: TestResult[];
}
