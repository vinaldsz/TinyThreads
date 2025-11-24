import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  {
    ignores: ['coverage/**', 'scripts/**'],
  },
  // Tests may mock `next/image` with plain <img> elements; disable the
  // `no-img-element` rule for test files to avoid noisy warnings.
  {
    files: [
      'tests/**/*.js',
      'tests/**/*.jsx',
      'tests/**/*.ts',
      'tests/**/*.tsx',
    ],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
