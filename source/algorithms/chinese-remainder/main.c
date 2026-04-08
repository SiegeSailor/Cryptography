#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

#include "../extended-euclidean/main.c"

WASM_EXPORT int64_t chinese_remainder_i64(const int64_t* remainders, const int64_t* modulos, int32_t length) {
  if (length <= 0) {
    return INT64_MIN;
  }

  uint64_t modular = 1;
  for (int32_t i = 0; i < length; i++) {
    if (modulos[i] <= 0) {
      return INT64_MIN;
    }
    modular *= (uint64_t)modulos[i];
  }

  int64_t x = 0;
  for (int32_t i = 0; i < length; i++) {
    const int64_t modulo = modulos[i];
    const int64_t partial = (int64_t)(modular / (uint64_t)modulo);

    int64_t gcd = 0;
    int64_t inverse = 0;
    int64_t y = 0;
    extended_euclidean_i64(partial, modulo, &gcd, &inverse, &y);
    if (gcd != 1) {
      return INT64_MIN;
    }

    inverse = ((inverse % modulo) + modulo) % modulo;
    x += remainders[i] * partial * inverse;
  }

  int64_t result = x % (int64_t)modular;
  if (result < 0) {
    result += (int64_t)modular;
  }

  return result;
}
