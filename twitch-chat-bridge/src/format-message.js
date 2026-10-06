const MAX_MESSAGE_LENGTH = 300;

function cleanText(value, maxLength) {
  return Array.from(
    String(value).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()
  ).slice(0, maxLength).join("");
}

function formatMinecraftCommand(username, message) {
  const safeUsername = cleanText(username, 25) || "unknown";
  const safeMessage = cleanText(message, MAX_MESSAGE_LENGTH);
  if (!safeMessage) return null;

  return `tellraw @a ${JSON.stringify({ text: `[Twitch] ${safeUsername}: ${safeMessage}` })}`;
}

module.exports = { formatMinecraftCommand };
