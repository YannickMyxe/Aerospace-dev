# Twitch chat bridge

This container relays Twitch chat messages to a dedicated Minecraft server through RCON. It does not need KubeJS. By default, it runs in a local dry-run mode and prints the exact Minecraft `tellraw` command it would send.

## Local dry run with Podman

From this folder, run:

```powershell
.\run.ps1
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

If Podman and the Minecraft server run on the same host, `host.containers.internal` is the default RCON hostname. If they run on different machines, use the server's private network address and restrict RCON access to the bridge host. Never commit `.env`.

The bridge displays messages as plain Minecraft text; Twitch messages are not executed as commands. Messages are limited to 300 characters, with a maximum relay rate of one per second and 20 per minute.
