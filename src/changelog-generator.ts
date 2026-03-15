import fs from "fs"
import path from "path"
import { execSync } from "child_process"

function getRepoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel")
      .toString()
      .trim()
  } catch {
    return process.cwd()
  }
}

export function updateChangelog(entry: string) {

  const repoRoot = getRepoRoot()

  const file = path.join(repoRoot, "CHANGELOG.md")

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "# Changelog\n\n")
  }

  const existing = fs.readFileSync(file, "utf-8")

  const updated = existing + entry

  fs.writeFileSync(file, updated)
}