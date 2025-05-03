# Test Implementation Todo List

## Required Tests

- [x] User Registration
  - Implemented in `tests/registration.spec.ts`
  - Tests user registration with valid data
  - Tests error cases (existing email, password mismatch)

- [x] Login & Logout
  - Implemented in `tests/login-logout.spec.ts`
  - Tests login with valid credentials
  - Tests login with invalid credentials
  - Tests logout functionality
  - Tests "Remember Me" functionality

- [x] Add to Basket & Checkout
  - Implemented in `tests/basket-checkout.spec.ts`
  - Tests adding products to basket
  - Tests removing products from basket
  - Tests checkout process

- [x] Security Challenge (Score Manipulation)
  - Implemented in `tests/security-challenge.spec.ts`
  - Tests accessing the score board
  - Tests finding and solving a simple security challenge

## Additional Tests

- [x] Product Search
  - Implemented in `tests/product-search.spec.ts`
  - Tests searching for products
  - Tests filtering products

## Connectivity Test

- [x] Public Instance Connectivity
  - Implemented in `tests/connectivity.spec.ts`
  - Tests connection to the public Juice Shop instance
