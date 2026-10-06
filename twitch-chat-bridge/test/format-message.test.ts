import { describe, expect, test } from "bun:test";
import { formatMinecraftCommand } from "../src/format-message";

describe("formatMinecraftCommand", () => {
test("formats chat as a safely encoded tellraw command", () => {
  const command = formatMinecraftCommand("Streamer", 'hello "world"');
  expect(command).not.toBeNull();
  const component = JSON.parse(command!.slice("tellraw @a ".length));

  expect(component.text).toBe('[Twitch] Streamer: hello "world"');
});

test("strips line breaks and control characters from chat input", () => {
  const command = formatMinecraftCommand("user", "hello\nsay hacked\u0000there");
  expect(command).not.toBeNull();
  const component = JSON.parse(command!.slice("tellraw @a ".length));

  expect(component.text).toBe("[Twitch] user: hello say hacked there");
});

test("limits message and username lengths and ignores empty messages", () => {
  const command = formatMinecraftCommand("u".repeat(40), "x".repeat(400));
  expect(command).not.toBeNull();
  const component = JSON.parse(command!.slice("tellraw @a ".length));

  expect(component.text.length).toBe("[Twitch] ".length + 25 + 2 + 300);
  expect(formatMinecraftCommand("user", " \n ")).toBeNull();
});
});
