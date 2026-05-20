param(
  [switch]$ConfirmReset
)

$ErrorActionPreference = 'Stop'

if (-not $ConfirmReset) {
  throw 'Refusing to reset orders. Re-run with -ConfirmReset after verifying this is local/demo DB.'
}

$root = Split-Path -Parent $PSScriptRoot
$sqlPath = Join-Path $PSScriptRoot 'reset-demo-orders.sql'
$composePath = Join-Path $root 'docker-compose.yml'

if (-not (Test-Path $sqlPath)) {
  throw "Missing SQL script: $sqlPath"
}

$containerId = (& docker compose -f $composePath ps -q postgres).Trim()
if (-not $containerId) {
  throw 'Postgres container not found. Start local DB with: docker compose up -d postgres'
}

Get-Content -Raw $sqlPath |
  docker exec -i $containerId psql -U pizza -d pizza_showcase -v ON_ERROR_STOP=1

Write-Host 'Demo order/customer data reset completed.'
