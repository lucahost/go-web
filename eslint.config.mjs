import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import nextPlugin from '@next/eslint-plugin-next'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
    {
        ignores: ['.next/**', 'node_modules/**', 'out/**', 'public/**'],
    },
    js.configs.recommended,
    // JavaScript files (e.g., service workers)
    {
        files: ['**/*.js'],
        languageOptions: {
            globals: {
                // Service Worker globals
                self: 'readonly',
                clients: 'readonly',
                registration: 'readonly',
                console: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    // TypeScript files
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FormData: 'readonly',
                Blob: 'readonly',
                File: 'readonly',
                FileReader: 'readonly',
                Response: 'readonly',
                Request: 'readonly',
                Headers: 'readonly',
                AbortController: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                EventTarget: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Node: 'readonly',
                NodeList: 'readonly',
                MouseEvent: 'readonly',
                KeyboardEvent: 'readonly',
                // Node globals
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                exports: 'writable',
                Buffer: 'readonly',
                global: 'readonly',
                // Jest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                // Service Worker globals
                self: 'readonly',
                clients: 'readonly',
                ServiceWorkerGlobalScope: 'readonly',
                ServiceWorkerRegistration: 'readonly',
                PushEvent: 'readonly',
                PushSubscription: 'readonly',
                NotificationEvent: 'readonly',
                Notification: 'readonly',
                registration: 'readonly',
                // Web APIs
                Audio: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            '@next/next': nextPlugin,
            prettier: prettierPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // TypeScript rules
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],

            // React rules
            ...reactPlugin.configs.recommended.rules,
            'react/display-name': 'off',
            'react/jsx-boolean-value': ['error', 'never'],
            'react/jsx-no-bind': 'warn',
            'react/jsx-no-target-blank': 'off',
            'react/jsx-sort-props': [
                'warn',
                {
                    reservedFirst: true,
                    shorthandLast: true,
                },
            ],
            'react/no-unescaped-entities': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',

            // React Hooks rules
            ...reactHooksPlugin.configs.recommended.rules,

            // Next.js rules
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,

            // General rules
            'no-case-declarations': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-shadow': 'off',

            // Prettier
            'prettier/prettier': 'error',
        },
    },
    prettierConfig,
]
