const fs = require("fs");
const path = require("path");

function main() {
  const root = path.resolve(__dirname, "..");
  const sourceFile = path.join(root, "source", "wasm", "modexp.wasm");
  const buildTarget = path.join(root, "build", "source", "wasm", "modexp.wasm");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source wasm file does not exist: ${sourceFile}`);
  }

  fs.mkdirSync(path.dirname(buildTarget), { recursive: true });
  fs.copyFileSync(sourceFile, buildTarget);

  console.log(`Copied WebAssembly binary to: ${buildTarget}`);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
