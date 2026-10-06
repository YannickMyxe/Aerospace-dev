$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    throw "Podman was not found. Install Podman Desktop or add podman to PATH."
}

if (-not (Test-Path ".env")) {
    $password = ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
    "RCON_PASSWORD=$password" | Set-Content -Path ".env" -Encoding ascii
    Write-Host "Created local-minecraft-server/.env with a random RCON password."
}

podman network exists twitch-chat-local
if ($LASTEXITCODE -ne 0) {
    podman network create twitch-chat-local
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

podman volume exists local-minecraft-world
if ($LASTEXITCODE -ne 0) {
    podman volume create local-minecraft-world
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

podman build -t local-minecraft-server .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

podman run --rm --name local-minecraft `
    --network twitch-chat-local `
    --publish 127.0.0.1:25565:25565 `
    --volume local-minecraft-world:/server/world `
    --env-file .env `
    local-minecraft-server
exit $LASTEXITCODE
