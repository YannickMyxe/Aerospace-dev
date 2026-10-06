import { describe, expect, test } from "bun:test";
import { formatMinecraftCommand, formatReadyCommand, getChatRole } from "../src/format-message";
import type { EmoteRegistryEntry } from "../src/emote-map";

const emoteMap = new Map<string, EmoteRegistryEntry>([
  ["25", { id: "25", name: "Kappa", codepoint: "E000" }]
]);

describe("formatMinecraftCommand", () => {
test("formats a readiness notice for Minecraft chat", () => {
  const command = formatReadyCommand("#ExampleChannel");
  const component = JSON.parse(command.slice("tellraw @a ".length));

  expect(component.extra).toEqual([
    { text: "[Twitch]", color: "dark_purple" },
    { text: " Chat relay connected to #ExampleChannel", color: "gray" }
  ]);
});

test("formats chat as a safely encoded tellraw command", () => {
  const command = formatMinecraftCommand("Streamer", 'hello "world"');
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(command?.truncated).toBe(false);
  expect(component.font).toBeUndefined();
  expect(component.extra).toEqual([
    { text: "[Twitch]", color: "dark_purple" },
    { text: " Streamer: " },
    { text: 'hello "world"' }
  ]);
});

test("adds colored Twitch roles and uses the highest-priority role", () => {
  const command = formatMinecraftCommand("Streamer", "hello", "BROADCASTER");
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra).toEqual([
    { text: "[Twitch]", color: "dark_purple" },
    { text: " [BROADCASTER]", color: "gold" },
    { text: " Streamer: " },
    { text: "hello" }
  ]);
});

test("detects moderator, VIP, and subscriber roles from Twitch tags", () => {
  expect(getChatRole({ mod: true })).toBe("MOD");
  expect(getChatRole({ badges: { vip: "1" } })).toBe("VIP");
  expect(getChatRole({ subscriber: true })).toBe("SUB");
  expect(getChatRole({})).toBeNull();
});

test("moderator role takes priority over VIP and subscriber", () => {
  expect(getChatRole({
    mod: true,
    subscriber: true,
    badges: { moderator: "1", vip: "1", subscriber: "1" }
  })).toBe("MOD");
});

test("wraps Twitch emotes using the provided message offsets", () => {
  const message = "Hello Kappa and PogChamp!";
  const command = formatMinecraftCommand("viewer", message, null, {
    "25": ["6-10"],
    "305954156": ["16-23"]
  }, emoteMap);
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra.slice(1)).toEqual([
    { text: " viewer: " },
    { text: "Hello " },
    { text: "\uE000", font: "twitch:emotes" },
    { text: " and " },
    { text: "[PogChamp]!" }
  ]);
});

test("keeps emote-heavy relay commands compact", () => {
  const names = Array.from({ length: 35 }, () => "Kappa");
  const message = names.join(" ");
  const ranges = names.map((_, index) => {
    const start = index * 6;
    return `${start}-${start + 4}`;
  });
  const command = formatMinecraftCommand("viewer", message, null, { "25": ranges }, emoteMap);

  expect(command).not.toBeNull();
  expect(command!.command.length).toBeLessThan(4096);
});

test("truncates long chat commands below the safe RCON packet size", () => {
  const names = Array.from({ length: 35 }, () => "Kappa");
  const message = names.join(" ");
  const ranges = names.map((_, index) => {
    const start = index * 6;
    return `${start}-${start + 4}`;
  });
  const command = formatMinecraftCommand("viewer", message, null, { "25": ranges }, emoteMap);

  expect(command).not.toBeNull();
  expect(command!.truncated).toBe(true);
  expect(Buffer.byteLength(command!.command, "utf8")).toBeLessThanOrEqual(1200);
  const component = JSON.parse(command!.command.slice("tellraw @a ".length));
  expect(component.extra.at(-1).text).toBe("…");
});

test("wraps UTF-16-indexed emotes after supplementary Unicode characters", () => {
  const message = "🎉 Kappa";
  const start = message.indexOf("Kappa");
  const command = formatMinecraftCommand("viewer", message, null, {
    "25": [`${start}-${start + "Kappa".length - 1}`]
  }, emoteMap);
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra.slice(1)).toEqual([
    { text: " viewer: " },
    { text: "🎉 " },
    { text: "\uE000", font: "twitch:emotes" }
  ]);
});

test("ignores malformed and out-of-range emote offsets", () => {
  const command = formatMinecraftCommand("viewer", "Kappa", null, {
    "25": ["bad-range", "0-10"]
  }, emoteMap);
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra[1].text).toBe(" viewer: ");
  expect(component.extra[2].text).toBe("Kappa");
});

test("strips line breaks and control characters from chat input", () => {
  const command = formatMinecraftCommand("user", "hello\nsay hacked\u0000there");
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra[0].text).toBe("[Twitch]");
  expect(component.extra[1].text).toBe(" user: ");
  expect(component.extra[2].text).toBe("hello say hacked there");
});

test("limits message and username lengths and ignores empty messages", () => {
  const command = formatMinecraftCommand("u".repeat(40), "x".repeat(400));
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.command.slice("tellraw @a ".length) ?? "");

  expect(component.extra[0].text).toBe("[Twitch]");
  expect(component.extra[1].text).toBe(" uuuuuuuuuuuuuuuuuuuuuuuuu: ");
  expect(component.extra[2].text.length).toBe(300);
  expect(formatMinecraftCommand("user", " \n ")).toBeNull();
});
});
