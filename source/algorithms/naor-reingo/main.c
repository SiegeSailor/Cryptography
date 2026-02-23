#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

WASM_EXPORT int32_t naor_reingo_fill_i64(int32_t count, int32_t digits, int64_t seed, int64_t* out_values) {
  if (count <= 0 || digits <= 0) {
    return 0;
  }

  int64_t lower = 1;
  for (int32_t i = 1; i < digits; i++) {
    lower *= 10;
  }
  int64_t upper = lower * 10 - 1;
  int64_t range = upper - lower + 1;

  uint64_t state = (uint64_t)seed;
  for (int32_t i = 0; i < count; i++) {
    state = state * 6364136223846793005ULL + 1442695040888963407ULL;
    const int64_t value = lower + (int64_t)(state % (uint64_t)range);
    out_values[i] = value;
  }

  return count;
}
