[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$serverDirectory = Join-Path $repositoryRoot 'apps\server'
$mobileDirectory = Join-Path $repositoryRoot 'apps\mobile'
$npxCommand = (Get-Command npx.cmd -ErrorAction Stop).Source
$expoCommand = Join-Path $mobileDirectory 'node_modules\.bin\expo.cmd'
$runDirectory = Join-Path $env:TEMP ("super-tennis-tunnel-" + [guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

function Start-LoggedProcess {
  param(
    [Parameter(Mandatory)] [string] $Name,
    [Parameter(Mandatory)] [string] $WorkingDirectory,
    [Parameter(Mandatory)] [string[]] $Arguments
  )

  $standardOutput = Join-Path $runDirectory "$Name.out.log"
  $standardError = Join-Path $runDirectory "$Name.err.log"

  $startProcessOptions = @{
    FilePath = $npxCommand
    ArgumentList = $Arguments
    WorkingDirectory = $WorkingDirectory
    NoNewWindow = $true
    PassThru = $true
    RedirectStandardOutput = $standardOutput
    RedirectStandardError = $standardError
  }

  return Start-Process @startProcessOptions
}

function Get-ProcessLog {
  param([Parameter(Mandatory)] [string] $Name)

  $files = @(
    (Join-Path $runDirectory "$Name.out.log"),
    (Join-Path $runDirectory "$Name.err.log")
  ) | Where-Object { Test-Path -LiteralPath $_ }

  if ($files.Count -eq 0) {
    return ''
  }

  return (Get-Content -LiteralPath $files -Raw -ErrorAction SilentlyContinue) -join [Environment]::NewLine
}

function Wait-ForApi {
  param([Parameter(Mandatory)] [System.Diagnostics.Process] $Process)

  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) {
    if ($Process.HasExited) {
      throw "Could not start the API server.`n$(Get-ProcessLog 'api')"
    }

    try {
      $health = Invoke-RestMethod -Uri 'http://127.0.0.1:3001/health' -TimeoutSec 2
      if ($health.status -eq 'ok') {
        return
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  throw "Timed out while starting the API server.`n$(Get-ProcessLog 'api')"
}

function Test-LocalApiPortInUse {
  try {
    return Test-NetConnection -ComputerName '127.0.0.1' -Port 3001 -InformationLevel Quiet -WarningAction SilentlyContinue
  } catch {
    return $false
  }
}

function Wait-ForTunnelUrl {
  param([Parameter(Mandatory)] [System.Diagnostics.Process] $Process)

  $deadline = (Get-Date).AddMinutes(2)
  $urlPattern = 'https://[a-z0-9-]+\.trycloudflare\.com'

  while ((Get-Date) -lt $deadline) {
    $log = Get-ProcessLog 'api-tunnel'
    $match = [regex]::Match($log, $urlPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($match.Success) {
      return $match.Value
    }

    if ($Process.HasExited) {
      throw "Could not start the API Cloudflare Tunnel.`n$log"
    }

    Start-Sleep -Seconds 1
  }

  throw "Timed out while waiting for the API Cloudflare Tunnel URL.`n$(Get-ProcessLog 'api-tunnel')"
}

function Set-ApiUrlEnvironment {
  param([Parameter(Mandatory)] [string] $ApiUrl)

  $environmentFile = Join-Path $mobileDirectory '.env.local'
  $lines = if (Test-Path -LiteralPath $environmentFile) {
    @(Get-Content -LiteralPath $environmentFile -Encoding utf8)
  } else {
    @()
  }

  $updated = $false
  $newLines = foreach ($line in $lines) {
    if ($line -match '^EXPO_PUBLIC_API_URL=') {
      $updated = $true
      "EXPO_PUBLIC_API_URL=$ApiUrl"
    } else {
      $line
    }
  }

  if (-not $updated) {
    $newLines += "EXPO_PUBLIC_API_URL=$ApiUrl"
  }

  Set-Content -LiteralPath $environmentFile -Value $newLines -Encoding utf8
}

function Stop-ProcessTree {
  param([System.Diagnostics.Process] $Process)

  if ($null -eq $Process -or $Process.HasExited) {
    return
  }

  # npx can leave child processes (wrangler/cloudflared) running. End only this process tree.
  & "$env:SystemRoot\System32\taskkill.exe" /PID $Process.Id /T /F *> $null
  [void] $Process.WaitForExit(5000)
}

$apiProcess = $null
$apiTunnelProcess = $null

try {
  if (-not (Test-Path -LiteralPath $expoCommand)) {
    throw "Expo CLI was not found at $expoCommand. Run npm install in apps/mobile first."
  }

  if (Test-LocalApiPortInUse) {
    throw 'Port 3001 is already in use. Stop the manually started API server before running this script.'
  }

  Write-Host '1/3 Starting API server...' -ForegroundColor Cyan
  $apiProcess = Start-LoggedProcess -Name 'api' -WorkingDirectory $serverDirectory -Arguments @('tsx', 'watch', 'src/index.ts')
  Wait-ForApi -Process $apiProcess

  Write-Host '2/3 Starting API Cloudflare Tunnel...' -ForegroundColor Cyan
  $apiTunnelProcess = Start-LoggedProcess -Name 'api-tunnel' -WorkingDirectory $serverDirectory -Arguments @('wrangler', 'tunnel', 'quick-start', 'http://localhost:3001')
  $apiTunnelUrl = Wait-ForTunnelUrl -Process $apiTunnelProcess
  Set-ApiUrlEnvironment -ApiUrl $apiTunnelUrl
  Write-Host "API URL: $apiTunnelUrl" -ForegroundColor Green

  Write-Host '3/3 Starting Expo development-build Tunnel...' -ForegroundColor Cyan
  Write-Host 'Press Ctrl+C to stop all development processes.' -ForegroundColor Yellow
  Push-Location $mobileDirectory
  try {
    & $expoCommand start --dev-client --tunnel --clear
  } finally {
    Pop-Location
  }
} finally {
  foreach ($process in @($apiTunnelProcess, $apiProcess)) {
    Stop-ProcessTree -Process $process
  }

  if (Test-Path -LiteralPath $runDirectory) {
    Remove-Item -LiteralPath $runDirectory -Recurse -Force -ErrorAction SilentlyContinue
  }
}
