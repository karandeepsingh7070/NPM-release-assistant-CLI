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


function getPackageShortName(pkgName: string) {
  return pkgName.split("/").pop() || pkgName
}

export function getPackageInfo() {
  const cwd = process.cwd()
  const pkgPath = path.join(cwd, "package.json")

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))

  const repoRoot = getRepoRoot()

  const pkgShortName = getPackageShortName(pkg.name)
  const changelogDir = findPackageDir(repoRoot, pkgShortName)

  return {
    name: pkg.name,
    version: pkg.version,
    dir: changelogDir
  }
}

function findPackageDir(repoRoot: string, packageName: string): string {
  const targetShortName = getPackageShortName(packageName)

  const stack = [repoRoot]

  while (stack.length) {

    const current = stack.pop()!

    const files = fs.readdirSync(current, { withFileTypes: true })

    for (const file of files) {

      const fullPath = path.join(current, file.name)

      if (file.isDirectory()) {

        // skip heavy folders
        if (["node_modules", ".git", "dist", "build"].includes(file.name)) {
          continue
        }

        stack.push(fullPath)

      } else if (file.name === "package.json") {
        console.log("found package.json at:", fullPath)
        try {
          const pkg = JSON.parse(fs.readFileSync(fullPath, "utf-8"))
          const pkgFullName = typeof pkg.name === "string" ? pkg.name : ""
          const pkgShortName = getPackageShortName(pkgFullName)

          if (
            pkgFullName === packageName ||
            pkgShortName === packageName ||
            pkgShortName === targetShortName
          ) {
            console.log("found package at:", current)
            return current
          }

        } catch {
        }
      }
    }
  }
  console.log("no package found", packageName)
  return repoRoot
}

export function createTag(pkgName: string, version: string) {

  const tag = `${pkgName}@${version}`
  execSync(`git tag ${tag}`)
}

export function updateChangelog(entry: string) {

  const pkg = getPackageInfo()
  const changelogPath = path.join(pkg.dir, "CHANGELOG.md")

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, "# Changelog\n\n")
  }

  const existing = fs.readFileSync(changelogPath, "utf-8")

  const updated = existing + entry

  fs.writeFileSync(changelogPath, updated)

  console.log("Changelog updated at:", changelogPath)
}
