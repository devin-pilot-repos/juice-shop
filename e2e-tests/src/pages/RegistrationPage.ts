import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Registration page
 */
export class RegistrationPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly repeatPasswordInput: Locator;
  private readonly securityQuestionSelect: Locator;
  private readonly securityAnswerInput: Locator;
  private readonly registerButton: Locator;
  private readonly errorMessage: Locator;

  /**
   * Constructor for the RegistrationPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#emailControl');
    this.passwordInput = page.locator('#passwordControl');
    this.repeatPasswordInput = page.locator('#repeatPasswordControl');
    this.securityQuestionSelect = page.locator('mat-select[name="securityQuestion"]');
    this.securityAnswerInput = page.locator('#securityAnswerControl');
    this.registerButton = page.locator('#registerButton');
    this.errorMessage = page.locator('.error');
  }

  /**
   * Navigate to the registration page
   * @param path Path to navigate to, defaults to '/#/register'
   * @returns True if navigation was successful
   */
  async navigate(path: string = '/#/register'): Promise<boolean> {
    const success = await super.navigate(path);
    await this.waitForElement(this.emailInput);
    return success;
  }

  /**
   * Select a security question by index
   * @param index The index of the security question to select
   */
  async selectSecurityQuestion(index: number): Promise<void> {
    await this.securityQuestionSelect.click();
    await this.page.waitForTimeout(500); // Wait for dropdown to open
    
    const options = this.page.locator('mat-option');
    await options.nth(index).click();
  }

  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @param securityQuestionIndex Index of the security question
   * @param securityAnswer Answer to the security question
   */
  async register(
    email: string,
    password: string,
    securityQuestionIndex: number,
    securityAnswer: string
  ): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.repeatPasswordInput.fill(password);
    
    await this.selectSecurityQuestion(securityQuestionIndex);
    await this.securityAnswerInput.fill(securityAnswer);
    
    await this.registerButton.click();
    await this.page.waitForNavigation();
  }

  /**
   * Get the error message text if registration fails
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }
}
