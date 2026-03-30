---
description: TypeScript coding standards and conventions
applyTo: "source/**/*.ts"
---

# TypeScript Coding Standards and Conventions

Follow these guidelines and the [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html). If anything conflicts, this document prevails over any guidance in external style guides or linters.

## Coding Standards

- Use `@/*` imports for code under `source/*`
- Do not import internal code from `@/entry-point`
- Use `type` prefix for type imports, e.g. `import { type TFoo }`
- Import order:
  1. External dependencies
  2. Built-in modules
  3. Internal imports, e.g. `@/shared/*`
  4. Sibling imports, e.g. `./*`
- Remove unused imports and variables
- Refactor code that can be reused into `source/shared/`

## Naming Conventions

- Use PascalCase for types and interfaces
  - Prefix types, e.g. `type TFoo` and `interface IBar`
- Use UPPER_SNAKE_CASE for constants
  - Use `const` object with `as const` instead of enums
- Use `is*` for boolean variables, e.g. `isValid`, `isSupported`
- Use verb-noun for functions, e.g. `encryptData`, `deriveKey`
