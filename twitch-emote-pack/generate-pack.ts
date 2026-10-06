import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { deflateSync } from "node:zlib";

interface Emote {
  id: string;
  name: string;
  codepoint: string;
}

interface EmoteMap {
  version: number;
  privateUseRange: {
    start: string;
    end: string;
  };
  emotes: Emote[];
}

const root = import.meta.dir;
const registryPath = join(root, "emote-map.json");
const packRoot = join(root, "resource-pack");
const width = 16;
const height = 8;

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function createPlaceholderPng(): Buffer {
  const pixels = Buffer.alloc(width * height * 4);
  const letter = [
    "10001",
    "10010",
    "10100",
    "11000",
    "10100",
    "10010",
    "10001"
  ];

  for (let row = 0; row < letter.length; row++) {
    for (let column = 0; column < letter[row].length; column++) {
      if (letter[row][column] !== "1") continue;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const pixelX = column * 2 + x + 3;
          const pixelY = row * 2 + y + 1;
          const offset = (pixelY * width + pixelX) * 4;
          pixels[offset] = 255;
          pixels[offset + 1] = 255;
          pixels[offset + 2] = 255;
          pixels[offset + 3] = 255;
        }
      }
    }
  }

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let row = 0; row < height; row++) {
    const rowOffset = row * (width * 4 + 1);
    scanlines[rowOffset] = 0;
    pixels.copy(scanlines, rowOffset + 1, row * width * 4, (row + 1) * width * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function validateRegistry(registry: EmoteMap): void {
  if (registry.version !== 1) throw new Error("Unsupported emote map version");

  const firstCodepoint = Number.parseInt(registry.privateUseRange.start, 16);
  const lastCodepoint = Number.parseInt(registry.privateUseRange.end, 16);
  if (
    !Number.isFinite(firstCodepoint) ||
    !Number.isFinite(lastCodepoint) ||
    firstCodepoint > lastCodepoint
  ) {
    throw new Error("Invalid private-use range");
  }

  const seenIds = new Set<string>();
  const seenCodepoints = new Set<number>();

  for (const emote of registry.emotes) {
    if (!/^\d+$/.test(emote.id)) throw new Error(`Invalid Twitch emote ID: ${emote.id}`);
    if (!emote.name.trim()) throw new Error(`Emote ${emote.id} must have a name`);
    const codepoint = Number.parseInt(emote.codepoint, 16);
    if (
      !/^[0-9a-f]+$/i.test(emote.codepoint) ||
      codepoint < firstCodepoint ||
      codepoint > lastCodepoint
    ) {
      throw new Error(`Invalid private-use codepoint for ${emote.name}: ${emote.codepoint}`);
    }
    if (seenIds.has(emote.id)) throw new Error(`Duplicate Twitch emote ID: ${emote.id}`);
    if (seenCodepoints.has(codepoint)) throw new Error(`Duplicate codepoint: ${emote.codepoint}`);
    seenIds.add(emote.id);
    seenCodepoints.add(codepoint);
  }
}

async function main(): Promise<void> {
  const registry = JSON.parse(await readFile(registryPath, "utf8")) as EmoteMap;
  validateRegistry(registry);

  const fontProviders = [];
  for (const emote of registry.emotes) {
    const texturePath = `twitch:emotes/${emote.id}.png`;
    const textureFile = join(packRoot, "assets", "twitch", "textures", "emotes", `${emote.id}.png`);
    await mkdir(dirname(textureFile), { recursive: true });

    try {
      await readFile(textureFile);
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      await writeFile(textureFile, createPlaceholderPng());
      console.log(`Created placeholder texture for ${emote.name} (${emote.id}). Replace it with licensed artwork.`);
    }

    fontProviders.push({
      type: "bitmap",
      file: texturePath,
      height,
      ascent: 7,
      chars: [String.fromCodePoint(Number.parseInt(emote.codepoint, 16))]
    });
  }

  const fontFile = join(packRoot, "assets", "twitch", "font", "emotes.json");
  await mkdir(dirname(fontFile), { recursive: true });
  await writeFile(fontFile, `${JSON.stringify({ providers: fontProviders }, null, 2)}\n`);
  await writeFile(
    join(packRoot, "pack.mcmeta"),
    `${JSON.stringify(
      { pack: { pack_format: 34, description: "Twitch Emotes - Minecraft 1.21.1" } },
      null,
      2
    )}\n`
  );

  console.log(`Generated resource pack for ${registry.emotes.length} Twitch emote(s): ${packRoot}`);
}

await main();
