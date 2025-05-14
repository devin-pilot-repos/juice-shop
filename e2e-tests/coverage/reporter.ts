import fs from 'fs';
import path from 'path';
import { CORE_WORKFLOWS, TEST_WORKFLOW_MAPPING, WorkflowDefinition } from './config';
import { CoverageReport, TestResult, WorkflowCoverage } from './types';

export class CoverageReporter {
  private testResults: TestResult[] = [];
  private reportDir: string;

  constructor(reportDir: string = path.join(__dirname, '../coverage-report')) {
    this.reportDir = reportDir;
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Process test results from Playwright JSON reporter
   * @param resultsPath Path to the Playwright JSON results file
   */
  public processTestResults(resultsPath: string): void {
    try {
      const rawData = fs.readFileSync(resultsPath, 'utf-8');
      const results = JSON.parse(rawData);

      if (!results.suites || !Array.isArray(results.suites)) {
        console.error('Invalid test results format');
        return;
      }

      this.testResults = this.extractTestResults(results);
    } catch (error) {
      console.error('Error processing test results:', error);
    }
  }

  /**
   * Extract test results from Playwright JSON reporter format
   */
  private extractTestResults(results: any): TestResult[] {
    const testResults: TestResult[] = [];

    const processSpecs = (specs: any[]): void => {
      if (!specs || !Array.isArray(specs)) return;

      specs.forEach(spec => {
        if (spec.tests && Array.isArray(spec.tests)) {
          spec.tests.forEach((test: any) => {
            const titleParts = test.title?.split(' › ') || [];
            const testFile = titleParts[0];
            const testName = titleParts[titleParts.length - 1];

            let status: 'passed' | 'failed' | 'skipped' | 'flaky' = 'skipped';
            if (test.status === 'passed') {
              status = 'passed';
            } else if (test.status === 'failed') {
              status = 'failed';
            } else if (test.status === 'skipped') {
              status = 'skipped';
            } else if (test.status === 'flaky') {
              status = 'flaky';
            }

            testResults.push({
              testFile,
              testName,
              status,
              duration: test.duration || 0
            });
          });
        }
      });
    };

    const processSuites = (suites: any[]): void => {
      if (!suites || !Array.isArray(suites)) return;

      suites.forEach(suite => {
        if (suite.specs) {
          processSpecs(suite.specs);
        }
        if (suite.suites) {
          processSuites(suite.suites);
        }
      });
    };

    processSuites(results.suites);
    return testResults;
  }

  /**
   * Generate coverage report based on test results and workflow definitions
   */
  public generateCoverageReport(): CoverageReport {
    const workflowCoverage: WorkflowCoverage[] = [];

    CORE_WORKFLOWS.forEach(workflow => {
      const coveringTests = TEST_WORKFLOW_MAPPING.filter(mapping => 
        mapping.workflowIds.includes(workflow.id)
      );

      let passedTests = 0;
      const coveredByTests: string[] = [];

      coveringTests.forEach(test => {
        const testResult = this.testResults.find(
          r => r.testFile && r.testName && 
             r.testFile.includes(test.testFile) && 
             r.testName.includes(test.testName)
        );

        if (testResult) {
          coveredByTests.push(`${testResult.testFile} - ${testResult.testName} (${testResult.status})`);
          
          if (testResult.status === 'passed' || testResult.status === 'flaky') {
            passedTests++;
          }
        } else {
          coveredByTests.push(`${test.testFile} - ${test.testName} (not run)`);
        }
      });

      const totalTests = coveringTests.length;
      const coveragePercentage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

      workflowCoverage.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        description: workflow.description,
        importance: workflow.importance,
        associatedChallenges: workflow.associatedChallenges,
        coveredByTests,
        passedTests,
        totalTests,
        coveragePercentage
      });
    });

    const criticalWorkflows = workflowCoverage.filter(w => w.importance === 'critical');
    const highWorkflows = workflowCoverage.filter(w => w.importance === 'high');
    const mediumWorkflows = workflowCoverage.filter(w => w.importance === 'medium');
    
    const criticalCoverage = this.calculateAverageCoverage(criticalWorkflows);
    const highCoverage = this.calculateAverageCoverage(highWorkflows);
    const mediumCoverage = this.calculateAverageCoverage(mediumWorkflows);
    
    const overallCoverage = (
      (criticalCoverage * 0.6) + 
      (highCoverage * 0.3) + 
      (mediumCoverage * 0.1)
    );

    return {
      timestamp: new Date().toISOString(),
      overallCoverage,
      workflowCoverage,
      testResults: this.testResults
    };
  }

  /**
   * Calculate average coverage for a set of workflows
   */
  private calculateAverageCoverage(workflows: WorkflowCoverage[]): number {
    if (workflows.length === 0) return 0;
    
    const totalCoverage = workflows.reduce((sum, workflow) => sum + workflow.coveragePercentage, 0);
    return totalCoverage / workflows.length;
  }

  /**
   * Save coverage report as JSON
   */
  public saveJsonReport(report: CoverageReport): void {
    const jsonPath = path.join(this.reportDir, 'coverage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`Coverage report saved to ${jsonPath}`);
  }

  /**
   * Generate HTML report
   */
  public generateHtmlReport(report: CoverageReport): void {
    const htmlPath = path.join(this.reportDir, 'coverage-report.html');
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Playwright E2E Coverage Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .report-meta {
          margin-bottom: 20px;
          font-size: 0.9em;
          color: #7f8c8d;
        }
        .coverage-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .progress-bar-container {
          width: 100%;
          background-color: #ecf0f1;
          border-radius: 4px;
          margin-bottom: 5px;
        }
        .progress-bar {
          height: 20px;
          border-radius: 4px;
          text-align: center;
          color: white;
          font-weight: bold;
        }
        .critical {
          background-color: #e74c3c;
        }
        .high {
          background-color: #f39c12;
        }
        .medium {
          background-color: #3498db;
        }
        .low {
          background-color: #2ecc71;
        }
        .workflow-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .workflow-table th, .workflow-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .workflow-table th {
          background-color: #f2f2f2;
        }
        .workflow-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .test-list {
          margin-top: 10px;
          font-size: 0.9em;
        }
        .test-status {
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.8em;
          color: white;
        }
        .passed {
          background-color: #2ecc71;
        }
        .failed {
          background-color: #e74c3c;
        }
        .skipped {
          background-color: #7f8c8d;
        }
        .flaky {
          background-color: #f39c12;
        }
        .not-run {
          background-color: #95a5a6;
        }
        .target-line {
          position: absolute;
          width: 100%;
          height: 1px;
          background-color: #27ae60;
          left: 0;
        }
        .target-label {
          position: absolute;
          right: 0;
          margin-top: -20px;
          font-size: 0.8em;
          color: #27ae60;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Playwright E2E Functional Coverage Report</h1>
        
        <div class="report-meta">
          <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="coverage-summary">
          <h2>Overall Coverage: ${report.overallCoverage.toFixed(2)}%</h2>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${Math.min(report.overallCoverage, 100)}%; background-color: ${report.overallCoverage >= 80 ? '#27ae60' : '#e74c3c'}">
              ${report.overallCoverage.toFixed(2)}%
            </div>
            <div class="target-label">Target: 80%</div>
          </div>
          
          <h3>Coverage by Importance</h3>
          <div>
            <p>Critical Workflows</p>
            <div class="progress-bar-container">
              <div class="progress-bar critical" style="width: ${Math.min(this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'critical')), 100)}%">
                ${this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'critical')).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div>
            <p>High Importance Workflows</p>
            <div class="progress-bar-container">
              <div class="progress-bar high" style="width: ${Math.min(this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'high')), 100)}%">
                ${this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'high')).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div>
            <p>Medium Importance Workflows</p>
            <div class="progress-bar-container">
              <div class="progress-bar medium" style="width: ${Math.min(this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'medium')), 100)}%">
                ${this.calculateAverageCoverage(report.workflowCoverage.filter(w => w.importance === 'medium')).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
        
        <h2>Workflow Coverage Details</h2>
        <table class="workflow-table">
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Importance</th>
              <th>Description</th>
              <th>Covering Tests</th>
              <th>Coverage</th>
            </tr>
          </thead>
          <tbody>
            ${report.workflowCoverage.map(workflow => `
              <tr>
                <td>${workflow.workflowName}</td>
                <td>${workflow.importance}</td>
                <td>${workflow.description}</td>
                <td>
                  <div class="test-list">
                    ${workflow.coveredByTests.map(test => {
                      const statusMatch = test.match(/\((.*)\)$/);
                      const status = statusMatch ? statusMatch[1] : 'unknown';
                      return `<div>${test.replace(/\((.*)\)$/, '')} <span class="test-status ${status}">${status}</span></div>`;
                    }).join('')}
                  </div>
                </td>
                <td>
                  <div class="progress-bar-container">
                    <div class="progress-bar ${workflow.importance}" style="width: ${Math.min(workflow.coveragePercentage, 100)}%">
                      ${workflow.coveragePercentage.toFixed(2)}%
                    </div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Test Results Summary</h2>
        <p>Total Tests: ${report.testResults.length}</p>
        <p>Passed: ${report.testResults.filter(t => t.status === 'passed').length}</p>
        <p>Failed: ${report.testResults.filter(t => t.status === 'failed').length}</p>
        <p>Skipped: ${report.testResults.filter(t => t.status === 'skipped').length}</p>
        <p>Flaky: ${report.testResults.filter(t => t.status === 'flaky').length}</p>
      </div>
    </body>
    </html>
    `;
    
    fs.writeFileSync(htmlPath, html);
    console.log(`HTML report saved to ${htmlPath}`);
  }

  /**
   * Generate CSV coverage matrix
   */
  public generateCsvMatrix(): void {
    const csvPath = path.join(this.reportDir, 'coverage-matrix.csv');
    
    const allTests = TEST_WORKFLOW_MAPPING.map(m => `${m.testFile}::${m.testName}`);
    const uniqueTests = Array.from(new Set(allTests)).sort();
    
    let csvContent = 'Workflow ID,Workflow Name,Importance';
    uniqueTests.forEach(test => {
      const [file, name] = test.split('::');
      csvContent += `,${file} - ${name}`;
    });
    csvContent += '\n';
    
    CORE_WORKFLOWS.forEach(workflow => {
      csvContent += `${workflow.id},${workflow.name},${workflow.importance}`;
      
      uniqueTests.forEach(test => {
        const [file, name] = test.split('::');
        
        const isLinked = TEST_WORKFLOW_MAPPING.some(
          m => m.testFile === file && m.testName === name && m.workflowIds.includes(workflow.id)
        );
        
        const testResult = this.testResults.find(
          r => r.testFile && r.testName && 
             r.testFile.includes(file) && 
             r.testName.includes(name)
        );
        
        if (isLinked) {
          csvContent += `,${testResult ? testResult.status : 'not run'}`;
        } else {
          csvContent += `,`;
        }
      });
      
      csvContent += '\n';
    });
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV matrix saved to ${csvPath}`);
  }

  /**
   * Generate coverage report files
   */
  public generateReports(): void {
    const report = this.generateCoverageReport();
    this.saveJsonReport(report);
    this.generateHtmlReport(report);
    this.generateCsvMatrix();
  }
}
