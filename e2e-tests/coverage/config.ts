import { Challenge } from '../../frontend/src/app/Models/challenge.model';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  associatedChallenges?: string[]; // Challenge keys from challenges.yml
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export const CORE_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'user-registration',
    name: 'User Registration',
    description: 'Register a new user account',
    associatedChallenges: ['registerAdminChallenge', 'emptyUserRegistration'],
    importance: 'critical'
  },
  {
    id: 'user-login',
    name: 'User Login/Logout',
    description: 'Login and logout functionality',
    associatedChallenges: ['loginAdminChallenge', 'loginJimChallenge', 'loginBenderChallenge'],
    importance: 'critical'
  },
  {
    id: 'product-search',
    name: 'Product Search',
    description: 'Search for products and view results',
    importance: 'critical'
  },
  {
    id: 'basket-management',
    name: 'Basket Management',
    description: 'Add and remove products from basket',
    importance: 'critical'
  },
  {
    id: 'checkout-process',
    name: 'Checkout Process',
    description: 'Complete the checkout process with address and payment',
    importance: 'critical'
  },
  {
    id: 'user-profile',
    name: 'User Profile Management',
    description: 'View and update user profile',
    importance: 'high'
  },
  {
    id: 'security-challenges',
    name: 'Security Challenges',
    description: 'Complete security challenges',
    importance: 'high'
  },
  {
    id: 'api-interactions',
    name: 'API Interactions',
    description: 'Test API endpoints',
    importance: 'high'
  },
  {
    id: 'score-board',
    name: 'Score Board',
    description: 'View and interact with the challenge score board',
    associatedChallenges: ['scoreboardChallenge'],
    importance: 'high'
  },
  {
    id: 'product-reviews',
    name: 'Product Reviews',
    description: 'Add and view product reviews',
    importance: 'medium'
  }
];

export interface TestMapping {
  testFile: string;
  testName: string;
  workflowIds: string[];
}

export const TEST_WORKFLOW_MAPPING: TestMapping[] = [
  {
    testFile: 'registration.spec.ts',
    testName: 'should register a new user',
    workflowIds: ['user-registration']
  },
  {
    testFile: 'login-logout.spec.ts',
    testName: 'should login successfully with valid credentials',
    workflowIds: ['user-login']
  },
  {
    testFile: 'login-logout.spec.ts',
    testName: 'should show error with invalid credentials',
    workflowIds: ['user-login']
  },
  {
    testFile: 'login-logout.spec.ts',
    testName: 'should logout successfully',
    workflowIds: ['user-login']
  },
  {
    testFile: 'login-logout.spec.ts',
    testName: 'should remember user when "Remember Me" is checked',
    workflowIds: ['user-login']
  },
  {
    testFile: 'product-search.spec.ts',
    testName: 'should search for products and display results',
    workflowIds: ['product-search']
  },
  {
    testFile: 'product-search.spec.ts',
    testName: 'should handle search for non-existent products',
    workflowIds: ['product-search']
  },
  {
    testFile: 'product-search.spec.ts',
    testName: 'should perform SQL injection attack in search',
    workflowIds: ['product-search', 'security-challenges']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should add product to basket',
    workflowIds: ['basket-management']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should remove product from basket',
    workflowIds: ['basket-management']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should proceed to checkout',
    workflowIds: ['basket-management', 'checkout-process']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should show empty basket message when basket is empty',
    workflowIds: ['basket-management']
  },
  {
    testFile: 'checkout-process.spec.ts',
    testName: 'should complete checkout with valid address and payment',
    workflowIds: ['checkout-process']
  },
  {
    testFile: 'checkout-process.spec.ts',
    testName: 'should validate address fields',
    workflowIds: ['checkout-process']
  },
  {
    testFile: 'checkout-process.spec.ts',
    testName: 'should validate payment information',
    workflowIds: ['checkout-process']
  },
  {
    testFile: 'api-integration.spec.ts',
    testName: 'should retrieve product information via API',
    workflowIds: ['api-interactions']
  },
  {
    testFile: 'api-integration.spec.ts',
    testName: 'should search products via API',
    workflowIds: ['api-interactions', 'product-search']
  },
  {
    testFile: 'api-integration.spec.ts',
    testName: 'should manipulate basket via API',
    workflowIds: ['api-interactions', 'basket-management']
  },
  {
    testFile: 'scoreboard.spec.ts',
    testName: 'should display score board when accessed directly',
    workflowIds: ['score-board']
  },
  {
    testFile: 'scoreboard.spec.ts',
    testName: 'should filter challenges by difficulty',
    workflowIds: ['score-board']
  },
  {
    testFile: 'scoreboard.spec.ts',
    testName: 'should filter challenges by category',
    workflowIds: ['score-board']
  },
  {
    testFile: 'scoreboard.spec.ts',
    testName: 'should search for challenges',
    workflowIds: ['score-board']
  },
  {
    testFile: 'security-challenge.spec.ts',
    testName: 'should manipulate basket item price',
    workflowIds: ['security-challenges', 'basket-management']
  },
  {
    testFile: 'security-challenge.spec.ts',
    testName: 'should access score board by directly navigating to its URL',
    workflowIds: ['security-challenges', 'score-board']
  },
  {
    testFile: 'product-reviews.spec.ts',
    testName: 'should add a product review',
    workflowIds: ['product-reviews']
  },
  {
    testFile: 'registration.spec.ts',
    testName: 'should validate registration form fields',
    workflowIds: ['user-registration']
  },
  {
    testFile: 'login-logout.spec.ts',
    testName: 'should navigate to password reset page',
    workflowIds: ['user-login']
  },
  {
    testFile: 'product-search.spec.ts',
    testName: 'should filter products by price range',
    workflowIds: ['product-search']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should update product quantity in basket',
    workflowIds: ['basket-management']
  },
  {
    testFile: 'basket-checkout.spec.ts',
    testName: 'should apply coupon to basket',
    workflowIds: ['basket-management']
  },
  {
    testFile: 'checkout-process.spec.ts',
    testName: 'should process checkout with different payment methods',
    workflowIds: ['checkout-process']
  }
];
