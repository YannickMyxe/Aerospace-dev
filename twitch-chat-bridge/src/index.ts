import readline from "node:readline";
import { Rcon } from "rcon-client";
import tmi from "tmi.js";
import { formatMinecraftCommand, getChatRole } from "./format-message";
import { emotesById } from "./emote-map";

const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() === "true";

function runDryRun(): void {
  console.log("Dry run: enter a message as username: message. Press Ctrl+C to stop.");
  const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

  input.on("line", (line) => {
    const separator = line.indexOf(":");
    if (separator < 1) {
      console.error("Enter messages in the form username: message");
      return;
    }

    const command = formatMinecraftCommand(line.slice(0, separator), line.slice(separator + 1));
    if (command) console.log(command);
  });
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set when DRY_RUN=false`);
  return value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function runBridge(): Promise<void> {
  const channel = requiredEnv("TWITCH_CHANNEL").replace(/^#/, "").toLowerCase();
  const username = requiredEnv("TWITCH_BOT_USERNAME").toLowerCase();
  const token = requiredEnv("TWITCH_OAUTH_TOKEN").replace(/^oauth:/i, "");
  const host = requiredEnv("RCON_HOST");
  const password = requiredEnv("RCON_PASSWORD");
  const port = Number(process.env.RCON_PORT ?? "25575");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("RCON_PORT must be an integer between 1 and 65535");
  }

  const rcon = await Rcon.connect({ host, port, password });
  const client = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true, secure: true },
    identity: { username, password: `oauth:${token}` },
    channels: [channel]
  });

  let sendQueue = Promise.resolve();
  const sentAt: number[] = [];
  const minIntervalMs = 1000;
  let lastSentAt = 0;

  client.on("message", (_channel, tags, message, self) => {
    if (self) return;

    const command = formatMinecraftCommand(
      tags["display-name"] || tags.username || "unknown",
      message,
      getChatRole(tags),
      tags.emotes,
      emotesById
    );
    if (!command) return;

    const now = Date.now();
    while (sentAt.length && now - sentAt[0] >= 60_000) sentAt.shift();
    if (sentAt.length >= 20) {
      console.warn("Dropped Twitch message: relay limit is 20 messages per minute");
      return;
    }
    sentAt.push(now);

    sendQueue = sendQueue.then(async () => {
      const waitMs = Math.max(0, lastSentAt + minIntervalMs - Date.now());
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      await rcon.send(command);
      lastSentAt = Date.now();
    }).catch((error) => {
      console.error("Could not relay Twitch message to Minecraft:", errorMessage(error));
    });
  });

  client.on("connected", () => console.log(`Connected to Twitch chat: #${channel}`));
  client.on("disconnected", (reason) => console.warn("Twitch chat disconnected:", reason));

  await client.connect();
  console.log("Twitch-to-Minecraft chat relay is running");

  const shutdown = async () => {
    try {
      await client.disconnect();
    } catch (error) {
      console.error("Could not disconnect from Twitch chat:", errorMessage(error));
    }
    try {
      await rcon.end();
    } catch (error) {
      console.error("Could not close RCON connection:", errorMessage(error));
    }
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (dryRun) {
  runDryRun();
} else {
  runBridge().catch((error) => {
    console.error("Twitch chat bridge failed to start:", errorMessage(error));
    process.exitCode = 1;
  });
}
