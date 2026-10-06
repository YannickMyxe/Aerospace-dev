const MAX_MESSAGE_LENGTH = 300;

function cleanText(value: string, maxLength: number): string {
  return Array.from(
    String(value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()
  ).slice(0, maxLength).join("");
}

function formatMinecraftCommand(username: string, message: string): string | null {
  const safeUsername = cleanText(username, 25) || "unknown";
  const safeMessage = cleanText(message, MAX_MESSAGE_LENGTH);
  if (!safeMessage) return null;

  const component = {
    text: "",
    extra: [
      { text: "[Twitch]", color: "dark_purple" },
      { text: ` ${safeUsername}: ${safeMessage}` }
    ]
  };

  return `tellraw @a ${JSON.stringify(component)}`;
}

export { formatMinecraftCommand };
