# Deploy AutoSphere backend to EC2: wipes old ~/autosphere-backend, uploads backend WITHOUT node_modules
# (node_modules is huge and often causes scp "Connection reset"). npm install runs on the server.
#
# Usage:
#   cd "D:\PROJECTS\AUTOSPHERE AI"
#   .\scripts\ec2-backend-deploy.ps1 -PublicIp "100.53.242.8"

param(
    [string]$PublicIp = "100.53.242.8",
    [string]$KeyPath = "",
    [string]$RemoteUser = "ubuntu"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
if (-not $KeyPath) {
    $KeyPath = Join-Path $RepoRoot "autosphere ec2.pem"
}
$BackendLocal = Join-Path $RepoRoot "autosphere_full_production_monorepo\services\backend"
$ServerJs = Join-Path $BackendLocal "src\server.js"

if (-not (Test-Path $ServerJs)) {
    Write-Error "Missing backend: $ServerJs"
}

if (-not (Test-Path $KeyPath)) {
    Write-Error "Key not found: $KeyPath"
}

$Target = "${RemoteUser}@${PublicIp}"
$Staging = Join-Path $env:TEMP "autosphere-backend-upload-$([Guid]::NewGuid().ToString('N').Substring(0, 8))"

Write-Host "EC2 target: $Target" -ForegroundColor Cyan
Write-Host "Staging copy (excludes node_modules, .git) -> $Staging" -ForegroundColor Cyan

try {
    New-Item -ItemType Directory -Path $Staging -Force | Out-Null
    # /E = subdirs, /XD = exclude dirs. Do not use /NJN (invalid on Windows robocopy → exit 16).
    robocopy "$BackendLocal" "$Staging" /E /XD node_modules .git /NFL /NDL /NJH /NP | Out-Null
    $rc = $LASTEXITCODE
    if ($rc -ge 8) { Write-Error "robocopy failed with exit code $rc (see robocopy /?)" }

    Write-Host "Cleaning remote ~/autosphere-backend and stopping pm2 autosphere-api (if any)..." -ForegroundColor Cyan
    ssh -i $KeyPath $Target "rm -rf ~/autosphere-backend; pm2 delete autosphere-api 2>/dev/null; true"
    if ($LASTEXITCODE -ne 0) { Write-Error "ssh cleanup failed" }

    Write-Host "Uploading (~12 MB of source, not node_modules)..." -ForegroundColor Cyan
    scp -i $KeyPath -r $Staging "${Target}:~/autosphere-backend"
    if ($LASTEXITCODE -ne 0) { Write-Error "scp failed. Retry on a stable network; security group must allow SSH 22." }

    Write-Host "Installing dependencies on server (npm install)..." -ForegroundColor Cyan
    ssh -i $KeyPath $Target "cd ~/autosphere-backend && cp .env.example .env && npm install --omit=dev"
    if ($LASTEXITCODE -ne 0) { Write-Error "ssh npm install failed" }

    Write-Host ""
    Write-Host "Done. On EC2 run: ls ~/autosphere-backend/src/server.js" -ForegroundColor Green
    Write-Host ""
    Write-Host "  ssh -i `"$KeyPath`" $Target"
    Write-Host "  nano ~/autosphere-backend/.env   # FRONTEND_ORIGIN, GOOGLE_REDIRECT_URI, JWT_SECRET"
    Write-Host "  cd ~/autosphere-backend && pm2 start src/server.js --name autosphere-api && pm2 save"
    Write-Host ""
    Write-Host "Frontend: cd `"$RepoRoot\autosphere-web`" && npm run build && npm run deploy:s3" -ForegroundColor Yellow
}
finally {
    if (Test-Path $Staging) {
        Remove-Item -Recurse -Force $Staging -ErrorAction SilentlyContinue
    }
}
