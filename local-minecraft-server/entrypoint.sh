#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${RCON_PASSWORD:-}" ]]; then
  echo "RCON_PASSWORD must be set." >&2
  exit 1
fi

if [[ ! "$RCON_PASSWORD" =~ ^[A-Za-z0-9_-]{16,64}$ ]]; then
  echo "RCON_PASSWORD must be 16-64 characters using only letters, numbers, _ or -." >&2
  exit 1
fi

cat > /server/server.properties <<EOF
enable-rcon=true
rcon.password=${RCON_PASSWORD}
rcon.port=25575
server-port=25565
server-ip=
motd=Local Twitch Chat Test Server
EOF

echo "eula=true" > /server/eula.txt
exec ./run.sh nogui
