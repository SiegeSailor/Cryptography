#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

WASM_EXPORT uint64_t gcd_u64(uint64_t left, uint64_t right) {
  while (right != 0) {
    const uint64_t cache = right;
    right = left % right;
    left = cache;
  }
  return left;
}
