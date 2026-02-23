#include <stdint.h>

#define WASM_EXPORT __attribute__((visibility("default")))

WASM_EXPORT uint64_t blum_blum_shub_next_u64(uint64_t state, uint64_t modulus) {
  if (modulus == 0) {
    return 0;
  }
  return (state * state) % modulus;
}
