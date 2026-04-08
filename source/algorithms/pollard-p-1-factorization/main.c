#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

#include "../euclidean/main.c"
#include "../fast-modular-exponentiation/main.c"

WASM_EXPORT int64_t pollard_p1_i64(int64_t input, int32_t max_exponent) {
  if (input <= 1) {
    return -1;
  }

  uint64_t base = 2;
  const uint64_t n = (uint64_t)input;

  for (int32_t exponent = 2; exponent < max_exponent; exponent++) {
    base = powmod_u64(base, (uint64_t)exponent, n);
    const uint64_t factor = gcd_u64(base > 0 ? base - 1 : 0, n);
    if (factor > 1 && factor < n) {
      return (int64_t)factor;
    }
  }

  return -1;
}
