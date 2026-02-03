import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");

const exts = [".ts", ".tsx", ".js", ".jsx"];
const libRoot = path.join(SRC, "lib");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) out.push(p);
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function resolveLocalImport(fromFile, spec) {
  // handles "@/lib/..." and relative "../lib/..."
  if (spec.startsWith("@/")) {
    return path.join(SRC, spec.slice(2));
  }
  if (spec.startsWith(".")) {
    return path.resolve(path.dirname(fromFile), spec);
  }
  return null;
}

function findExistingFile(base) {
  // base may already include extension
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

  for (const ext of exts) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  // index.* in a folder
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const ext of exts) {
      const idx = path.join(base, "index" + ext);
      if (fs.existsSync(idx)) return idx;
    }
  }
  return null;
}

function writeStub(filePath, kind) {
  ensureDir(filePath);
  if (fs.existsSync(filePath)) return;

  let body = "";
  if (kind === "types") {
    body =
`/**
 * Temporary stub to satisfy Next build.
 * Replace with real types later.
 */
export type Any = any;
`;
  } else {
    body =
`/**
 * Temporary stub to satisfy Next build.
 * Replace with real logic later.
 */
export const stub = true;
export default {};
`;
  }
  fs.writeFileSync(filePath, body, "utf8");
}

const files = walk(SRC);

// 1) Collect all imports from ../lib/store.repo (or @/lib/store.repo)
const storeRepoImports = new Set();
const storeRepoSpecs = new Set(["../lib/store.repo", "@/lib/store.repo"]);

for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  const importRe = /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']/g;
  let m;
  while ((m = importRe.exec(txt))) {
    const names = m[1].split(",").map(s => s.trim()).filter(Boolean);
    const spec = m[2];
    if (storeRepoSpecs.has(spec)) {
      for (const n of names) {
        const clean = n.split(/\s+as\s+/)[0].trim();
        if (clean) storeRepoImports.add(clean);
      }
    }
  }
}

// Always keep these around too
["billStore", "orderStore", "sessionStore"].forEach(n => storeRepoImports.add(n));

// Generate store.repo.ts exporting every imported store name as a Map-store
ensureDir(path.join(libRoot, "store.repo.ts"));
const storeRepoPath = path.join(libRoot, "store.repo.ts");

const storeNames = Array.from(storeRepoImports).sort();

const storeRepoContent =
`/**
 * Temporary in-memory stores to satisfy Next build.
 * Replace with real persistence later.
 */

type AnyMapStore<T> = {
  get: (key: string) => T | null;
  set: (key: string, value: T) => void;
  delete: (key: string) => void;
  values: () => T[];
  getAll: () => T[];
};

function createStore<T>(): AnyMapStore<T> {
  const m = new Map<string, T>();
  const values = () => Array.from(m.values());
  return {
    get: (key) => m.get(key) ?? null,
    set: (key, value) => void m.set(key, value),
    delete: (key) => void m.delete(key),
    values,
    getAll: values,
  };
}

${storeNames.map(n => `export const ${n} = createStore<any>();`).join("\n")}
`;

fs.writeFileSync(storeRepoPath, storeRepoContent, "utf8");

// 2) Create stub files for missing "@/lib/*" and "../lib/*" imports
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");

  // import ... from "x"
  const anyImportRe = /from\s+["']([^"']+)["']/g;
  let m;
  while ((m = anyImportRe.exec(txt))) {
    const spec = m[1];

    // Only handle local lib imports
    if (!(spec.startsWith("@/lib/") || spec.includes("/lib/") && spec.startsWith("."))) continue;

    const base = resolveLocalImport(f, spec);
    if (!base) continue;

    // If it resolves to src/lib/... ensure file exists
    if (!base.startsWith(libRoot)) continue;

    const existing = findExistingFile(base);
    if (existing) continue;

    // decide stub type based on filename
    const isTypes = /(\.types$|types$)/.test(base);
    const stubPath = base + ".ts";
    writeStub(stubPath, isTypes ? "types" : "logic");
  }
}

console.log("Applied bulk stub + store.repo export sync.");
