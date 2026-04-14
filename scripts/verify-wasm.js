const fs = require("fs");
const path = require("path");

const expectedExports = {
  "baby-step-giant-step": "baby_step_giant_step_i64",
  "blum-blum-shub": "blum_blum_shub_next_u64",
  "chinese-remainder": "chinese_remainder_i64",
  euclidean: "gcd_u64",
  "extended-euclidean": "extended_euclidean_i64",
  "fast-modular-exponentiation": "powmod_u64",
  "miller-rabin-primality-test": "miller_rabin_u64",
  "multiplicative-inverse": "multiplicative_inverse_i64",
  "naor-reingo": "naor_reingo_fill_i64",
  "pollard-p-1-factorization": "pollard_p1_i64",
  "pollard-rho": "pollard_rho_i64",
  "primitive-root-search": "primitive_root_search_i64",
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function instantiateWasm(wasmPath) {
  const bytes = fs.readFileSync(wasmPath);
  const module = new WebAssembly.Module(bytes);
  return new WebAssembly.Instance(module, {});
}

function main() {
  const root = path.resolve(__dirname, "..");
  const algorithmsRoot = path.join(root, "source", "algorithms");

  const algorithmDirs = fs
    .readdirSync(algorithmsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dirName of algorithmDirs) {
    const sourcePath = path.join(algorithmsRoot, dirName, "main.c");
    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    const wasmPath = path.join(algorithmsRoot, dirName, "main.wasm");
    assert(fs.existsSync(wasmPath), `Missing wasm binary: ${wasmPath}`);

    const instance = instantiateWasm(wasmPath);
    const wasmExports = instance.exports;

    assert(wasmExports.memory, `WASM module has no memory export: ${dirName}`);

    const exportName = expectedExports[dirName];
    assert(exportName, `No expected export mapping for algorithm: ${dirName}`);
    assert(
      typeof wasmExports[exportName] === "function",
      `Missing expected function export '${exportName}' for ${dirName}`,
    );

    console.log(`Verified module exports for: ${dirName}`);
  }

  const euclideanWasm = instantiateWasm(
    path.join(algorithmsRoot, "euclidean", "main.wasm"),
  ).exports;
  const gcd = euclideanWasm.gcd_u64(48n, 18n);
  assert(gcd === 6n, `Unexpected gcd_u64 result from wasm: ${gcd}`);

  const modExpWasm = instantiateWasm(
    path.join(algorithmsRoot, "fast-modular-exponentiation", "main.wasm"),
  ).exports;
  const modPow = modExpWasm.powmod_u64(5n, 117n, 19n);
  assert(modPow === 1n, `Unexpected powmod_u64 result from wasm: ${modPow}`);

  console.log("WASM smoke checks passed: euclidean.gcd_u64 and powmod_u64.");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
