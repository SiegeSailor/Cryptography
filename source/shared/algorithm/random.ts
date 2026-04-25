import { randomBytes } from "crypto";

function fillRandom(buffer: Uint8Array<ArrayBuffer>) {
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(buffer);
    return;
  }

  const bytes = randomBytes(buffer.length);
  buffer.set(bytes);
}

function randomBigIntBitsInternal(bits: number, forceTopBit: boolean): bigint {
  if (!Number.isInteger(bits) || bits <= 0) {
    throw new Error("bits must be a positive integer.");
  }

  const byteLength = Math.ceil(bits / 8);
  const bytes = new Uint8Array(new ArrayBuffer(byteLength));
  fillRandom(bytes);

  const excessBits = byteLength * 8 - bits;
  if (excessBits > 0) {
    const mask = 0xff >>> excessBits;
    bytes[0] &= mask;
  }

  if (forceTopBit && bits > 1) {
    const topBit = (bits - 1) % 8;
    bytes[0] |= 1 << topBit;
  }

  return BigInt(`0x${Buffer.from(bytes).toString("hex")}`);
}

export function randomBigIntBits(bits: number): bigint {
  return randomBigIntBitsInternal(bits, true);
}

export function randomBigIntBetween(min: bigint, max: bigint): bigint {
  if (max < min) {
    throw new Error("max must be greater than or equal to min.");
  }

  if (max === min) {
    return min;
  }

  const range = max - min + 1n;
  const bits = range.toString(2).length;

  while (true) {
    const candidate = randomBigIntBitsInternal(bits, false);
    if (candidate < range) {
      return min + candidate;
    }
  }
}
