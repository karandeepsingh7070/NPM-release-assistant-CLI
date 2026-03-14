import fs from "fs"

function updateChangelog(entry: string) {

  const file = "CHANGELOG.md"

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "# Changelog\n")
  }

  const existing = fs.readFileSync(file, "utf-8")

  const updated = existing + entry

  fs.writeFileSync(file, updated)
}

export { updateChangelog }