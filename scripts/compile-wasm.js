const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const TOOLCHAIN_PATH_PREFIX = [
  "/opt/homebrew/bin",
  "/opt/homebrew/opt/llvm/bin",
].join(":");

function getToolchainEnv() {
  return {
    ...process.env,
    PATH: `${TOOLCHAIN_PATH_PREFIX}:${process.env.PATH || ""}`,
  };
}

function compilerSupportsWasm32(compilerPath) {
  const result = spawnSync(compilerPath, ["--print-targets"], {
    encoding: "utf8",
    env: getToolchainEnv(),
  });

  if (result.error || result.status !== 0) {
    return false;
  }

  return (result.stdout || "").toLowerCase().includes("wasm32");
}

function getCompilerCandidates() {
  return [
    process.env.WASM_CLANG,
    "/opt/homebrew/opt/llvm/bin/clang",
    "clang",
  ].filter(Boolean);
}

function resolveWasmCompiler() {
  const candidates = getCompilerCandidates();
  for (const candidate of candidates) {
    if (compilerSupportsWasm32(candidate)) {
      return candidate;
    }
  }
  return null;
}

function compileWithClang(root, compilerPath, sourcePath, outputPath) {
  const compile = spawnSync(
    compilerPath,
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
      env: getToolchainEnv(),
    },
  );

  if (compile.error) {
    throw compile.error;
  }
  if (compile.status !== 0) {
    const output = `${compile.stderr || ""}${compile.stdout || ""}`;
    if (output.includes("posix_spawn failed: No such file or directory")) {
      throw new Error(
        `${output}\nInstall wasm linker support (Homebrew: brew install lld).`,
      );
    }
    throw new Error(output || "clang failed.");
  }

  return true;
}

function main() {
  const root = path.resolve(__dirname, "..");
  const algorithmsRoot = path.join(root, "source", "algorithms");
  const strict = process.env.WASM_STRICT === "1";
  const compilerPath = resolveWasmCompiler();

  if (!compilerPath) {
    const message =
      "Skipping WASM compilation: no wasm32-capable clang found. " +
      "Install Homebrew llvm (`brew install llvm`) or set WASM_CLANG to a clang binary that supports wasm32.";
    if (strict) {
      throw new Error(message);
    }
    console.warn(message);
    return;
  }

  console.log(`Using clang for wasm build: ${compilerPath}`);

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
    const compiled = compileWithClang(
      root,
      compilerPath,
      sourcePath,
      outputPath,
    );
    if (compiled) {
      compiledCount += 1;
      console.log(`Compiled WebAssembly binary: ${outputPath}`);
    }
  }

  if (compiledCount === 0) {
    const message = "No algorithm wasm binaries compiled in this run.";
    if (strict) {
      throw new Error(message);
    }
    console.warn(message);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
