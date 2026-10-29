# Personal agent guidance

`AGENTS.md` in this directory is the versioned source for Simon's personal
guidance. It was imported from the current `~/.agents/AGENTS.md`. The old root
copy was replaced with repository-specific guidance.

## Set up each machine

Use a stable clone of Agent Kit. Do not link to a temporary Codex worktree or
a plugin cache. First, make sure the clone contains the reviewed personal
guidance. Then run this block from the clone's root directory:

```sh
repo_dir="$(pwd -P)"
test -f "$repo_dir/personal/AGENTS.md" || exit 1
mkdir -p "$HOME/.agents" "$HOME/.codex" "$HOME/.claude"
backup_dir="$(mktemp -d "$HOME/.agents/guidance-backup.XXXXXX")"

for file in "$HOME/.agents/AGENTS.md" "$HOME/.codex/AGENTS.md" "$HOME/.claude/CLAUDE.md"; do
  if [ -f "$file" ]; then
    cp -p "$file" "$backup_dir/$(basename "$(dirname "$file")")-$(basename "$file")" || exit 1
  fi
done

ln -sfn "$repo_dir/personal/AGENTS.md" "$HOME/.agents/AGENTS.md"
ln -sfn ../.agents/AGENTS.md "$HOME/.codex/AGENTS.md"
ln -sfn ../.agents/AGENTS.md "$HOME/.claude/CLAUDE.md"
printf 'Previous guidance saved in %s\n' "$backup_dir"
```

This keeps one source file. Codex and Claude read it through these links:

```text
~/.codex/AGENTS.md   ─┐
                    ├─> ~/.agents/AGENTS.md ─> <stable-clone>/personal/AGENTS.md
~/.claude/CLAUDE.md ─┘
```

The backup directory contains the previous file contents. It is outside the
repository.

## Make and sync changes

Edit `personal/AGENTS.md` in the stable clone. Editing `~/.agents/AGENTS.md`
also changes that file after the links are set up. Commit and push the change,
then pull it into each other machine's stable clone. The links stay in place.
Git transfers the contents; the links select the local file.

Start a new chat after updating guidance. Plugin installation and marketplace
updates do not update this personal file.

For a change made in a temporary worktree, first integrate it into the stable
clone. Keep the personal links pointed at the stable clone.
