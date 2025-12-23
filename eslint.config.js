/*
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-23 09:52:15
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-23 10:00:26
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\eslint.config.js
 * @Description  :
 */
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/', 'node_modules/', '*.js'],
  },
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // 自定义规则
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'off',
      // 关闭重复规则
      'no-unused-vars': 'off',
    },
  },
];
