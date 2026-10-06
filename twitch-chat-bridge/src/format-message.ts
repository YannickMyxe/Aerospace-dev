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
  role: ChatRole | null = null
): string | null {
  const safeUsername = cleanText(username, 25) || "unknown";
  const safeMessage = cleanText(message, MAX_MESSAGE_LENGTH);
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
