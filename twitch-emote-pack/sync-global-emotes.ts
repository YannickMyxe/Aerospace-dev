import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

interface Emote {
  id: string;
  name: string;
  codepoint: string;
}

interface EmoteMap {
  version: number;
  privateUseRange: {
    start: string;
    end: string;
  };
  emotes: Emote[];
}

interface TwitchGlobalEmote {
  id: string;
  name: string;
  template?: string;
  images?: {
    url_2x?: string;
  };
}

interface TwitchGlobalEmoteResponse {
  data: TwitchGlobalEmote[];
}

interface TwitchTokenValidation {
  client_id: string;
}

const root = import.meta.dir;
const bridgeEnvPath = join(root, "..", "twitch-chat-bridge", ".env");
const registryPath = join(root, "emote-map.json");
const textureRoot = join(root, "resource-pack", "assets", "twitch", "textures", "emotes");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readEnvValue(envFile: string, name: string): string | undefined {
  const line = envFile.split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  const value = line?.slice(name.length + 1).trim();
  return value ? value.replace(/^["']|["']$/g, "") : undefined;
}

function validateRegistry(registry: EmoteMap): {
  lastCodepoint: number;
  usedIds: Set<string>;
  usedCodepoints: Set<number>;
} {
  if (registry.version !== 1 || !Array.isArray(registry.emotes)) {
    throw new Error("Unsupported or invalid emote-map.json");
  }

  const firstCodepoint = Number.parseInt(registry.privateUseRange.start, 16);
  const lastCodepoint = Number.parseInt(registry.privateUseRange.end, 16);
  if (!Number.isFinite(firstCodepoint) || !Number.isFinite(lastCodepoint) || firstCodepoint > lastCodepoint) {
    throw new Error("Invalid private-use codepoint range in emote-map.json");
  }

  const usedIds = new Set<string>();
  const usedCodepoints = new Set<number>();
  for (const emote of registry.emotes) {
    const codepoint = Number.parseInt(emote.codepoint, 16);
    if (
      !/^\d+$/.test(emote.id) ||
      !emote.name.trim() ||
      !/^[0-9a-f]+$/i.test(emote.codepoint) ||
      codepoint < firstCodepoint ||
      codepoint > lastCodepoint ||
      usedIds.has(emote.id) ||
      usedCodepoints.has(codepoint)
    ) {
      throw new Error(`Invalid or duplicate emote registry entry: ${emote.id}`);
    }
    usedIds.add(emote.id);
    usedCodepoints.add(codepoint);
  }

  return { lastCodepoint, usedIds, usedCodepoints };
}

function getStaticImageUrl(emote: TwitchGlobalEmote): string {
  if (emote.template) {
    return emote.template
      .replaceAll("{id}", emote.id)
      .replaceAll("{format}", "static")
      .replaceAll("{scale}", "2.0")
      .replaceAll("{theme_mode}", "dark");
  }

  if (emote.images?.url_2x) return emote.images.url_2x;
  throw new Error(`Twitch returned no static image URL for emote ${emote.name}`);
}

async function main(): Promise<void> {
  const envFile = await readFile(bridgeEnvPath, "utf8");
  const accessToken = readEnvValue(envFile, "TWITCH_OAUTH_TOKEN")?.replace(/^oauth:/i, "");
  if (!accessToken) throw new Error(`Set TWITCH_OAUTH_TOKEN in ${bridgeEnvPath} before syncing global emotes`);

  const validationResponse = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${accessToken}` }
  });
  if (!validationResponse.ok) {
    throw new Error(`Twitch token validation failed (${validationResponse.status} ${validationResponse.statusText})`);
  }
  const validation = await validationResponse.json() as TwitchTokenValidation;
  if (!validation.client_id) throw new Error("Twitch token validation did not return an app client ID");

  const registry = JSON.parse(await readFile(registryPath, "utf8")) as EmoteMap;
  const { lastCodepoint, usedIds, usedCodepoints } = validateRegistry(registry);

  const response = await fetch("https://api.twitch.tv/helix/chat/emotes/global", {
    headers: {
      "Client-Id": validation.client_id,
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    throw new Error(`Twitch global emote request failed (${response.status} ${response.statusText})`);
  }

  const payload = await response.json() as TwitchGlobalEmoteResponse;
  if (!Array.isArray(payload.data)) throw new Error("Twitch returned an invalid global emote response");

  const additions: Array<{ emote: Emote; image: Buffer }> = [];
  let nextCodepoint = Number.parseInt(registry.privateUseRange.start, 16);
  for (const twitchEmote of payload.data) {
    if (!/^\d+$/.test(twitchEmote.id) || !twitchEmote.name.trim() || usedIds.has(twitchEmote.id)) {
      continue;
    }

    while (usedCodepoints.has(nextCodepoint) && nextCodepoint <= lastCodepoint) nextCodepoint++;
    if (nextCodepoint > lastCodepoint) {
      throw new Error("Private-use codepoint range is full; cannot add all Twitch global emotes");
    }

    const imageResponse = await fetch(getStaticImageUrl(twitchEmote));
    if (!imageResponse.ok) {
      throw new Error(`Could not download Twitch emote ${twitchEmote.name} (${imageResponse.status})`);
    }

    const image = Buffer.from(await imageResponse.arrayBuffer());
    if (!image.subarray(0, pngSignature.length).equals(pngSignature)) {
      throw new Error(`Twitch returned a non-PNG image for emote ${twitchEmote.name}`);
    }

    additions.push({
      emote: {
        id: twitchEmote.id,
        name: twitchEmote.name,
        codepoint: nextCodepoint.toString(16).toUpperCase()
      },
      image
    });
    usedIds.add(twitchEmote.id);
    usedCodepoints.add(nextCodepoint);
    nextCodepoint++;
  }

  for (const addition of additions) {
    const imagePath = join(textureRoot, `${addition.emote.id}.png`);
    await mkdir(dirname(imagePath), { recursive: true });
    await writeFile(imagePath, addition.image);
    registry.emotes.push(addition.emote);
  }

  if (additions.length > 0) {
    await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  }

  console.log(
    additions.length > 0
      ? `Added ${additions.length} Twitch global emote(s). Regenerate the font with bun run .\\generate-pack.ts.`
      : "The registry already contains all Twitch global emotes."
  );
}

await main();
