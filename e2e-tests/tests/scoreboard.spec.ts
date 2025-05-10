import { test, expect } from '@playwright/test';
import { ScoreBoardPage } from '../src/pages/ScoreBoardPage';
import { Navigation } from '../src/utils/navigation';
import { BasePage } from '../src/pages/BasePage';
import { Auth } from '../src/utils/auth';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('Score Board', () => {
  test.beforeEach(async ({ page }) => {
    EnvironmentManager.initialize();
    await Auth.loginAsAdmin(page);
  });

  test('should display score board when accessed directly', async ({ page }) => {
    try {
      const scoreBoardPage = new ScoreBoardPage(page);
      await scoreBoardPage.navigate();
      
      const isChallengeTableVisible = await scoreBoardPage.isChallengeTableVisible();
      expect(isChallengeTableVisible).toBeTruthy();
      
      const categories = await scoreBoardPage.getChallengeCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      const challengeCount = await scoreBoardPage.getChallengeCount();
      expect(challengeCount).toBeGreaterThan(0);
    } catch (error) {
      console.log('Error in score board test:', error);
      await page.screenshot({ path: `scoreboard-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should filter challenges by difficulty', async ({ page }) => {
    try {
      const scoreBoardPage = new ScoreBoardPage(page);
      await scoreBoardPage.navigate();
      
      const totalChallenges = await scoreBoardPage.getChallengeCount();
      
      await scoreBoardPage.filterByDifficulty(1);
      
      const filteredChallenges = await scoreBoardPage.getChallengeCount();
      
      expect(filteredChallenges).toBeLessThan(totalChallenges);
      
      await scoreBoardPage.resetFilters();
      
      const resetChallenges = await scoreBoardPage.getChallengeCount();
      expect(resetChallenges).toEqual(totalChallenges);
    } catch (error) {
      console.log('Error in filter challenges test:', error);
      await page.screenshot({ path: `filter-challenges-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should filter challenges by category', async ({ page }) => {
    try {
      const scoreBoardPage = new ScoreBoardPage(page);
      await scoreBoardPage.navigate();
      
      const categories = await scoreBoardPage.getChallengeCategories();
      expect(categories.length).toBeGreaterThan(0);
      
      if (categories.length > 0) {
        await scoreBoardPage.filterByCategory(categories[0]);
        
        const filteredChallenges = await scoreBoardPage.getChallengeCount();
        expect(filteredChallenges).toBeGreaterThan(0);
      }
    } catch (error) {
      console.log('Error in category filter test:', error);
      await page.screenshot({ path: `category-filter-error-${Date.now()}.png` });
      throw error;
    }
  });

  test('should search for challenges', async ({ page }) => {
    try {
      const scoreBoardPage = new ScoreBoardPage(page);
      await scoreBoardPage.navigate();
      
      await scoreBoardPage.searchChallenges('XSS');
      
      const searchResults = await scoreBoardPage.getChallengeCount();
      expect(searchResults).toBeGreaterThan(0);
      
      await scoreBoardPage.clearSearch();
      
      const clearedResults = await scoreBoardPage.getChallengeCount();
      expect(clearedResults).toBeGreaterThan(searchResults);
    } catch (error) {
      console.log('Error in search challenges test:', error);
      await page.screenshot({ path: `search-challenges-error-${Date.now()}.png` });
      throw error;
    }
  });
});
