# SonarQube Scan Instructions for OWASP Juice Shop

These instructions will guide you through running a SonarQube scan for the OWASP Juice Shop project on a machine that has direct access to your SonarQube instance.

## Prerequisites

1. Access to a machine that can connect to your SonarQube instance at `https://api-tooling.dso.preproduction.smp.bcg.com/sonarqube`
2. Java 17 or higher installed (required for compatibility with the SonarQube server)
3. SonarScanner 5.0.1 or higher installed (if not, see installation instructions below)
4. Git to clone the repository
5. Your SonarQube authentication token

## SonarScanner Installation (if needed)

### For Windows:
1. Download the SonarScanner ZIP from: https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-windows.zip
2. Extract the ZIP to a directory of your choice
3. Add the `bin` directory to your PATH environment variable

### For macOS:
```bash
brew install sonar-scanner
```

### For Linux:
```bash
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
export PATH=$PATH:/path/to/sonar-scanner-5.0.1.3006-linux/bin
```

## Running the Scan

1. Clone the repository:
```bash
git clone https://github.com/devin-pilot-repos/juice-shop.git
cd juice-shop
```

2. Create a `sonar-project.properties` file with the following content:
```properties
# Required metadata
sonar.projectKey=juice-shop
sonar.projectName=OWASP Juice Shop
sonar.projectVersion=1.0

# Source code location
sonar.sources=.
sonar.exclusions=node_modules/**,coverage/**,build/**,dist/**,test/**,e2e-tests/**

# Language
sonar.language=js
sonar.javascript.node.maxspace=4096

# Encoding of the source code
sonar.sourceEncoding=UTF-8

# SonarQube server connection
sonar.host.url=https://api-tooling.dso.preproduction.smp.bcg.com/sonarqube
# Token will be provided via environment variable SONAR_TOKEN
```

3. Set your SonarQube token as an environment variable (this keeps your token secure):

   **For Windows Command Prompt:**
   ```cmd
   set SONAR_TOKEN=your_sonarqube_token_here
   ```

   **For Windows PowerShell:**
   ```powershell
   $env:SONAR_TOKEN="your_sonarqube_token_here"
   ```

   **For macOS/Linux:**
   ```bash
   export SONAR_TOKEN=your_sonarqube_token_here
   ```

4. Run the scan with the token from the environment variable and specify the branch name:
```bash
sonar-scanner -Dsonar.login=$SONAR_TOKEN -Dsonar.branch.name=sonarqube-scan-setup
```

   **For Windows Command Prompt:**
   ```cmd
   sonar-scanner -Dsonar.login=%SONAR_TOKEN% -Dsonar.branch.name=sonarqube-scan-setup
   ```

   **For Windows PowerShell:**
   ```powershell
   sonar-scanner -Dsonar.login=$env:SONAR_TOKEN -Dsonar.branch.name=sonarqube-scan-setup
   ```

5. If you need more detailed logs for troubleshooting, add the `-X` flag:
```bash
sonar-scanner -Dsonar.login=$SONAR_TOKEN -Dsonar.branch.name=sonarqube-scan-setup -X
```

> **Note:** Explicitly specifying the branch name with `-Dsonar.branch.name=sonarqube-scan-setup` is important to ensure SonarQube correctly identifies the branch being scanned. Without this parameter, SonarQube might default to showing results under the "main" branch.

## Viewing Results

After the scan completes successfully, you can view the results by:

1. Opening your SonarQube instance in a web browser: `https://api-tooling.dso.preproduction.smp.bcg.com/sonarqube`
2. Navigating to the project with key `juice-shop`

## Troubleshooting

If you encounter issues:

1. Ensure your machine has network access to the SonarQube instance
2. Verify your SonarQube token has the necessary permissions
3. Check that Java is properly installed and in your PATH
4. Run the scanner with debug mode (`-X` flag) to get more detailed logs
5. Verify that the environment variable is correctly set by echoing it (without sharing it with others)

## Security Notes

- Using environment variables for tokens is more secure than storing them in files
- The environment variable will only persist for your current terminal session
- For CI/CD pipelines, use the secure environment variable features of your CI/CD platform
