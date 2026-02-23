#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

static void extended_euclidean_i64_internal(int64_t left, int64_t right, int64_t* gcd, int64_t* x, int64_t* y) {
  int64_t old_r = left;
  int64_t r = right;
  int64_t old_s = 1;
  int64_t s = 0;
  int64_t old_t = 0;
  int64_t t = 1;

  while (r != 0) {
    const int64_t quotient = old_r / r;

    const int64_t temp_r = old_r - quotient * r;
    old_r = r;
    r = temp_r;

    const int64_t temp_s = old_s - quotient * s;
    old_s = s;
    s = temp_s;

    const int64_t temp_t = old_t - quotient * t;
    old_t = t;
    t = temp_t;
  }

  *gcd = old_r;
  *x = old_s;
  *y = old_t;
}

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
    extended_euclidean_i64_internal(partial, modulo, &gcd, &inverse, &y);
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
