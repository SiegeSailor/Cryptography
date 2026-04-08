#include <stdint.h>

#ifndef WASM_EXPORT
#define WASM_EXPORT __attribute__((visibility("default")))
#endif

WASM_EXPORT void extended_euclidean_i64(int64_t left, int64_t right, int64_t* gcd, int64_t* x, int64_t* y) {
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
