#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

WASM_EXPORT int64_t baby_step_giant_step_i64(int64_t generator, int64_t base, int64_t modulo, int64_t limit) {
  if (modulo <= 1 || limit <= 0) {
    return -1;
  }

  int64_t current = 1 % modulo;
  for (int64_t exponent = 0; exponent <= limit; exponent++) {
    if (current == (base % modulo + modulo) % modulo) {
      return exponent;
    }
    current = (int64_t)(((uint64_t)current * (uint64_t)((generator % modulo + modulo) % modulo)) % (uint64_t)modulo);
  }

  return -1;
}
