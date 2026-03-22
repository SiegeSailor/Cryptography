# Cryptography

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

This library provides a collection of cryptography functions in JavaScript/TypeScript with optional per-algorithm WebAssembly acceleration. A CLI is available to interact with these algorithms and demonstrate key encryption flows.

## Available

There are currently 12 algorithms implemented:

- [Baby Step Giant Step](./source/algorithms/baby-step-giant-step/)
- [Blum Blum Shub](./source/algorithms/blum-blum-shub/)
- [Chinese Remainder](./source/algorithms/chinese-remainder/)
- [Euclidean](./source/algorithms/euclidean/)
- [Extended Euclidean](./source/algorithms/extended-euclidean/)
- [Fast Modular Exponentiation](./source/algorithms/fast-modular-exponentiation/)
- [Miller Rabin Primality Test](./source/algorithms/miller-rabin-primality-test/)
- [Multiplicative Inverse](./source/algorithms/multiplicative-inverse/)
- [Naor Reingo](./source/algorithms/naor-reingo/)
- [Pollard P-1 Factorization](./source/algorithms/pollard-p-1-factorization/)
- [Pollard Rho](./source/algorithms/pollard-rho/)
- [Primitive Root Search](./source/algorithms/primitive-root-search/)

And, 3 key encryption flows:

- [Diffie Hellman Key Exchange](./source/illustration/DiffieHellman.ts)
- [ElGamal](./source/illustration/ElGamal.ts)
- [RSA](./source/illustration/RSA.ts)

## Installation

The package is available on the public NPM. You can install it with:

```bash
npm install @siegesailor/cryptography
```

## Use as a Library

You can use it in TypeScript/ESM:

```ts
import {
  fastModularExponentiation,
  millerRabinPrimarilyTest,
  euclidean,
} from "@siegesailor/cryptography";

const gcd = euclidean(614n, 513n);
const modPow = fastModularExponentiation(2n, 100n, 71n);
const isPrime = millerRabinPrimarilyTest(104729n, 10);
```

Or, you can use it in CommonJS:

```js
const {
  euclidean,
  fastModularExponentiation,
  millerRabinPrimarilyTest,
} = require("@siegesailor/cryptography");
```

## Use as a CLI

Run directly with NPX:

```bash
npx @siegesailor/cryptography
```
