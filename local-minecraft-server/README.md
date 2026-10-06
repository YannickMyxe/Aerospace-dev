# Local NeoForge server

This is a disposable local test server matching the project pack's Minecraft 1.21.1 / NeoForge 21.1.252 versions. It uses Java 21. RCON is available only to containers on the private `twitch-chat-local` Podman network; only Minecraft's game port is published, bound to localhost.

## Start

From the project root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\local-minecraft-server\run.ps1
```

The first run generates `local-minecraft-server/.env` with a random RCON password, builds the image, and starts the server. The initial build and first launch download NeoForge/server files and can take a while. The world is saved in the Podman volume `local-minecraft-world` and survives container restarts. Press Ctrl+C to stop the server.

Connect a Minecraft client on the same computer to `localhost:25565`. The server uses the matching Minecraft/NeoForge versions but does not include the project's mod list.

## Connect the Twitch bridge

Copy `RCON_PASSWORD` from `local-minecraft-server/.env` into `twitch-chat-bridge/.env`. Set `RCON_HOST=local-minecraft`, `RCON_PORT=25575`, and `DRY_RUN=false` there, and configure the Twitch channel, bot username, and OAuth token. Start this server first, then run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\twitch-chat-bridge\run.ps1`. The bridge joins the same private Podman network; RCON is not published on the host.

The RCON password is generated locally and ignored by Git. Do not share or commit either `.env` file.
