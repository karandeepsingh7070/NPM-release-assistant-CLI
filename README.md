# org-npm-release-assistant

A CLI release assistant that collects release metadata, reads git commits, and appends a formatted entry to `CHANGELOG.md`.

## Features

- Interactive release prompt (release type, summary, optional ticket)
- Automatic author detection from local git config
- Commit grouping from git history (`feat:`, `fix:`, `chore:`, plus others)
- Markdown changelog entry generation
- Auto-stages `CHANGELOG.md` with `git add CHANGELOG.md`
- Monorepo supported

## Installation

Install as an npm package:

```bash
npm install org-npm-release-assistant
```

Global install (optional):

```bash
npm install -g org-npm-release-assistant
```

## Usage

Run the CLI command:

```bash
release-assistant
```

If installed locally, you can also run:

```bash
npx release-assistant
```

## What It Prompts For

- **Release type**: `Feature`, `Bug Fix`, or `Enhancement`
- **Description**: Short summary of the release
- **JIRA ticket (optional)**: Ticket reference (if available)

## How It Builds the Changelog

The tool:

1. Reads package name/version from `package.json`
2. Reads author from `git config user.name`
3. Gets commits since last git tag (or last 10 commits if no tag exists)
4. Groups commits by prefix:
  - `feat:` -> Features
  - `fix:` -> Fixes
  - `chore:` -> Chores
  - everything else -> Others
5. Appends a new entry to `CHANGELOG.md`
6. Runs `git add CHANGELOG.md`

Example entry shape:

```md
## 1.0.0 (2026-03-14)

Author: Your Name
Type: Feature
Ticket: ABC-123

### Summary
Release summary text

### Features
- add login flow

### Fixes
- resolve version parsing bug

### Chores
- update dependencies

### Others
- some other commit message
```

## Requirements

- Node.js 18+ recommended
- A git repository
- `git config user.name` set

## Development

Build:

```bash
npm run build
```

Link locally for testing the CLI:

```bash
npm link
release-assistant
```

## Notes

- `CHANGELOG.md` is created automatically if it does not exist.
- Commit grouping works best when using conventional commit prefixes (`feat:`, `fix:`, `chore:`).

