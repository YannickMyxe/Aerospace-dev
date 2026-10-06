import { describe, expect, test } from "bun:test";
import { formatMinecraftCommand, getChatRole } from "../src/format-message";

describe("formatMinecraftCommand", () => {
test("formats chat as a safely encoded tellraw command", () => {
  const command = formatMinecraftCommand("Streamer", 'hello "world"');
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.slice("tellraw @a ".length) ?? "");

  expect(component.extra).toEqual([
    { text: "[Twitch]", color: "dark_purple" },
    { text: ' Streamer: hello "world"' }
  ]);
});

test("adds colored Twitch roles and uses the highest-priority role", () => {
  const command = formatMinecraftCommand("Streamer", "hello", "BROADCASTER");
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.slice("tellraw @a ".length) ?? "");

  expect(component.extra).toEqual([
    { text: "[Twitch]", color: "dark_purple" },
    { text: " [BROADCASTER]", color: "gold" },
    { text: " Streamer: hello" }
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

test("strips line breaks and control characters from chat input", () => {
  const command = formatMinecraftCommand("user", "hello\nsay hacked\u0000there");
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.slice("tellraw @a ".length) ?? "");

  expect(component.extra[0].text).toBe("[Twitch]");
  expect(component.extra[1].text).toBe(" user: hello say hacked there");
});

test("limits message and username lengths and ignores empty messages", () => {
  const command = formatMinecraftCommand("u".repeat(40), "x".repeat(400));
  expect(command).not.toBeNull();
  const component = JSON.parse(command?.slice("tellraw @a ".length) ?? "");

  expect(component.extra[0].text).toBe("[Twitch]");
  expect(component.extra[1].text.length).toBe(1 + 25 + 2 + 300);
  expect(formatMinecraftCommand("user", " \n ")).toBeNull();
});
});
