$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Get-Command podman -ErrorAction SilentlyContinue)) {
    throw "Podman was not found. Install Podman Desktop or add podman to PATH."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created twitch-chat-bridge/.env with dry-run enabled."
}

podman build -t twitch-chat-bridge .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

podman run --rm -i --env-file .env twitch-chat-bridge
exit $LASTEXITCODE
