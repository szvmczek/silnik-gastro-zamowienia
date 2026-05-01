$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$envPath = Join-Path $root '.env'
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
    $idx = $line.IndexOf('=')
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1).Trim()
    if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    Set-Item -Path "Env:$key" -Value $val
  }
}

if (-not (Test-Path .\logs)) { New-Item -ItemType Directory -Path .\logs | Out-Null }

$be = Start-Process -FilePath .\backend\gradlew.bat -ArgumentList bootRun,'--console=plain' -WorkingDirectory .\backend -RedirectStandardOutput logs\backend.log -RedirectStandardError logs\backend.err -WindowStyle Hidden -PassThru
$be.Id | Out-File -Encoding utf8 logs\backend.pid

$fe = Start-Process -FilePath cmd.exe -ArgumentList '/c','npm run dev' -WorkingDirectory .\frontend -RedirectStandardOutput logs\frontend.log -RedirectStandardError logs\frontend.err -WindowStyle Hidden -PassThru
$fe.Id | Out-File -Encoding utf8 logs\frontend.pid

Start-Sleep -Seconds 3
$beAlive = $null -ne (Get-Process -Id $be.Id -ErrorAction SilentlyContinue)
$feAlive = $null -ne (Get-Process -Id $fe.Id -ErrorAction SilentlyContinue)
"backend PID=$($be.Id) alive=$beAlive"
"frontend PID=$($fe.Id) alive=$feAlive"
