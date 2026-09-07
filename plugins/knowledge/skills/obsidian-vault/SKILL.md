---
name: obsidian-vault
description: Manage a local Obsidian vault from the command line using the Obsidian CLI. Use when the user wants to create, read, search, or organize notes, manage tasks, work with daily notes, handle properties/tags, or automate vault operations. Triggers on mentions of Obsidian, vault, notes, daily notes, or PKM workflows.
allowed-tools: Bash(obsidian *)
---

# Obsidian Vault Manager

Manage a local Obsidian vault using the `obsidian` CLI. Requires Obsidian 1.12+ running locally with CLI enabled.

## Loop Role

Obsidian is the durable note layer for interviews, transcripts, research
summaries, PRDs, kickoff docs, meeting notes, and agent session artifacts. Use
it to read or publish the human-facing record around the CE loops. Use QMD when
you need indexed search across that knowledge; use Obsidian when you need to
inspect, edit, open, or organize the vault itself.

## Prerequisites

- Obsidian app must be running (CLI connects to the running instance)
- CLI enabled: Settings > General > Command line interface
- `obsidian` binary on PATH (registered during CLI setup)

## Quick Start

```bash
# Check connectivity
obsidian version

# Read the active file
obsidian read

# Open today's daily note
obsidian daily

# Search the vault
obsidian search query="meeting notes"

# Create a new note
obsidian create name="Project Plan" content="# Project Plan\n\nTasks go here."
```

## Core Workflows

### Reading & Writing Notes

```bash
# Read a file by name (wikilink resolution)
obsidian read file=Recipe

# Read by exact path
obsidian read path="Projects/Recipe.md"

# Create a note (with optional template)
obsidian create name="Trip to Paris" template=Travel

# Append to a file
obsidian append file=Recipe content="## New Section\n\nContent here."

# Prepend after frontmatter
obsidian prepend file=Recipe content="Updated: 2025-01-15"

# Copy output to clipboard
obsidian read file=Recipe --copy
```

### Daily Notes

```bash
# Open daily note
obsidian daily

# Read daily note contents
obsidian daily:read

# Get daily note path (even if not yet created)
obsidian daily:path

# Append a task to daily note
obsidian daily:append content="- [ ] Buy groceries"

# Prepend a note to daily note
obsidian daily:prepend content="## Morning standup\n\n- Completed X"
```

### Search

```bash
# Search vault
obsidian search query="meeting notes"

# Search with context (grep-style path:line output)
obsidian search:context query="TODO"

# Limit results and folder scope
obsidian search query="api" path=Projects limit=10

# Case sensitive search
obsidian search query="API" case

# Count matches only
obsidian search query="TODO" total
```

### Tasks

```bash
# List all incomplete tasks
obsidian tasks todo

# List completed tasks
obsidian tasks done

# Tasks from daily note
obsidian tasks daily

# Tasks from a specific file with line numbers
obsidian tasks file=Recipe verbose

# Count tasks
obsidian tasks daily total

# Toggle a task
obsidian task ref="Recipe.md:8" toggle

# Mark done
obsidian task daily line=3 done

# Set custom status
obsidian task file=Recipe line=8 status=-
```

### Properties & Tags

```bash
# List all properties in vault
obsidian properties counts

# Read a property from a file
obsidian property:read name=status file=Recipe

# Set a property
obsidian property:set name=status value=draft file=Recipe

# Remove a property
obsidian property:remove name=status file=Recipe

# List all tags with counts
obsidian tags counts

# Get tag info
obsidian tag name=project verbose
```

### File Management

```bash
# File info
obsidian file file=Recipe

# List files in a folder
obsidian files folder=Projects

# Count files
obsidian files total

# Move/rename
obsidian move file=Recipe to=Archive
obsidian rename file=Recipe name="Old Recipe"

# Delete (to trash)
obsidian delete file=Recipe

# Open a file in Obsidian
obsidian open file=Recipe newtab
```

### Links & Graph

```bash
# Backlinks to a file
obsidian backlinks file=Recipe

# Outgoing links
obsidian links file=Recipe

# Unresolved links (broken wikilinks)
obsidian unresolved

# Orphan files (no incoming links)
obsidian orphans

# Dead-end files (no outgoing links)
obsidian deadends
```

## Parameter Conventions

- **`file=<name>`** - Resolves via wikilink matching (no path/extension needed)
- **`path=<path>`** - Exact path from vault root (e.g. `folder/note.md`)
- **Flags** - Boolean switches with no value: `open`, `newtab`, `overwrite`, `total`, `verbose`
- **Multiline** - Use `\n` for newline, `\t` for tab
- **Vault targeting** - `vault=<name>` as first param: `obsidian vault=Notes daily`
- **Clipboard** - Add `--copy` to any command to copy output

## Output Formats

Many commands support `format=` parameter:

| Format | Use case |
|--------|----------|
| `json` | Structured data for parsing |
| `tsv` | Tab-separated, good for piping |
| `csv` | Comma-separated |
| `md` | Markdown formatted |
| `text` | Plain text (default for search) |
| `yaml` | YAML (default for properties) |
| `tree` | Tree view (default for outline) |

## Advanced Usage

### Evaluate JavaScript

```bash
# Run JS in the Obsidian console
obsidian eval code="app.vault.getFiles().length"

# Get vault stats
obsidian eval code="JSON.stringify(app.vault.adapter.stat('.'))"
```

### Execute Obsidian Commands

```bash
# List all command IDs
obsidian commands

# Run any command palette command
obsidian command id=editor:toggle-bold

# Check hotkeys
obsidian hotkeys
```

### Templates

```bash
# List templates
obsidian templates

# Read a template (with variable resolution)
obsidian template:read name=Daily resolve title="My Note"

# Create a file from template
obsidian create name="New Meeting" template="Meeting Notes"
```

### Plugins

```bash
# List installed plugins
obsidian plugins

# Enable/disable a plugin
obsidian plugin:enable id=dataview
obsidian plugin:disable id=calendar

# Install a community plugin
obsidian plugin:install id=obsidian-git enable

# Reload plugin (for development)
obsidian plugin:reload id=my-plugin
```

### Developer Tools

```bash
# Toggle dev tools
obsidian devtools

# Take a screenshot
obsidian dev:screenshot path=screenshot.png

# Check JS errors
obsidian dev:errors

# Console messages
obsidian dev:console limit=20 level=error

# DOM inspection
obsidian dev:dom selector=".workspace-leaf" total
```

## Agent Patterns

### Capture Context to Vault

```bash
# Save a summary to the vault
obsidian create name="Session Notes - Feb 2025" \
  content="# Session Notes\n\n## Decisions\n\n- Chose approach A\n- Deferred B to next sprint"

# Append to an existing log
obsidian append file="Decision Log" \
  content="\n## 2025-02-25\n\n- Approved new API design"
```

### Research a Topic in the Vault

```bash
# Search for related notes
obsidian search:context query="authentication"

# Get the outline of a key file
obsidian outline file="Architecture"

# Read specific notes for context
obsidian read file="Auth Design"
obsidian read file="API Spec"
```

### Daily Note Workflow

```bash
# Check today's tasks
obsidian tasks daily todo

# Add completed work
obsidian daily:append content="- [x] Shipped auth refactor PR #142"

# Mark task done by line
obsidian task daily line=5 done
```

### Vault Health Check

```bash
# Orphan files
obsidian orphans total

# Unresolved links
obsidian unresolved total

# Dead-end files
obsidian deadends total

# Vault stats
obsidian vault
obsidian files total
obsidian tags counts sort=count
```

## Reference

For the full command reference with all parameters and flags, see [cli-reference.md](references/cli-reference.md).
