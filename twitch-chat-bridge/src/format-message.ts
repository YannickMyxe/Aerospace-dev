import type { ChatUserstate } from "tmi.js";

const MAX_MESSAGE_LENGTH = 300;

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

function formatEmotes(message: string, emotes: ChatUserstate["emotes"]): string {
  const ranges = Object.values(emotes ?? {})
    .flat()
    .map((range) => {
      const match = /^(\d+)-(\d+)$/.exec(range);
      if (!match) return null;

      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start > end || end >= message.length) return null;
      return { start, end };
    })
    .filter((range): range is { start: number; end: number } => range !== null)
    .sort((left, right) => left.start - right.start);

  let result = "";
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    result += message.slice(cursor, range.start);
    result += `[${message.slice(range.start, range.end + 1)}]`;
    cursor = range.end + 1;
  }

  return result + message.slice(cursor);
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
  emotes?: ChatUserstate["emotes"]
): string | null {
  const safeUsername = cleanText(username, 25) || "unknown";
  const safeMessage = cleanText(formatEmotes(message, emotes), MAX_MESSAGE_LENGTH);
  if (!safeMessage) return null;

  const extra: Array<{ text: string; color?: string }> = [
    { text: "[Twitch]", color: "dark_purple" }
  ];
  if (role) extra.push({ text: ` [${role}]`, color: ROLE_COLORS[role] });
  extra.push({ text: ` ${safeUsername}: ${safeMessage}` });

  const component = {
    text: "",
    extra
  };

  return `tellraw @a ${JSON.stringify(component)}`;
}

export { formatMinecraftCommand, getChatRole };
