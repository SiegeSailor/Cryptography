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

WASM_EXPORT int64_t pollard_rho_i64(int64_t input, int64_t seed, int64_t c, int32_t max_iterations) {
  if (input <= 1) {
    return 1;
  }
  if ((input & 1) == 0) {
    return 2;
  }

  const uint64_t n = (uint64_t)input;
  uint64_t x = (uint64_t)seed % n;
  uint64_t y = x;
  const uint64_t constant = (uint64_t)c % n;

  for (int32_t i = 0; i < max_iterations; i++) {
    x = (x * x + constant) % n;
    y = (y * y + constant) % n;
    y = (y * y + constant) % n;

    const uint64_t diff = x > y ? x - y : y - x;
    const uint64_t divisor = gcd_u64_internal(diff, n);

    if (divisor > 1 && divisor < n) {
      return (int64_t)divisor;
    }
    if (divisor == n) {
      return 1;
    }
  }

  return 1;
}
