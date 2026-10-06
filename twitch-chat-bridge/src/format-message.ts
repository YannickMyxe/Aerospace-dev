import type { ChatUserstate } from "tmi.js";
import type { EmoteRegistryEntry } from "./emote-map";

const MAX_MESSAGE_LENGTH = 300;
const MAX_RCON_COMMAND_BYTES = 1200;

interface FormattedCommand {
  command: string;
  truncated: boolean;
}

type ChatRole = "BROADCASTER" | "MOD" | "VIP" | "SUB";

const ROLE_COLORS: Record<ChatRole, string> = {
  BROADCASTER: "gold",
  MOD: "dark_red",
  VIP: "light_purple",
  SUB: "aqua"
};

function cleanText(value: string, maxLength: number): string {
  return Array.from(
    String(value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()
  ).slice(0, maxLength).join("");
}

function formatEmotes(
  message: string,
  twitchEmotes: ChatUserstate["emotes"],
  emoteMap: ReadonlyMap<string, EmoteRegistryEntry>
): Array<{ text: string; font?: string }> {
  const ranges = Object.entries(twitchEmotes ?? {})
    .flatMap(([id, positions]) => positions.map((position) => ({ id, position })))
    .map(({ id, position }) => {
      const match = /^(\d+)-(\d+)$/.exec(position);
      if (!match) return null;

      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start > end || end >= message.length) return null;
      return { id, start, end };
    })
    .filter((range): range is { id: string; start: number; end: number } => range !== null)
    .sort((left, right) => left.start - right.start);

  const result: Array<{ text: string; font?: string }> = [];
  let cursor = 0;
  let length = 0;
  const appendFontText = (text: string): void => {
    const remaining = MAX_MESSAGE_LENGTH - length;
    if (remaining <= 0) return;
    const cleaned = Array.from(text).slice(0, remaining).join("");
    if (!cleaned) return;
    const previous = result.at(-1);
    if (previous?.font === "twitch:emotes") previous.text += cleaned;
    else result.push({ text: cleaned, font: "twitch:emotes" });
    length += Array.from(cleaned).length;
  };
  const appendText = (text: string): void => {
    const remaining = MAX_MESSAGE_LENGTH - length;
    if (remaining <= 0) return;
    const normalized = text.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ");
    const cleaned = Array.from(normalized).slice(0, remaining).join("");
    if (!cleaned) return;
    const previous = result[result.length - 1];
    if (previous && !previous.font) previous.text += cleaned;
    else result.push({ text: cleaned });
    length += Array.from(cleaned).length;
  };

  for (const range of ranges) {
    if (range.start < cursor) continue;
    const registryEntry = emoteMap.get(range.id);
    const separator = message.slice(cursor, range.start);
    appendText(separator);

    const emoteName = cleanText(message.slice(range.start, range.end + 1), 50);
    const replacement = registryEntry
      ? String.fromCodePoint(Number.parseInt(registryEntry.codepoint, 16))
      : { text: `[${emoteName}]` };
    if (typeof replacement === "string") {
      appendFontText(replacement);
    } else if (length < MAX_MESSAGE_LENGTH) {
      result.push(replacement);
      length += Array.from(replacement.text).length;
    }
    cursor = range.end + 1;
  }

  appendText(message.slice(cursor));
  if (result[0] && !result[0].font) result[0].text = result[0].text.trimStart();
  if (result.at(-1) && !result.at(-1)!.font) result.at(-1)!.text = result.at(-1)!.text.trimEnd();
  while (result[0] && !result[0].text) result.shift();
  while (result.at(-1) && !result.at(-1)!.text) result.pop();
  return result;
}

function getChatRole(userstate: ChatUserstate): ChatRole | null {
  const badges = userstate.badges ?? {};

  if (badges.broadcaster) return "BROADCASTER";
  if (
    userstate.mod ||
    badges.moderator ||
    userstate["user-type"] === "mod" ||
    userstate["user-type"] === "global_mod" ||
    userstate["user-type"] === "admin" ||
    userstate["user-type"] === "staff"
  ) {
    return "MOD";
  }
  if (badges.vip) return "VIP";
  if (userstate.subscriber || badges.subscriber) return "SUB";
  return null;
}

function formatMinecraftCommand(
  username: string,
  message: string,
  role: ChatRole | null = null,
  emotes?: ChatUserstate["emotes"],
  emoteMap: ReadonlyMap<string, EmoteRegistryEntry> = new Map()
): FormattedCommand | null {
  const safeUsername = cleanText(username, 25) || "unknown";
  const messageParts = formatEmotes(message, emotes, emoteMap);
  if (messageParts.length === 0) return null;
  const safeMessage = messageParts.map((part) => part.text).join("");

  const extra: Array<{ text: string; color?: string }> = [
    { text: "[Twitch]", color: "dark_purple" }
  ];
  if (role) extra.push({ text: ` [${role}]`, color: ROLE_COLORS[role] });
  extra.push({ text: ` ${safeUsername}: ` });
  const messageStart = extra.length;
  extra.push(...messageParts);

  const component = {
    text: "",
    extra
  };

  const serialize = (): string => `tellraw @a ${JSON.stringify(component)}`;
  let command = serialize();
  let truncated = false;

  while (Buffer.byteLength(command, "utf8") > MAX_RCON_COMMAND_BYTES) {
    if (!truncated) {
      extra.push({ text: "…" });
      truncated = true;
    }

    let lastTextPart = extra.length - 2;
    while (lastTextPart >= messageStart && !extra[lastTextPart].text) lastTextPart--;
    if (lastTextPart < messageStart) break;

    const text = Array.from(extra[lastTextPart].text);
    text.pop();
    extra[lastTextPart].text = text.join("");
    if (!extra[lastTextPart].text) extra.splice(lastTextPart, 1);
    command = serialize();
  }

  if (truncated) {
    console.warn(`Truncated Twitch message to fit the ${MAX_RCON_COMMAND_BYTES}-byte RCON command limit.`);
  }

  return { command, truncated };
}

function formatReadyCommand(): string {
  const component = {
    text: "",
    extra: [
      { text: "[Twitch-Bridge]", color: "red" },
      { text: ` Chat relay connected`, color: "gray" }
    ]
  };

  return `tellraw @a ${JSON.stringify(component)}`;
}

function formatDisconnectedCommand(reason: string): string {
  const safeReason = cleanText(reason, 100) || "unknown reason";
  const component = {
    text: "",
    extra: [
      { text: "[Twitch-Bridge]", color: "red" },
      { text: ` Chat relay disconnected: ${safeReason}`, color: "red" }
    ]
  };

  return `tellraw @a ${JSON.stringify(component)}`;
}

export { formatDisconnectedCommand, formatMinecraftCommand, formatReadyCommand, getChatRole };
