#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

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

WASM_EXPORT int32_t primitive_root_search_i64(int64_t prime, int64_t* out_roots, int32_t max_roots) {
  if (prime <= 2 || max_roots <= 0) {
    return 0;
  }

  const int64_t phi = prime - 1;
  int64_t n = phi;
  int64_t factors[64];
  int32_t factor_count = 0;

  for (int64_t p = 2; p * p <= n; p++) {
    if (n % p == 0) {
      if (factor_count < 64) {
        factors[factor_count++] = p;
      }
      while (n % p == 0) {
        n /= p;
      }
    }
  }
  if (n > 1 && factor_count < 64) {
    factors[factor_count++] = n;
  }

  int32_t count = 0;
  for (int64_t candidate = 2; candidate < prime; candidate++) {
    int32_t is_primitive = 1;
    for (int32_t i = 0; i < factor_count; i++) {
      const int64_t exponent = phi / factors[i];
      const uint64_t value = powmod_u64_internal((uint64_t)candidate, (uint64_t)exponent, (uint64_t)prime);
      if (value == 1ULL) {
        is_primitive = 0;
        break;
      }
    }

    if (is_primitive) {
      if (count < max_roots) {
        out_roots[count] = candidate;
      }
      count++;
    }
  }

  return count;
}
