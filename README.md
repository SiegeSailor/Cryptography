# Formulas

Cryptography and number-theory algorithms for Node.js, with both TypeScript implementations and optional per-algorithm WebAssembly acceleration.

## Install

```bash
npm install formulas
```

## Use as a library

TypeScript / ESM:

```ts
import {
  fastModularExponentiation,
  millerRabinPrimarilyTest,
  euclidean,
} from "formulas";

const gcd = euclidean(614n, 513n);
const modPow = fastModularExponentiation(2n, 100n, 71n);
const isPrime = millerRabinPrimarilyTest(104729n, 10);
```

CommonJS:

```js
const {
  euclidean,
  fastModularExponentiation,
  millerRabinPrimarilyTest,
} = require("formulas");
```

## Use as a CLI

Run directly with NPX (no global install):

```bash
npx formulas
```

Or if installed locally:

```bash
npm run start:build
```

## WebAssembly behavior

- Each algorithm folder contains:
  - `index.ts` (TypeScript implementation)
  - `index.test.ts` (tests)
  - `main.c` (WASM source)
- At runtime, each algorithm attempts to use its own compiled `main.wasm` when available.
- If WASM is unavailable, input is unsupported by the WASM ABI, or loading fails, code falls back to TypeScript automatically.

## Available algorithms

- Baby Step Giant Step
- Blum Blum Shub
- Chinese Remainder
- Euclidean
- Extended Euclidean
- Fast Modular Exponentiation
- Miller Rabin Primality Test
- Multiplicative Inverse
- Naor Reingo
- Pollard P-1 Factorization
- Pollard Rho
- Primitive Root Search

## Local development

See [CONTRIBUTION.md](./CONTRIBUTION.md).
