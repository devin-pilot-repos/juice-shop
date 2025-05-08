import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwrightPlugin from 'eslint-plugin-playwright';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      playwright: playwrightPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-force-option': 'error',
      'playwright/valid-expect': 'error',
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  }
);
