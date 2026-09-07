export const MARKETPLACE_ID = "agent-kit";
export const PLUGIN_IDS = ["engineering", "git", "knowledge", "hooks"] as const;
export type PluginId = typeof PLUGIN_IDS[number];
export type ManifestKind = "cursor-plugin" | "claude-plugin" | "codex-plugin";

export interface HarnessAdapter {
  readonly kind: ManifestKind;
  readonly manifestPath: string;
  readonly marketplacePath: string;
  readonly hooksPath: string;
}

const CURSOR_ADAPTER: HarnessAdapter = {
  kind: "cursor-plugin",
  manifestPath: ".cursor-plugin/plugin.json",
  marketplacePath: ".cursor-plugin/marketplace.json",
  hooksPath: "hooks/cursor.json",
};

export const HARNESSES = {
  cursor: CURSOR_ADAPTER,
  claude: {
    kind: "claude-plugin",
    manifestPath: ".claude-plugin/plugin.json",
    marketplacePath: ".claude-plugin/marketplace.json",
    hooksPath: "hooks/hooks.json",
  },
  codex: {
    kind: "codex-plugin",
    manifestPath: ".codex-plugin/plugin.json",
    marketplacePath: ".agents/plugins/marketplace.json",
    hooksPath: "hooks/hooks.json",
  },
  grok: CURSOR_ADAPTER,
} satisfies Record<string, HarnessAdapter>;

export const RETIRED_PATHS = [
  "plugins/marketplace.json", "skills-lock.json", ".skill-lock.json",
  "skills", "hooks", "plugins/agent-kit",
  ".claude-plugin/plugin.json", ".codex-plugin/plugin.json", ".cursor-plugin/plugin.json",
];
