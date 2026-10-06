FROM oven/bun:1-alpine

WORKDIR /app

COPY twitch-chat-bridge/package.json twitch-chat-bridge/bun.lock ./
RUN bun install --production --frozen-lockfile

COPY twitch-chat-bridge/src ./src
COPY twitch-emote-pack/emote-map.json ./emote-map.json
ENV EMOTE_MAP_PATH=/app/emote-map.json

CMD ["bun", "run", "src/index.ts"]
