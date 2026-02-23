const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function compileWithClang(root, sourcePath, outputPath) {
  const compile = spawnSync(
    "clang",
    [
      "--target=wasm32",
      "-O3",
      "-nostdlib",
      "-Wl,--no-entry",
      "-Wl,--export-all",
      "-Wl,--export-memory",
      "-Wl,--initial-memory=131072",
      "-Wl,--max-memory=16777216",
      "-o",
      outputPath,
      sourcePath,
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  );

  if (compile.error) {
    throw compile.error;
  }
  if (compile.status !== 0) {
    const output = `${compile.stderr || ""}${compile.stdout || ""}`;
    if (
      output.includes("No available targets are compatible") ||
      output.includes('triple "wasm32"')
    ) {
      console.warn(
        "Skipping WASM compilation: local clang does not support wasm32 target.",
      );
      return false;
    }
    throw new Error(output || "clang failed.");
  }

  return true;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const algorithmsRoot = path.join(root, "source", "algorithms");

  const algorithmDirs = fs
    .readdirSync(algorithmsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let compiledCount = 0;
  for (const dirName of algorithmDirs) {
    const sourcePath = path.join(algorithmsRoot, dirName, "main.c");
    const outputPath = path.join(algorithmsRoot, dirName, "main.wasm");
    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const compiled = compileWithClang(root, sourcePath, outputPath);
    if (compiled) {
      compiledCount += 1;
      console.log(`Compiled WebAssembly binary: ${outputPath}`);
    }
  }

  if (compiledCount === 0) {
    console.warn("No algorithm wasm binaries compiled in this run.");
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
