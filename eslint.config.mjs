import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import rootedOptionsNewline from './eslint/rooted-options-newline.mjs'

export default tseslint.config(
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/*.g.mts', 'teams/dist/**', '**/.eslintcache'],
	},
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mjs', 'vitest.config.mts', 'teams/*.mts'],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Numbers and booleans in template strings read fine.
			'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowBoolean: true }],
			// `type` reads better for the plain data shapes this code passes around.
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			// `void promise` marks a deliberate fire-and-forget.
			'@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
		},
	},
	{
		files: ['src/api/**/*.mts', 'teams/**/*.mts', '*.mjs', '*.mts'],
		languageOptions: { globals: globals.node },
	},
	{
		files: ['src/web/**/*.mts'],
		languageOptions: { globals: globals.browser },
		plugins: {
			local: {
				rules: {
					'rooted-options-newline': rootedOptionsNewline,
				},
			},
		},
		rules: {
			'local/rooted-options-newline': 'error',
		},
	},
	{
		files: ['**/tests/**/*.mts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
	{
		files: ['**/*.mjs'],
		extends: [tseslint.configs.disableTypeChecked],
	},
)
