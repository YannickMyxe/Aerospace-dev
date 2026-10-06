import { readFileSync } from "node:fs";
import { join } from "node:path";

interface EmoteRegistryEntry {
  id: string;
  name: string;
  codepoint: string;
}

interface EmoteRegistry {
  version: number;
  emotes: EmoteRegistryEntry[];
}

const registryPath = process.env.EMOTE_MAP_PATH ??
  join(import.meta.dir, "../../twitch-emote-pack/emote-map.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8")) as EmoteRegistry;

if (registry.version !== 1 || !Array.isArray(registry.emotes)) {
  throw new Error(`Invalid Twitch emote registry: ${registryPath}`);
}

const emotesById = new Map<string, EmoteRegistryEntry>();
for (const emote of registry.emotes) {
  if (
    !/^\d+$/.test(emote.id) ||
    !emote.name.trim() ||
    !/^[0-9a-f]+$/i.test(emote.codepoint) ||
    emotesById.has(emote.id)
  ) {
    throw new Error(`Invalid or duplicate entry in Twitch emote registry: ${emote.id}`);
  }
  emotesById.set(emote.id, emote);
}

export { emotesById };
export type { EmoteRegistryEntry };
