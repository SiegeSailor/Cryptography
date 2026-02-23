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

WASM_EXPORT int32_t miller_rabin_u64(uint64_t input, int32_t level) {
  if (input <= 1ULL || input == 4ULL) {
    return 0;
  }
  if (input <= 3ULL) {
    return 1;
  }
  if ((input & 1ULL) == 0ULL) {
    return 0;
  }

  uint64_t d = input - 1ULL;
  while ((d & 1ULL) == 0ULL) {
    d >>= 1ULL;
  }

  const uint64_t bases[] = {
      2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 17ULL, 19ULL, 23ULL, 29ULL, 31ULL, 37ULL};
  const int32_t base_count = (int32_t)(sizeof(bases) / sizeof(bases[0]));
  const int32_t rounds = level < base_count ? level : base_count;

  for (int32_t i = 0; i < rounds; i++) {
    const uint64_t a = bases[i] % (input - 2ULL) + 2ULL;
    uint64_t x = powmod_u64_internal(a, d, input);

    if (x == 1ULL || x == input - 1ULL) {
      continue;
    }

    uint64_t current_d = d;
    int32_t witness = 0;
    while (current_d != input - 1ULL) {
      x = (x * x) % input;
      current_d <<= 1ULL;

      if (x == 1ULL) {
        return 0;
      }
      if (x == input - 1ULL) {
        witness = 1;
        break;
      }
    }

    if (!witness) {
      return 0;
    }
  }

  return 1;
}
