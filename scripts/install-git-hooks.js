import { chmodSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gitDir = join(root, ".git");
const hooksDir = join(gitDir, "hooks");

if (!existsSync(gitDir)) {
  process.exit(0);
}

mkdirSync(hooksDir, { recursive: true });
const dest = join(hooksDir, "pre-commit");
copyFileSync(join(root, "scripts", "pre-commit"), dest);
chmodSync(dest, 0o755);
