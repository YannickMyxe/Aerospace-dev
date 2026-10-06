const test = require("node:test");
const assert = require("node:assert/strict");
const { formatMinecraftCommand } = require("../src/format-message");

test("formats chat as a safely encoded tellraw command", () => {
  const command = formatMinecraftCommand("Streamer", 'hello "world"');
  const component = JSON.parse(command.slice("tellraw @a ".length));

  assert.equal(component.text, '[Twitch] Streamer: hello "world"');
});

test("strips line breaks and control characters from chat input", () => {
  const command = formatMinecraftCommand("user", "hello\nsay hacked\u0000there");
  const component = JSON.parse(command.slice("tellraw @a ".length));

  assert.equal(component.text, "[Twitch] user: hello say hacked there");
});

test("limits message and username lengths and ignores empty messages", () => {
  const command = formatMinecraftCommand("u".repeat(40), "x".repeat(400));
  const component = JSON.parse(command.slice("tellraw @a ".length));

  assert.equal(component.text.length, "[Twitch] ".length + 25 + 2 + 300);
  assert.equal(formatMinecraftCommand("user", " \n "), null);
});
