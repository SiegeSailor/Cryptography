#!/usr/bin/env node

const { join } = require("path");

function loadCLI() {
  if (process.env.CRYPTOGRAPHY_CLI_BUILD === "1") {
    return {
      ...require(join(__dirname, "..", "build", "command.js")),
      CHOICES: require(join(__dirname, "..", "build", "shared", "constants.js"))
        .CHOICES,
    };
  }

  require("ts-node/register");
  require("tsconfig-paths/register");

  return {
    ...require("../source/command"),
    CHOICES: require("../source/shared/constants").CHOICES,
  };
}

const { runCLI, CHOICES } = loadCLI();

const ALGORITHM_CASES = [
  ["baby-step-giant-step", { generator: 1, base: 1, modulo: 2 }],
  ["blum-blum-shub", { bits: 8 }],
  ["chinese-remainder", { base: "2,1,2", modulo: "11,19,37" }],
  ["euclidean", { left: 1, right: 1 }],
  ["extended-euclidean", { left: 1, right: 1 }],
  ["fast-modular-exponentiation", { base: 2, exponent: 100, modulo: 71 }],
  ["miller-rabin-primality-test", { input: 104729, level: 10 }],
  ["multiplicative-inverse", { base: 23, modulo: 41, number: 5 }],
  ["naor-reingo", { count: 3, digits: 2 }],
  ["pollard-p-1-factorization", { input: 8051 }],
  ["pollard-rho", { input: 8051 }],
  ["primitive-root-search", { prime: 7 }],
];

const DEMONSTRATIONS = ["DiffieHellman", "ElGamal", "RSA"];

function muteConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalTime = console.time;
  const originalTimeEnd = console.timeEnd;

  console.log = () => undefined;
  console.error = () => undefined;
  console.time = () => undefined;
  console.timeEnd = () => undefined;

  return () => {
    console.log = originalLog;
    console.error = originalError;
    console.time = originalTime;
    console.timeEnd = originalTimeEnd;
  };
}

async function runAlgorithms() {
  for (const [selection, answers] of ALGORITHM_CASES) {
    await runCLI({
      purpose: CHOICES.EXECUTE,
      procedure: selection,
      promptOptions: {
        answers,
        interactive: false,
        outputFormat: "none",
      },
      restartable: false,
    });
  }
}

async function runDemonstrations() {
  for (const selection of DEMONSTRATIONS) {
    await runCLI({
      purpose: CHOICES.DEMONSTRATE,
      procedure: selection,
      promptOptions: {
        interactive: false,
      },
      restartable: false,
    });
  }
}

async function main() {
  const restoreConsole = muteConsole();

  try {
    await runAlgorithms();
    await runDemonstrations();
  } finally {
    restoreConsole();
  }

  console.log("CLI compatibility checks passed.");
}

main().catch((error) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : error;
  console.error(message);
  process.exitCode = 1;
});
