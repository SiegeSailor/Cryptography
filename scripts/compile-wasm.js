const fs = require("fs");
const path = require("path");
const wabtFactory = require("wabt");

async function main() {
  const root = path.resolve(__dirname, "..");
  const watPath = path.join(root, "source", "wasm", "modexp.wat");
  const wasmPath = path.join(root, "source", "wasm", "modexp.wasm");

  const watSource = fs.readFileSync(watPath, "utf8");
  const wabt = await wabtFactory();
  const module = wabt.parseWat(watPath, watSource);
  const { buffer } = module.toBinary({
    log: false,
    write_debug_names: false,
  });

  fs.mkdirSync(path.dirname(wasmPath), { recursive: true });
  fs.writeFileSync(wasmPath, Buffer.from(buffer));
  module.destroy();

  console.log(`Compiled WebAssembly binary: ${wasmPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
