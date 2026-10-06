# Twitch chat bridge

This container relays Twitch chat messages to a dedicated Minecraft server through RCON. It does not need KubeJS. By default, it runs in a local dry-run mode and prints the exact Minecraft `tellraw` command it would send.

## Local dry run with Podman

From this folder, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\twitch-chat-bridge\run.ps1
```

The script builds the image and starts it with `.env`. The first run creates `.env` from `.env.example`; `DRY_RUN=true` is the safe default. Type a test line such as:

```text
someviewer: Hello from Twitch!
```

The app prints a `tellraw` command to the console but does not connect to Twitch or Minecraft. Press Ctrl+C to stop.

The bridge is written in TypeScript and uses Bun for dependency management, tests, and runtime. You can run the formatter tests with `bun test` and check types with `bun run typecheck`.

## Connect Twitch and Minecraft

1. Create a Twitch bot account and generate a chat OAuth token for it. Treat the token like a password.
2. Enable RCON on the dedicated server, set a strong password, and restart the server. Do not expose the RCON port to the public internet.
3. Edit `.env`, set `DRY_RUN=false`, and fill in `TWITCH_CHANNEL`, `TWITCH_BOT_USERNAME`, `TWITCH_OAUTH_TOKEN`, `RCON_HOST`, and `RCON_PASSWORD`. The OAuth value can be either the token or `oauth:<token>`.
4. Run `.\run.ps1` again. The bridge connects to Twitch and relays chat as `[Twitch] username: message`.

The bridge joins the `twitch-chat-local` Podman network. For the local test server, keep `RCON_HOST=local-minecraft` and copy the generated `RCON_PASSWORD` from `local-minecraft-server/.env` into this bridge's `.env`. If using a server on the same host but outside Podman, set `RCON_HOST=host.containers.internal`; for a remote server, use its private network address and restrict RCON access to the bridge host. Never commit `.env`.

The bridge displays `[Twitch]` in dark purple, plus the highest-priority role badge when present: `[BROADCASTER]`, `[MOD]`, `[VIP]`, or `[SUB]`. Role labels are colored gold, dark red, light purple, and aqua respectively. Known Twitch emotes use the custom `twitch:emotes` font defined by the resource pack in `../twitch-emote-pack/resource-pack`. That font references Minecraft's default font for ordinary text; unknown emotes remain readable as labels such as `[PogChamp]`. Players need the resource pack enabled to see image glyphs. The bridge and resource pack share `../twitch-emote-pack/emote-map.json`. Twitch messages are plain text, not executable commands. Messages are limited to 300 characters and RCON commands to 1,200 UTF-8 bytes; longer formatted messages are shortened with an ellipsis to stay below Minecraft's packet limit. Relay rate is limited to one message per second and 20 per minute.
