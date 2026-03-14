import { execSync } from "child_process";

function getLastTag() {
    try {
      return execSync("git describe --tags --abbrev=0")
        .toString()
        .trim()
    } catch {
      return null
    }
  }

  function getCommitsSinceLastTag() {
    const lastTag = getLastTag()
  
    if (!lastTag) {
      return execSync("git log --pretty=format:'%h %s (%an)' -10")
        .toString()
        .split("\n")
    }
  
    return execSync(
      `git log ${lastTag}..HEAD --pretty=format:'%h %s (%an)'`
    )
      .toString()
      .split("\n")
  }

  export { getLastTag, getCommitsSinceLastTag }