# Build the SPA and upload dist/ to S3 static website bucket.
# Prerequisites: AWS CLI v2, credentials via `aws configure` or env vars (do not put secrets in this file).
# Usage: .\scripts\deploy-s3.ps1
#        .\scripts\deploy-s3.ps1 -Bucket "a-autosphere-ai" -Region "us-east-1"

param(
    [string]$Bucket = "a-autosphere-ai",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"
# PSScriptRoot = .../autosphere-web/scripts → repo root = autosphere-web
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Building (production)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$dist = Join-Path $root "dist"
if (-not (Test-Path $dist)) {
    Write-Error "dist folder missing after build."
}

# Long cache for hashed assets; short cache for index.html so users get new JS after deploy
Write-Host "Syncing to s3://$Bucket/ ..." -ForegroundColor Cyan
aws s3 sync $dist "s3://$Bucket/" `
    --delete `
    --region $Region `
    --exclude "index.html" `
    --cache-control "public,max-age=31536000,immutable"

aws s3 cp (Join-Path $dist "index.html") "s3://$Bucket/index.html" `
    --region $Region `
    --cache-control "no-cache,no-store,must-revalidate" `
    --content-type "text/html; charset=utf-8"

$endpoint = "http://$Bucket.s3-website-$Region.amazonaws.com"
Write-Host ""
Write-Host "Done. Open: $endpoint" -ForegroundColor Green
Write-Host "If login still fails: hard refresh (Ctrl+Shift+R) or incognito; confirm EC2 IP in .env.production matches your instance." -ForegroundColor Yellow
