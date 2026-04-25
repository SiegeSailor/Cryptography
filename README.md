# Cryptography

[![NPM Version](https://img.shields.io/npm/v/%40siegesailor/cryptography?logo=npm)](https://www.npmjs.com/package/@siegesailor/cryptography)
[![Test](https://github.com/SiegeSailor/Cryptography/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/SiegeSailor/Cryptography/actions/workflows/test.yml)
[![Release](https://github.com/SiegeSailor/Cryptography/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/SiegeSailor/Cryptography/actions/workflows/release.yml)

Zero configuration needed. WebAssembly availability is determined at runtime, with a safe fallback to JavaScript with TypeScript support implemented. The library is production-ready, with a focus on security and performance, providing implementations for:

| Algorithm                                                                     | JavaScript | TypeScript | WebAssembly |
| ----------------------------------------------------------------------------- | ---------- | ---------- | ----------- |
| [Baby Step Giant Step](source/algorithms/baby-step-giant-step/)               | ✅         | ✅         | ✅          |
| [Blum Blum Shub](source/algorithms/blum-blum-shub/)                           | ✅         | ✅         | ✅          |
| [Chinese Remainder](source/algorithms/chinese-remainder/)                     | ✅         | ✅         | ✅          |
| [Euclidean](source/algorithms/euclidean/)                                     | ✅         | ✅         | ✅          |
| [Extended Euclidean](source/algorithms/extended-euclidean/)                   | ✅         | ✅         | ✅          |
| [Fast Modular Exponentiation](source/algorithms/fast-modular-exponentiation/) | ✅         | ✅         | ✅          |
| [Miller Rabin Primality Test](source/algorithms/miller-rabin-primality-test/) | ✅         | ✅         | ✅          |
| [Multiplicative Inverse](source/algorithms/multiplicative-inverse/)           | ✅         | ✅         | ✅          |
| [Naor Reingo](source/algorithms/naor-reingo/)                                 | ✅         | ✅         | ✅          |
| [Pollard P-1 Factorization](source/algorithms/pollard-p-1-factorization/)     | ✅         | ✅         | ✅          |
| [Pollard Rho](source/algorithms/pollard-rho/)                                 | ✅         | ✅         | ✅          |
| [Primitive Root Search](source/algorithms/primitive-root-search/)             | ✅         | ✅         | ✅          |

And, a CLI is available to interact with these algorithms and demonstrate the 3 key encryption flows:

- [Diffie Hellman Key Exchange](./source/key-encryptions/DiffieHellman.ts)
- [ElGamal](./source/key-encryptions/ElGamal.ts)
- [RSA](./source/key-encryptions/RSA.ts)

## Installation

The package is available on NPM:

```bash
npm install @siegesailor/cryptography
```

### Prerequisites

Required software for this module:

- [Node.js](https://nodejs.org/): `>= 14.18.0`
- [NPM](https://www.npmjs.com/): `>= 6.14.15`

Tested and compatible Node.js versions:

- `14.18.0`
- `16.20.2`
- `18.0.0`
- `25.2.1`

## Use as a Library

You can use it in ESM:

```ts
import {
  fastModularExponentiation,
  millerRabinPrimalityTest,
  euclidean,
} from "@siegesailor/cryptography";

const gcd = euclidean(614n, 513n);
const modPow = fastModularExponentiation(2n, 100n, 71n);
const isPrime = millerRabinPrimalityTest(104729n, 10);
```

Or, you can use it in CommonJS:

```js
const {
  euclidean,
  fastModularExponentiation,
  millerRabinPrimalityTest,
} = require("@siegesailor/cryptography");
```

## Use as a CLI

![CLI](./images/CLI.png)

Run directly with NPX:

```bash
npx @siegesailor/cryptography
```
