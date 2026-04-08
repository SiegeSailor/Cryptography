#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

WASM_EXPORT uint64_t powmod_u64(uint64_t base, uint64_t exponent, uint64_t modulo) {
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
