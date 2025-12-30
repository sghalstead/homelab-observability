# Task-03: Configure Linting and Formatting

**Phase:** PHASE 0 - Project Setup
**Status:** Pending
**Dependencies:** Task-01

---

## Objective

Configure ESLint with TypeScript rules and Prettier for consistent code formatting.

---

## Definition of Done

- [ ] ESLint configured with TypeScript and React rules
- [ ] Prettier installed and configured
- [ ] ESLint-Prettier integration working
- [ ] Format and lint scripts in package.json
- [ ] VS Code settings for auto-formatting (optional)
- [ ] All existing files pass linting

---

## Implementation Details

### Step 1: Install Additional ESLint Plugins

```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### Step 2: Update ESLint Configuration

Update `.eslintrc.json` or `eslint.config.mjs`:

```javascript
// eslint.config.mjs (if using flat config)
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier,
];
```

### Step 3: Create Prettier Configuration

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`:

```
node_modules
.next
dist
coverage
*.md
```

### Step 4: Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css}\""
  }
}
```

### Step 5: Create VS Code Settings (Optional)

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Step 6: Format Existing Files

```bash
npm run format
npm run lint:fix
```

---

## Files Created/Modified

- `.eslintrc.json` or `eslint.config.mjs` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Prettier ignore patterns
- `.vscode/settings.json` - VS Code settings (optional)
- `package.json` - Updated scripts

---

## Validation Steps

1. Run `npm run lint` - Should pass with no errors
2. Run `npm run format:check` - Should show all files formatted
3. Modify a file with bad formatting, run `npm run format` - Should fix it
4. Run `npm run lint:fix` - Should auto-fix linting issues

---

## Commit Message

```
[claude] Task-03: Configure linting and formatting

- Updated ESLint with TypeScript rules
- Added Prettier for code formatting
- Configured ESLint-Prettier integration
- Added format and lint scripts
- Created VS Code settings for auto-formatting
```
