# Formulas

Provides a collection of cryptography functions and a command line tool with interactive prompts to demonstrate key encryption flows and algorithms.

- [Formulas](#formulas)
  - [Prerequisites](#prerequisites)
  - [Install from npm](#install-from-npm)
  - [Use in TS/JS projects](#use-in-tsjs-projects)
  - [WebAssembly acceleration](#webassembly-acceleration)
  - [Instructions](#instructions)
    - [Start](#start)
    - [Test](#test)
      - [Issues](#issues)
  - [CI and Publishing](#ci-and-publishing)
  - [Algorithms](#algorithms)
  - [Encryption Flows](#encryption-flows)

## Prerequisites

See `engines` in [package.json](./package.json):

```json
"engines": {
    "node": ">= 20.0.0",
    "npm": ">= 10.0.0"
},
```

## Install from npm

```bash
npm install formulas
```

## Use in TS/JS projects

TypeScript:

```ts
import { fastModularExponentiation, millerRabinPrimarilyTest } from "formulas";

const isPrime = millerRabinPrimarilyTest(104729n, 10);
const modPow = fastModularExponentiation(2n, 100n, 71n);
```

JavaScript (CommonJS):

```js
const { fastModularExponentiation, euclidean } = require("formulas");

const gcd = euclidean(614n, 513n);
const modPow = fastModularExponentiation(2n, 100n, 71n);
```

## WebAssembly acceleration

`fastModularExponentiation` uses a WebAssembly backend when possible (`u64` safe range) and transparently falls back to the TypeScript implementation for larger values.

The wasm binary is generated from `source/wasm/modexp.wat` via:

```bash
npm run wasm:compile
```

## Instructions

File structure:

```
├── images/
├── patches/
├── source/
│   ├── algorithms/
│   │   ├── baby-step-giant-step/
│   │   └── ...
│   ├── common/
│   │   ├── constants/
│   │   ├── utilities/
│   │   └── ...
│   ├── illustration/
│   │   ├── ElGamal.ts
│   │   └── ...
│   ├── types/
│   ├── command.ts
│   └── entry-point.ts
└── README.md
```

Use the following commands to help you to run or develop this project locally:

```bash
git clone https://github.com/SiegeSailor/formulas.git
```

Go to the folder you just created with `git clone`. It should be typically named `formulas`:

```bash
cd formulas
```

Install all the packages you need. Remember that you have to run this under `node >= 20.0.0` and `npm >= 10.0.0`.

```bash
npm install
```

Then you are able to run the command-line tool with:

```bash
npm run start
```

Or run from the built output:

```bash
npm run build
npm run start:build
```

![Command Start](./images/command-start.png)

### Start

This command-line tool allows you to either demonstrate encryption flow or execute algorithms with the inputs from you. Here is an example of RSA:

![Demonstrate RSA](./images/demonstrate-rsa.png)

Executing Euclidean algorithm with your own inputs:

![Execute Euclidean](./images/execute-euclidean.png)

### Test

Formulas uses Jest for unit tests purpose. You can generate the coverage report:

```bash
npm run test -- --coverage
```

![Test Coverage](./images/test-coverage.png)

Or see the detail for each test case:

```bash
npm run test -- --verbose
```

![Test Verbose](./images/test-verbose.png)

#### Issues

Jest has an [issue](https://github.com/facebook/jest/issues/11617) working with the type `bigint` in multiple test files, which is widely used for algorithms in this project. In order to solve it, the property has been set in `jest.config.js`. Unfortunately, this setup will drag down some performance during testing:

```javascript
module.exports = {
    ...
    maxWorkers: 1,
};
```

## CI and Publishing

GitHub workflows are configured in `.github/workflows`:

- `develop.yml`: runs CI on pushes and pull requests (GitHub flow), executes tests and build.
- `publish.yml`: publishes to npm on GitHub Release publish (or manual dispatch).

Required secret for publishing:

- `NPM_TOKEN`: npm automation token with publish permission.

## Algorithms

Available mathematic algorithm implantation:

- [Baby Step Giant Step](./source/algorithms/baby-step-giant-step/)
- [Blum Blum Shub](./source//algorithms//blum-blum-shub/)
- [Chinese Remainder](./source/algorithms/chinese-remainder/)
- [Euclidean](./source/algorithms/euclidean/)
- [Extended Euclidean](./source/algorithms/extended-euclidean/)
- [Fast Modular Exponentiation](./source/algorithms/fast-modular-exponentiation/)
- [Miller Rabin Primarily Test](./source/algorithms/miller-rabin-primarily-test/)
- [Multiplicative Inverse](./source/algorithms/multiplicative-inverse/)
- [Naor Reingo](./source/algorithms/naor-reingo/)
- [Pollard P-1 Factorization](./source/algorithms/pollard-p-1-factorization/)
- [Pollard Rho](./source/algorithms/pollard-rho/)
- [Primitive Root Search](./source/algorithms/primitive-root-search/)

## Encryption Flows

Demonstrable command-line based encryption flow with three parties involved:

- [RSA](./source/illustration/RSA.ts)
- [ElGamal](./source/illustration/ElGamal.ts)
- [Diffie-Hellman](./source/illustration/DiffieHellman.ts)
