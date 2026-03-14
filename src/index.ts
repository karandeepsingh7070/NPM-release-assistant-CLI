#!/usr/bin/env node
import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs";
import { getCommitsSinceLastTag, groupCommits, generateMarkdown } from "./git-helper";
import { updateChangelog } from "./changelog-generator";

async function run() {

  const author = execSync("git config user.name")
    .toString()
    .trim();

  const pkg = JSON.parse(fs.readFileSync("package.json","utf-8"));

  const answers = await inquirer.prompt([
    {
      type: "rawlist",
      name: "type",
      message: "Release type",
      choices: ["Feature", "Bug Fix", "Enhancement"]
    },
    {
      type: "input",
      name: "description",
      message: "Describe the change"
    },
    {
      type: "input",
      name: "ticket",
      message: "JIRA ticket (optional)"
    }
  ]);

  const metadata = {
    package: pkg.name,
    version: pkg.version,
    author,
    date: new Date().toISOString(),
    ...answers
  };

  const commits = getCommitsSinceLastTag();
  const groups = groupCommits(commits);
  const entry = generateMarkdown(metadata, groups)
  updateChangelog(entry);

  execSync(`git add CHANGELOG.md`)

  console.log("Release metadata saved.");
}

run();