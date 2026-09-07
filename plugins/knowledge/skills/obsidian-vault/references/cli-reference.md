# Obsidian CLI Full Reference

Complete command reference for `obsidian` CLI. Source: [help.obsidian.md/cli](https://help.obsidian.md/cli)

## General

| Command | Description |
|---------|-------------|
| `help [command]` | Show help (optionally for a specific command) |
| `version` | Show Obsidian version |
| `reload` | Reload the app window |
| `restart` | Restart the app |

## Files & Folders

### `file` - File info (default: active file)

```
file=<name>    path=<path>
```

### `files` - List files

```
folder=<path>    ext=<extension>    total
```

### `folder` - Folder info

```
path=<path> (required)    info=files|folders|size
```

### `folders` - List folders

```
folder=<path>    total
```

### `open` - Open a file

```
file=<name>    path=<path>    newtab
```

### `create` - Create or overwrite a file

```
name=<name>    path=<path>    content=<text>    template=<name>
overwrite    open    newtab
```

### `read` - Read file contents (default: active file)

```
file=<name>    path=<path>
```

### `append` - Append to file (default: active file)

```
file=<name>    path=<path>    content=<text> (required)    inline
```

### `prepend` - Prepend after frontmatter (default: active file)

```
file=<name>    path=<path>    content=<text> (required)    inline
```

### `move` - Move/rename a file (default: active file)

```
file=<name>    path=<path>    to=<path> (required)
```

### `rename` - Rename a file (default: active file)

```
file=<name>    path=<path>    name=<name> (required)
```

### `delete` - Delete a file (default: active file, trash)

```
file=<name>    path=<path>    permanent
```

## Daily Notes

### `daily` - Open daily note

```
paneType=tab|split|window
```

### `daily:path` - Get daily note path

### `daily:read` - Read daily note

### `daily:append` - Append to daily note

```
content=<text> (required)    paneType=tab|split|window    inline    open
```

### `daily:prepend` - Prepend to daily note

```
content=<text> (required)    paneType=tab|split|window    inline    open
```

## Search

### `search` - Search vault

```
query=<text> (required)    path=<folder>    limit=<n>    format=text|json
total    case
```

### `search:context` - Search with line context

```
query=<text> (required)    path=<folder>    limit=<n>    format=text|json
case
```

### `search:open` - Open search view

```
query=<text>
```

## Tasks

### `tasks` - List tasks

```
file=<name>    path=<path>    status="<char>"
total    done    todo    verbose    active    daily
format=json|tsv|csv
```

### `task` - Show or update a task

```
ref=<path:line>    file=<name>    path=<path>    line=<n>    status="<char>"
toggle    daily    done    todo
```

## Properties

### `properties` - List properties

```
file=<name>    path=<path>    name=<name>    sort=count
format=yaml|json|tsv    total    counts    active
```

### `property:set` - Set a property

```
name=<name> (required)    value=<value> (required)
type=text|list|number|checkbox|date|datetime
file=<name>    path=<path>
```

### `property:remove` - Remove a property

```
name=<name> (required)    file=<name>    path=<path>
```

### `property:read` - Read a property value

```
name=<name> (required)    file=<name>    path=<path>
```

### `aliases` - List aliases

```
file=<name>    path=<path>    total    verbose    active
```

## Tags

### `tags` - List tags

```
file=<name>    path=<path>    sort=count
total    counts    active
format=json|tsv|csv
```

### `tag` - Get tag info

```
name=<tag> (required)    total    verbose
```

## Links

### `backlinks` - List backlinks (default: active file)

```
file=<name>    path=<path>    counts    total
format=json|tsv|csv
```

### `links` - List outgoing links (default: active file)

```
file=<name>    path=<path>    total
```

### `unresolved` - List unresolved links

```
total    counts    verbose    format=json|tsv|csv
```

### `orphans` - Files with no incoming links

```
total
```

### `deadends` - Files with no outgoing links

```
total
```

## Outline

### `outline` - Show headings (default: active file)

```
file=<name>    path=<path>    format=tree|md|json    total
```

## Templates

### `templates` - List templates

```
total
```

### `template:read` - Read template content

```
name=<template> (required)    title=<title>    resolve
```

### `template:insert` - Insert template into active file

```
name=<template> (required)
```

## Bookmarks

### `bookmarks` - List bookmarks

```
total    verbose    format=json|tsv|csv
```

### `bookmark` - Add a bookmark

```
file=<path>    subpath=<subpath>    folder=<path>
search=<query>    url=<url>    title=<title>
```

## Bases

### `bases` - List all .base files

### `base:views` - List views in current base

### `base:create` - Create item in a base

```
file=<name>    path=<path>    view=<name>    name=<name>    content=<text>
open    newtab
```

### `base:query` - Query a base

```
file=<name>    path=<path>    view=<name>
format=json|csv|tsv|md|paths
```

## Plugins

### `plugins` - List installed plugins

```
filter=core|community    versions    format=json|tsv|csv
```

### `plugins:enabled` - List enabled plugins

```
filter=core|community    versions    format=json|tsv|csv
```

### `plugins:restrict` - Toggle restricted mode

```
on    off
```

### `plugin` - Get plugin info

```
id=<plugin-id> (required)
```

### `plugin:enable` / `plugin:disable`

```
id=<id> (required)    filter=core|community
```

### `plugin:install` - Install community plugin

```
id=<id> (required)    enable
```

### `plugin:uninstall` - Uninstall community plugin

```
id=<id> (required)
```

### `plugin:reload` - Reload a plugin (dev)

```
id=<id> (required)
```

## Themes & Snippets

### `themes` - List installed themes

```
versions
```

### `theme` - Show active theme or get info

```
name=<name>
```

### `theme:set` - Set active theme

```
name=<name> (required)
```

### `theme:install` / `theme:uninstall`

```
name=<name> (required)    enable
```

### `snippets` / `snippets:enabled` - List CSS snippets

### `snippet:enable` / `snippet:disable`

```
name=<name> (required)
```

## Command Palette

### `commands` - List command IDs

```
filter=<prefix>
```

### `command` - Execute a command

```
id=<command-id> (required)
```

### `hotkeys` - List hotkeys

```
total    verbose    format=json|tsv|csv
```

### `hotkey` - Get hotkey for a command

```
id=<command-id> (required)    verbose
```

## File History

### `diff` - Compare versions (File Recovery + Sync)

```
file=<name>    path=<path>    from=<n>    to=<n>    filter=local|sync
```

### `history` - List local history versions

```
file=<name>    path=<path>
```

### `history:list` - All files with local history

### `history:read` - Read a history version

```
file=<name>    path=<path>    version=<n>
```

### `history:restore` - Restore a history version

```
file=<name>    path=<path>    version=<n> (required)
```

### `history:open` - Open file recovery UI

```
file=<name>    path=<path>
```

## Sync

### `sync` - Pause/resume sync

```
on    off
```

### `sync:status` - Show sync status

### `sync:history` - Sync version history (default: active file)

```
file=<name>    path=<path>    total
```

### `sync:read` - Read a sync version

```
file=<name>    path=<path>    version=<n> (required)
```

### `sync:restore` - Restore a sync version

```
file=<name>    path=<path>    version=<n> (required)
```

### `sync:open` - Open sync history

```
file=<name>    path=<path>
```

### `sync:deleted` - List deleted files in sync

```
total
```

## Publish

### `publish:site` - Show publish site info

### `publish:list` - List published files

```
total
```

### `publish:status` - List publish changes

```
total    new    changed    deleted
```

### `publish:add` - Publish a file

```
file=<name>    path=<path>    changed
```

### `publish:remove` - Unpublish a file

```
file=<name>    path=<path>
```

### `publish:open` - Open on published site

```
file=<name>    path=<path>
```

## Vault

### `vault` - Show vault info

```
info=name|path|files|folders|size
```

### `vaults` - List known vaults

```
total    verbose
```

### `vault:open` - Switch vault (TUI only)

```
name=<name> (required)
```

## Workspace

### `workspace` - Show workspace tree

```
ids
```

### `workspaces` - List saved workspaces

```
total
```

### `workspace:save` / `workspace:load` / `workspace:delete`

```
name=<name> (required for load/delete)
```

### `tabs` - List open tabs

```
ids
```

### `tab:open` - Open a new tab

```
group=<id>    file=<path>    view=<type>
```

### `recents` - List recently opened files

```
total
```

## Word Count

### `wordcount` - Count words/characters (default: active file)

```
file=<name>    path=<path>    words    characters
```

## Web Viewer

### `web` - Open URL in web viewer

```
url=<url> (required)    newtab
```

## Random Notes

### `random` - Open a random note

```
folder=<path>    newtab
```

### `random:read` - Read a random note

```
folder=<path>
```

## Unique Notes

### `unique` - Create unique note

```
name=<text>    content=<text>    paneType=tab|split|window    open
```

## Developer Commands

### `devtools` - Toggle dev tools

### `dev:debug` - Attach/detach debugger

```
on    off
```

### `dev:cdp` - Run Chrome DevTools Protocol command

```
method=<CDP.method> (required)    params=<json>
```

### `dev:errors` - Show JS errors

```
clear
```

### `dev:screenshot` - Take screenshot (base64 PNG)

```
path=<filename>
```

### `dev:console` - Show console messages

```
limit=<n>    level=log|warn|error|info|debug    clear
```

### `dev:css` - Inspect CSS

```
selector=<css> (required)    prop=<name>
```

### `dev:dom` - Query DOM elements

```
selector=<css> (required)    attr=<name>    css=<prop>
total    text    inner    all
```

### `dev:mobile` - Toggle mobile emulation

```
on    off
```

### `eval` - Execute JavaScript

```
code=<javascript> (required)
```

## Global Options

- **`vault=<name|id>`** - Target a specific vault (must be first parameter)
- **`--copy`** - Copy command output to clipboard
- **`file=<name>`** - Resolve file by wikilink name
- **`path=<path>`** - Exact path from vault root
