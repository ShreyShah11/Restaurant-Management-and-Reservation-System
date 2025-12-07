import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
    {
        ignores: ['node_modules', 'client', 'server/dist', '.next', 'build', 'coverage'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-unused-vars': 'off',
            'no-console': 'off',
        },
    },
];
