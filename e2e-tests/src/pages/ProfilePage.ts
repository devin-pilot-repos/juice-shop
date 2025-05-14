import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the User Profile page
 */
export class ProfilePage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly emailInput: Locator;
  private readonly setUsernameButton: Locator;
  private readonly profileImage: Locator;
  private readonly fileUploadInput: Locator;
  private readonly uploadPictureButton: Locator;
  private readonly imageUrlInput: Locator;
  private readonly linkImageButton: Locator;

  /**
   * Constructor for the ProfilePage
   * @param page Playwright page object
   */
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.emailInput = page.locator('#email');
    this.setUsernameButton = page.locator('#submit');
    this.profileImage = page.locator('img.img-rounded');
    this.fileUploadInput = page.locator('#picture');
    this.uploadPictureButton = page.locator('button[aria-label="Button to upload the profile picture"]');
    this.imageUrlInput = page.locator('#url');
    this.linkImageButton = page.locator('#submitUrl');
  }

  /**
   * Navigate to the profile page
   * @returns True if navigation was successful
   */
  async navigate(): Promise<boolean> {
    const success = await super.navigate('/profile');
    await this.waitForElement(this.usernameInput);
    return success;
  }

  /**
   * Get the current username
   * @returns The current username
   */
  async getUsername(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  /**
   * Get the email address
   * @returns The email address
   */
  async getEmail(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Set a new username
   * @param username The new username
   */
  async setUsername(username: string): Promise<void> {
    await this.dismissOverlays(3, 1000);
    
    try {
      await this.page.screenshot({ path: `before-username-update-${Date.now()}.png` });
      
      await this.usernameInput.clear();
      await this.usernameInput.fill(username);
      console.log(`Setting username to: ${username}`);
      
      await this.setUsernameButton.click({ force: true });
      console.log('Clicked set username button');
      
      await this.waitForNavigation();
      await this.page.waitForTimeout(1000);
      
      await this.page.screenshot({ path: `after-username-update-${Date.now()}.png` });
    } catch (error) {
      console.log('Error setting username:', error);
      
      try {
        console.log('Trying alternative approach to set username...');
        
        await this.dismissOverlays(3, 1000);
        
        await this.usernameInput.clear({ timeout: 10000 });
        await this.usernameInput.fill(username, { timeout: 10000 });
        
        await this.page.screenshot({ path: `before-fallback-username-update-${Date.now()}.png` });
        
        await this.setUsernameButton.click({ force: true, timeout: 15000 });
        console.log('Clicked set username button (fallback approach)');
        
        await this.waitForNavigation();
        await this.page.waitForTimeout(1000);
        
        await this.page.screenshot({ path: `after-fallback-username-update-${Date.now()}.png` });
      } catch (fallbackError) {
        console.log('Both username update approaches failed:', fallbackError);
      }
    }
  }

  /**
   * Upload a profile picture from a file
   * @param filePath Path to the image file
   */
  async uploadProfilePicture(filePath: string): Promise<void> {
    await this.dismissOverlays(3, 1000);
    
    try {
      await this.page.screenshot({ path: `before-image-upload-${Date.now()}.png` });
      
      await this.fileUploadInput.setInputFiles(filePath);
      console.log(`Set file input to: ${filePath}`);
      
      await this.uploadPictureButton.click({ force: true });
      console.log('Clicked upload picture button');
      
      await this.waitForNavigation();
      await this.page.waitForTimeout(1000);
      
      await this.page.screenshot({ path: `after-image-upload-${Date.now()}.png` });
    } catch (error) {
      console.log('Error uploading profile picture:', error);
      
      try {
        console.log('Trying alternative approach to upload profile picture...');
        
        await this.dismissOverlays(3, 1000);
        
        await this.fileUploadInput.setInputFiles(filePath, { timeout: 10000 });
        
        await this.page.screenshot({ path: `before-fallback-image-upload-${Date.now()}.png` });
        
        await this.uploadPictureButton.click({ force: true, timeout: 15000 });
        console.log('Clicked upload picture button (fallback approach)');
        
        await this.waitForNavigation();
        await this.page.waitForTimeout(1000);
        
        await this.page.screenshot({ path: `after-fallback-image-upload-${Date.now()}.png` });
      } catch (fallbackError) {
        console.log('Both profile picture upload approaches failed:', fallbackError);
      }
    }
  }

  /**
   * Set profile picture from URL
   * @param imageUrl URL of the image
   */
  async setProfilePictureFromUrl(imageUrl: string): Promise<void> {
    await this.dismissOverlays(3, 1000);
    
    try {
      await this.page.screenshot({ path: `before-image-url-${Date.now()}.png` });
      
      await this.imageUrlInput.clear();
      await this.imageUrlInput.fill(imageUrl);
      console.log(`Setting image URL to: ${imageUrl}`);
      
      await this.linkImageButton.click({ force: true });
      console.log('Clicked link image button');
      
      await this.waitForNavigation();
      await this.page.waitForTimeout(1000);
      
      await this.page.screenshot({ path: `after-image-url-${Date.now()}.png` });
    } catch (error) {
      console.log('Error setting profile picture from URL:', error);
      
      try {
        console.log('Trying alternative approach to set profile picture from URL...');
        
        await this.dismissOverlays(3, 1000);
        
        await this.imageUrlInput.clear({ timeout: 10000 });
        await this.imageUrlInput.fill(imageUrl, { timeout: 10000 });
        
        await this.page.screenshot({ path: `before-fallback-image-url-${Date.now()}.png` });
        
        await this.linkImageButton.click({ force: true, timeout: 15000 });
        console.log('Clicked link image button (fallback approach)');
        
        await this.waitForNavigation();
        await this.page.waitForTimeout(1000);
        
        await this.page.screenshot({ path: `after-fallback-image-url-${Date.now()}.png` });
      } catch (fallbackError) {
        console.log('Both profile picture URL approaches failed:', fallbackError);
      }
    }
  }

  /**
   * Get the current profile image source
   * @returns The profile image source URL
   */
  async getProfileImageSrc(): Promise<string> {
    return await this.profileImage.getAttribute('src') || '';
  }

  /**
   * Check if the profile page is loaded
   * @returns True if the profile page is loaded
   */
  async isProfilePageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.usernameInput, 5000);
      await this.waitForElement(this.profileImage, 5000);
      return true;
    } catch (error) {
      console.log('Error checking if profile page is loaded:', error);
      return false;
    }
  }
}
