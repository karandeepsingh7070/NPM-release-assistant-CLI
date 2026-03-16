import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// function getRepoRoot() {
//   try {
//     return execSync("git rev-parse --show-toplevel")
//       .toString()
//       .trim()
//   } catch {
//     return process.cwd()
//   }
// }

export function getPackageInfo() {
  const pkgPath = path.join(process.cwd(), "package.json")

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  console.log("dir", process.cwd())

  return {
    name: pkg.name,
    version: pkg.version,
    dir: process.cwd()
  }
}

export function createTag(pkgName: string, version: string) {

  const tag = `${pkgName}@${version}`

  execSync(`git tag ${tag}`)
}

export function getChangelogPath(packageDir: string) {
  return `${packageDir}/CHANGELOG.md`
}

export function updateChangelog(entry: string) {

  // const repoRoot = getRepoRoot()
  const changelogPath = getChangelogPath(getPackageInfo().dir)

  const file = path.join(changelogPath, "CHANGELOG.md")

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "# Changelog\n\n")
  }

  const existing = fs.readFileSync(file, "utf-8")

  const updated = existing + entry

  fs.writeFileSync(file, updated)
}