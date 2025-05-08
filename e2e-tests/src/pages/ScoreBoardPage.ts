import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the Score Board page
 */
export class ScoreBoardPage extends BasePage {
  private readonly challengeCards: Locator;
  private readonly solvedChallenges: Locator;
  private readonly filterButton: Locator;
  private readonly difficultySelect: Locator;
  private readonly statusSelect: Locator;

  /**
   * Constructor for the ScoreBoardPage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.challengeCards = page.locator('.challenge-container');
    this.solvedChallenges = page.locator('.challenge-container.solved');
    this.filterButton = page.locator('#filterButton');
    this.difficultySelect = page.locator('mat-select[aria-label="Difficulty"]');
    this.statusSelect = page.locator('mat-select[aria-label="Status"]');
  }

  /**
   * Navigate to the score board page
   * @param path Path to navigate to, defaults to '/#/score-board'
   * @returns True if navigation was successful
   */
  async navigate(path: string = '/#/score-board'): Promise<boolean> {
    const success = await super.navigate(path);
    await this.waitForElement(this.challengeCards);
    return success;
  }

  /**
   * Get the number of solved challenges
   * @returns The number of solved challenges
   */
  async getSolvedChallengesCount(): Promise<number> {
    return await this.solvedChallenges.count();
  }

  /**
   * Get the total number of challenges
   * @returns The total number of challenges
   */
  async getTotalChallengesCount(): Promise<number> {
    return await this.challengeCards.count();
  }

  /**
   * Check if a specific challenge is solved
   * @param challengeName The name of the challenge
   * @returns True if the challenge is solved
   */
  async isChallengeCompleted(challengeName: string): Promise<boolean> {
    const challenge = this.page.locator(`.challenge-container:has-text("${challengeName}")`);
    const classAttribute = await challenge.getAttribute('class') || '';
    return classAttribute.includes('solved');
  }

  /**
   * Filter challenges by difficulty
   * @param difficulty The difficulty level to filter by
   */
  async filterByDifficulty(difficulty: string): Promise<void> {
    await this.filterButton.click();
    await this.difficultySelect.click();
    
    await this.page.locator(`mat-option:has-text("${difficulty}")`).click();
    await this.page.keyboard.press('Escape');
  }

  /**
   * Filter challenges by status
   * @param status The status to filter by (e.g., 'solved', 'unsolved')
   */
  async filterByStatus(status: string): Promise<void> {
    await this.filterButton.click();
    await this.statusSelect.click();
    
    await this.page.locator(`mat-option:has-text("${status}")`).click();
    await this.page.keyboard.press('Escape');
  }
}
