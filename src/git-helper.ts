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
  export { getCommitsSinceLastTag, groupCommits, generateMarkdown }