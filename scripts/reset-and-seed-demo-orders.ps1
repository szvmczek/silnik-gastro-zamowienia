param(
  [switch]$ConfirmReset
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmReset) {
  throw 'Refusing to reset and seed orders. Re-run with -ConfirmReset after verifying this is local/demo DB.'
}

$root = Split-Path -Parent $PSScriptRoot
$composePath = Join-Path $root 'docker-compose.yml'
$sqlFiles = @(
  'reset-demo-orders.sql',
  'seed-demo-orders.sql'
)

foreach ($file in $sqlFiles) {
  $path = Join-Path $PSScriptRoot $file
  if (-not (Test-Path $path)) {
    throw "Missing SQL script: $path"
  }
}

$containerId = (& docker compose -f $composePath ps -q postgres).Trim()
if (-not $containerId) {
  throw 'Postgres container not found. Start local DB with: docker compose up -d postgres'
}

Write-Host 'Resetting local/demo order domain and seeding neutral demo orders.'
Write-Host 'DO NOT run this against production unless you intentionally want to wipe orders.'

foreach ($file in $sqlFiles) {
  $path = Join-Path $PSScriptRoot $file
  Write-Host "Executing $file..."
  Get-Content -Raw $path |
    docker exec -i $containerId psql -U pizza -d pizza_showcase -v ON_ERROR_STOP=1
}

Write-Host 'Demo order/customer data reset + seed completed.'
