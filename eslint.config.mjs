import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'import/extensions': 'off',
			'import/no-unresolved': 'off',
			'no-case-declarations': 'off',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
		},
		files: ['src/**/*.ts'],
		ignores: [
			'dist/',
			'.yarn/',
			'.yarn/sdks/',
			'.eslintrc.js',
		],
	}
); 