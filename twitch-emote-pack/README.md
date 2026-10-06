# Twitch emote resource pack

This folder contains the emote ID-to-private-use-codepoint registry and a generator for the Minecraft 1.21.1 resource pack. The pack defines the custom font `twitch:emotes`; later, the bridge will use it when formatting messages.

## Generate

From this folder, run:

```powershell
bun run .\generate-pack.ts
```

The generated pack is written to `resource-pack/`. The first run creates a small temporary placeholder image for each emote. Replace each placeholder at `resource-pack/assets/twitch/textures/emotes/<id>.png` with square artwork you have permission to use, keeping the filename. The generator preserves existing images when run again.

The current registry maps Twitch global emote **Kappa** (ID `25`) to private-use codepoint **U+E000**. The font and placeholder prove the mapping works, but the bridge is not yet sending these glyphs; it continues to show `[Kappa]` until the next integration step.

Keep existing codepoint assignments stable and add new emotes in `emote-map.json` using unused codepoints in the configured private-use range. Generated pack targets Minecraft 1.21.1 (resource-pack format 34).
