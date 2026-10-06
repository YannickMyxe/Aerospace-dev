# Twitch emote resource pack

This folder contains the emote ID-to-private-use-codepoint registry and a generator for the Minecraft 1.21.1 resource pack. The pack defines the custom font `twitch:emotes`; later, the bridge will use it when formatting messages.

## Generate

From this folder, run:

```powershell
bun run .\generate-pack.ts
```

The generated pack is written to `resource-pack/`. The first run creates a small temporary placeholder image for each emote. Replace each placeholder at `resource-pack/assets/twitch/textures/emotes/<id>.png` with artwork you have permission to use, keeping the filename. The generator preserves existing images when run again and scales glyphs to 8 pixels high to fit normal chat text.

The current registry maps Twitch global emote **Kappa** (ID `25`) to private-use codepoint **U+E000**. The font and placeholder prove the mapping works, but the bridge is not yet sending these glyphs; it continues to show `[Kappa]` until the next integration step.

Keep existing codepoint assignments stable and add new emotes in `emote-map.json` using unused codepoints in the configured private-use range. Generated pack targets Minecraft 1.21.1 (resource-pack format 34).

## Sync Twitch global emotes

The importer uses Twitch's official Get Global Emotes endpoint and static CDN images. It reads `TWITCH_OAUTH_TOKEN` from `twitch-chat-bridge/.env` and gets the associated Client ID from Twitch's token-validation endpoint, so no additional credentials are needed. Run from this folder:

```powershell
bun run .\sync-global-emotes.ts
bun run .\generate-pack.ts
```

The importer preserves existing ID/codepoint assignments, allocates unused codepoints for new emotes, and saves static PNG artwork. After syncing, rebuild the bridge image by restarting `twitch-chat-bridge/run.ps1`, then copy the updated `resource-pack` contents to each client's resource-pack folder and press F3+T. Emote images are Twitch artwork; use and distribute them subject to Twitch's applicable terms.
