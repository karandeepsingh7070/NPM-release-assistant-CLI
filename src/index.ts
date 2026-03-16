#!/usr/bin/env node
import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs";
import { groupCommits, generateMarkdown, getPackageCommits } from "./git-helper";
import { createTag, getPackageInfo, updateChangelog } from "./changelog-generator";

type PromptAnswers = {
  type: string;
  description: string;
  ticket?: string;
};

function isPromptExitError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: string }).name === "ExitPromptError"
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function run() {
  let author = "Unknown";
  try {
    author = execSync("git config user.name")
      .toString()
      .trim() || "Unknown";
  } catch {
    console.warn("Warning: Could not read git user.name; using 'Unknown'.");
  }

  const pkg = getPackageInfo();

  let answers: PromptAnswers;
  try {
    answers = await inquirer.prompt([
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
  } catch (error: unknown) {
    if (isPromptExitError(error)) {
      console.log("\nPrompt cancelled. No changes were made.");
      return;
    }
    throw error;
  }

  const metadata = {
    package: pkg.name,
    version: pkg.version,
    author,
    date: new Date().toISOString(),
    ...answers
  };

  const commits = getPackageCommits(pkg.name, pkg.dir);
  if (commits.length === 0) {
    console.warn("Warning: No commits detected since last release.");
  }

  const groups = groupCommits(commits);
  const entry = generateMarkdown(metadata, groups)
  updateChangelog(entry);

  try {
    execSync("git add CHANGELOG.md");
    createTag(pkg.name, pkg.version)
  } catch {
    console.warn("Warning: Could not stage CHANGELOG.md.");
  }

  console.log("Release metadata saved.");
}

run().catch((error: unknown) => {
  if (isPromptExitError(error)) {
    console.log("\nPrompt cancelled. No changes were made.");
    return;
  }

  console.error(`Release assistant failed: ${getErrorMessage(error)}`);
  process.exitCode = 1;
});