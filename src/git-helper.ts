import { execSync } from "child_process";

type CommitGroups = {
  features: string[];
  fixes: string[];
  chores: string[];
  others: string[];
};

type ReleaseMetadata = {
  version: string;
  date: string;
  author: string;
  type: string;
  description: string;
  ticket?: string;
  notes?: string;
};

  function getPackageCommits(pkgName: string, packageDir: string) {

    try{
      const lastTag = getLastPackageTag(pkgName)
      const range = lastTag ? `${lastTag}..HEAD` : ""
  
      const commits = execSync(
        `git log ${range} --pretty=format:"%s" -- ${packageDir}`
      )
        .toString()
        .split("\n")
        .filter(Boolean)
      console.log("commits", commits)
      return commits
    }
    catch {
      return []
    }
  }

  function getLastPackageTag(pkgName: string) {

    try {
      const tags = execSync("git tag --sort=-creatordate")
        .toString()
        .split("\n")
  
      const packageTags = tags.filter(t => t.startsWith(`${pkgName}@`))
  
      return packageTags[0] || null
    } catch {
      return null
    }
  }

function groupCommits(commits: string[]): CommitGroups {

    const groups: CommitGroups = {
      features: [],
      fixes: [],
      chores: [],
      others: []
    }
  
    for (const commit of commits) {
  
      if (commit.startsWith("feat:"))
        groups.features.push(commit.replace("feat:", "").trim())
  
      else if (commit.startsWith("fix:"))
        groups.fixes.push(commit.replace("fix:", "").trim())
  
      else if (commit.startsWith("chore:"))
        groups.chores.push(commit.replace("chore:", "").trim())
  
      else
        groups.others.push(commit)
    }
    return groups
  }

  function generateMarkdown(metadata: ReleaseMetadata, groups: CommitGroups) {

    let md = `\n## ${metadata.version} (${metadata.date.split("T")[0]})\n`
  
    md += `\nAuthor: ${metadata.author}\n`
    md += `Type: ${metadata.type}\n`
  
    if (metadata.ticket)
      md += `Ticket: ${metadata.ticket}\n`
  
    md += `\n### Summary\n${metadata.description}\n`
  
    if (metadata.notes)
      md += `\n### Notes\n${metadata.notes}\n`
  
    if (groups.features.length) {
      md += "\n### Features\n"
      groups.features.forEach((c: string) => md += `- ${c}\n`)
    }
  
    if (groups.fixes.length) {
      md += "\n### Fixes\n"
      groups.fixes.forEach((c: string) => md += `- ${c}\n`)
    }
  
    if (groups.chores.length) {
      md += "\n### Chores\n"
      groups.chores.forEach((c: string) => md += `- ${c}\n`)
    }

    if (groups.others.length) {
      md += "\n### Others\n"
      groups.others.forEach((c: string) => md += `- ${c}\n`)
    }
    
    return md
  }
  export { groupCommits, generateMarkdown, getPackageCommits, getLastPackageTag }