const fs = require("fs");
const path = require("path");

function main() {
  const root = path.resolve(__dirname, "..");
  const algorithmsSourceDir = path.join(root, "source", "algorithms");
  const algorithmsBuildDir = path.join(root, "build", "source", "algorithms");

  if (!fs.existsSync(algorithmsSourceDir)) {
    throw new Error(
      `Source algorithms directory does not exist: ${algorithmsSourceDir}`,
    );
  }

  fs.mkdirSync(algorithmsBuildDir, { recursive: true });

  const algorithmDirs = fs
    .readdirSync(algorithmsSourceDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  let copiedCount = 0;
  for (const dirName of algorithmDirs) {
    const sourceFile = path.join(algorithmsSourceDir, dirName, "main.wasm");
    if (!fs.existsSync(sourceFile)) {
      continue;
    }

    const buildTargetDir = path.join(algorithmsBuildDir, dirName);
    const buildTarget = path.join(buildTargetDir, "main.wasm");
    fs.mkdirSync(buildTargetDir, { recursive: true });
    fs.copyFileSync(sourceFile, buildTarget);
    copiedCount += 1;
    console.log(`Copied WebAssembly binary to: ${buildTarget}`);
  }

  if (copiedCount === 0) {
    console.warn(
      `No algorithm wasm binaries found in: ${algorithmsSourceDir}. Skipping copy.`,
    );
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
