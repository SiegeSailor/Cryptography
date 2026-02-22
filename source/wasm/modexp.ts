import { readFileSync } from "fs";
import { join } from "path";

let wasmPowMod:
  | ((base: bigint, exponent: bigint, modulo: bigint) => bigint)
  | null = null;
let wasmInitializationFailed = false;

function initialize() {
  if (wasmPowMod || wasmInitializationFailed) {
    return;
  }

  try {
    const wasmPath = join(__dirname, "modexp.wasm");
    const wasmBytes = readFileSync(wasmPath);
    const module = new WebAssembly.Module(wasmBytes);
    const instance = new WebAssembly.Instance(module, {});
    const exported = instance.exports.powmod_u64;

    if (typeof exported !== "function") {
      wasmInitializationFailed = true;
      return;
    }

    wasmPowMod = exported as (
      base: bigint,
      exponent: bigint,
      modulo: bigint,
    ) => bigint;
  } catch {
    wasmInitializationFailed = true;
  }
}

export function wasmPowModIfAvailable(
  base: bigint,
  exponent: bigint,
  modulo: bigint,
): bigint | null {
  if (modulo <= 0n) {
    return null;
  }

  initialize();
  if (!wasmPowMod) {
    return null;
  }

  const maxU64 = (1n << 64n) - 1n;
  if (
    base < 0n ||
    exponent < 0n ||
    modulo < 0n ||
    base > maxU64 ||
    exponent > maxU64 ||
    modulo > maxU64
  ) {
    return null;
  }

  try {
    return wasmPowMod(base, exponent, modulo);
  } catch {
    return null;
  }
}
