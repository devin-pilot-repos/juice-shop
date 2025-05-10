/**
 * Test data utilities for tests
 */
export class TestData {
  /**
   * Generate a random email address
   * @returns A random email address
   */
  static generateRandomEmail(): string {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `test.${randomString}.${timestamp}@example.com`;
  }
  
  /**
   * Get a random email address (alias for generateRandomEmail)
   * @returns A random email address
   */
  static getRandomEmail(): string {
    return this.generateRandomEmail();
  }

  /**
   * Generate a random password
   * @param length The length of the password
   * @returns A random password
   */
  static generateRandomPassword(length: number = 10): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Generate a random username
   * @returns A random username
   */
  static generateRandomUsername(): string {
    const adjectives = ['happy', 'clever', 'brave', 'calm', 'eager', 'fair', 'kind', 'proud', 'wise', 'witty'];
    const nouns = ['apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'giraffe', 'horse', 'iguana', 'jaguar'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  }

  /**
   * Get test product data
   * @returns An array of test product data
   */
  static getTestProducts(): Array<{ name: string, description: string }> {
    return [
      { name: 'Apple Juice', description: 'Made from fresh apples' },
      { name: 'Orange Juice', description: 'Made from fresh oranges' },
      { name: 'Banana Juice', description: 'Made from fresh bananas' },
      { name: 'Lemon Juice', description: 'Made from fresh lemons' }
    ];
  }

  /**
   * Get test user data
   * @returns An array of test user data
   */
  static getTestUsers(): Array<{ email: string, password: string, username: string }> {
    return [
      { email: 'test1@example.com', password: 'Password123!', username: 'TestUser1' },
      { email: 'test2@example.com', password: 'Password123!', username: 'TestUser2' },
      { email: 'test3@example.com', password: 'Password123!', username: 'TestUser3' }
    ];
  }
}
