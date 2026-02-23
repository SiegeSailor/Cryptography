#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

static uint64_t gcd_u64_internal(uint64_t left, uint64_t right) {
  while (right != 0) {
    const uint64_t cache = right;
    right = left % right;
    left = cache;
  }
  return left;
}

static uint64_t powmod_u64_internal(uint64_t base, uint64_t exponent, uint64_t modulo) {
  if (modulo == 0) {
    return 0;
  }

  uint64_t result = 1;
  uint64_t current_base = base % modulo;
  uint64_t current_exponent = exponent;

  while (current_exponent > 0) {
    if ((current_exponent & 1ULL) == 1ULL) {
      result = (result * current_base) % modulo;
    }
    current_base = (current_base * current_base) % modulo;
    current_exponent >>= 1ULL;
  }

  return result;
}

WASM_EXPORT int64_t pollard_p1_i64(int64_t input, int32_t max_exponent) {
  if (input <= 1) {
    return -1;
  }

  uint64_t base = 2;
  const uint64_t n = (uint64_t)input;

  for (int32_t exponent = 2; exponent < max_exponent; exponent++) {
    base = powmod_u64_internal(base, (uint64_t)exponent, n);
    const uint64_t factor = gcd_u64_internal(base > 0 ? base - 1 : 0, n);
    if (factor > 1 && factor < n) {
      return (int64_t)factor;
    }
  }

  return -1;
}
