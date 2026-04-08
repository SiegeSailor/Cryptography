#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

#include "../extended-euclidean/main.c"

WASM_EXPORT int64_t multiplicative_inverse_i64(int64_t base, int64_t modulo) {
  int64_t gcd = 0;
  int64_t x = 0;
  int64_t y = 0;
  extended_euclidean_i64(base, modulo, &gcd, &x, &y);
  if (gcd != 1) {
    return INT64_MIN;
  }

  int64_t inverse = x % modulo;
  if (inverse < 0) {
    inverse += modulo;
  }
  return inverse;
}
