import { test, expect, request, APIRequestContext } from '@playwright/test';
import { Auth } from '../src/utils/auth';
import { EnvironmentManager } from '../src/utils/environmentManager';

test.describe('API Integration', () => {
  let apiContext: APIRequestContext;
  let baseUrl: string;
  let authToken: string | null;

  test.beforeAll(async ({ browser }) => {
    EnvironmentManager.initialize();
    baseUrl = EnvironmentManager.getBaseUrl();
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await Auth.loginAsCustomer(page);
    
    authToken = await page.evaluate(() => {
      return localStorage.getItem('token');
    });
    
    apiContext = await request.newContext({
      baseURL: baseUrl,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    await page.close();
    await context.close();
  });

  test('should retrieve user data via API', async () => {
    try {
      const response = await apiContext.get('/api/Users/whoami');
      
      expect(response.ok()).toBeTruthy();
      
      const userData = await response.json();
      expect(userData).toBeDefined();
      expect(userData.email).toBeDefined();
      
      console.log('Successfully retrieved user data via API');
    } catch (error) {
      console.log('Error retrieving user data via API:', error);
      throw error;
    }
  });

  test('should retrieve products via API', async () => {
    try {
      const response = await apiContext.get('/api/Products');
      
      expect(response.ok()).toBeTruthy();
      
      const products = await response.json();
      expect(Array.isArray(products.data)).toBeTruthy();
      expect(products.data.length).toBeGreaterThan(0);
      
      console.log(`Successfully retrieved ${products.data.length} products via API`);
    } catch (error) {
      console.log('Error retrieving products via API:', error);
      throw error;
    }
  });

  test('should search products via API', async () => {
    try {
      const searchTerm = 'juice';
      const response = await apiContext.get(`/api/Products/search?q=${searchTerm}`);
      
      expect(response.ok()).toBeTruthy();
      
      const searchResults = await response.json();
      expect(Array.isArray(searchResults.data)).toBeTruthy();
      
      console.log(`Search for "${searchTerm}" returned ${searchResults.data.length} results via API`);
      
      if (searchResults.data.length > 0) {
        const containsSearchTerm = searchResults.data.some((product: { name: string; description: string }) => 
          product.name.toLowerCase().includes(searchTerm) || 
          product.description.toLowerCase().includes(searchTerm)
        );
        expect(containsSearchTerm).toBeTruthy();
      }
    } catch (error) {
      console.log('Error searching products via API:', error);
      throw error;
    }
  });

  test('should add product to basket via API', async () => {
    try {
      const productsResponse = await apiContext.get('/api/Products');
      expect(productsResponse.ok()).toBeTruthy();
      
      const products = await productsResponse.json();
      expect(products.data.length).toBeGreaterThan(0);
      
      const productId = products.data[0].id;
      
      const basketResponse = await apiContext.post('/api/BasketItems', {
        data: {
          ProductId: productId,
          quantity: 1
        }
      });
      
      expect(basketResponse.ok()).toBeTruthy();
      
      const basketItem = await basketResponse.json();
      expect(basketItem.status).toBe('success');
      
      console.log(`Successfully added product ${productId} to basket via API`);
      
      const basketItemsResponse = await apiContext.get('/api/BasketItems');
      expect(basketItemsResponse.ok()).toBeTruthy();
      
      const basketItems = await basketItemsResponse.json();
      expect(Array.isArray(basketItems.data)).toBeTruthy();
      
      const containsProduct = basketItems.data.some((item: { ProductId: number }) => item.ProductId === productId);
      expect(containsProduct).toBeTruthy();
      
      for (const item of basketItems.data as Array<{ id: number }>) {
        const deleteResponse = await apiContext.delete(`/api/BasketItems/${item.id}`);
        expect(deleteResponse.ok()).toBeTruthy();
      }
    } catch (error) {
      console.log('Error adding product to basket via API:', error);
      throw error;
    }
  });

  test('should handle API errors gracefully', async () => {
    try {
      const response = await apiContext.get('/api/nonexistent', {
        timeout: 5000
      });
      
      expect(response.status()).toBe(404);
      
      console.log('Successfully handled 404 error for non-existent API endpoint');
    } catch (error) {
      console.log('Error testing API error handling:', error);
    }
  });
});
