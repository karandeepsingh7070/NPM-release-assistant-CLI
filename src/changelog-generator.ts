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

export function getPackageInfo() {
  const cwd = process.cwd()
  const pkgPath = path.join(cwd, "package.json")

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))

  let sourceDir = cwd

  if (cwd.includes("/dist/")) {
    sourceDir = cwd.split("/dist/")[0]
  }

  return {
    name: pkg.name,
    version: pkg.version,
    dir: sourceDir
  }
}

function getDistPackageName(cwd: string) {
  if (!cwd.includes("/dist/")) return null

  const parts = cwd.split("/dist/")[1].split("/").filter(Boolean)

  if (parts.length === 0) return null

  return parts[parts.length - 1]
}

function findPackageDir(repoRoot: string, pkgFolder: string) {
  const directPath = path.join(repoRoot, pkgFolder)

  if (fs.existsSync(directPath)) return directPath

  const packagesPath = path.join(repoRoot, "packages", pkgFolder)

  if (fs.existsSync(packagesPath)) return packagesPath

  return repoRoot
}

export function createTag(pkgName: string, version: string) {

  const tag = `${pkgName}@${version}`
  execSync(`git tag ${tag}`)
}

export function updateChangelog(entry: string) {

  const repoRoot = getRepoRoot()
  const cwd = process.cwd()

  const distPkg = getDistPackageName(cwd)

  let changelogDir = repoRoot

  if (distPkg) {
    const found = findPackageDir(repoRoot, distPkg)
    changelogDir = found
  }

  const changelogPath = path.join(changelogDir, "CHANGELOG.md")

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, "# Changelog\n\n")
  }

  const existing = fs.readFileSync(changelogPath, "utf-8")

  const updated = existing + entry

  fs.writeFileSync(changelogPath, updated)

  console.log("Changelog updated at:", changelogPath)
}