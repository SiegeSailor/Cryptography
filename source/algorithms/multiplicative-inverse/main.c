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

WASM_EXPORT int64_t multiplicative_inverse_i64(int64_t base, int64_t modulo) {
  int64_t gcd = 0;
  int64_t x = 0;
  int64_t y = 0;
  extended_euclidean_i64_internal(base, modulo, &gcd, &x, &y);
  if (gcd != 1) {
    return INT64_MIN;
  }

  int64_t inverse = x % modulo;
  if (inverse < 0) {
    inverse += modulo;
  }
  return inverse;
}
