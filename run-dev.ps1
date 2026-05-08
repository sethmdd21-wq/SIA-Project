<#
run-dev.ps1
Usage:
  .\run-dev.ps1           # launch backend and frontend (assumes deps installed)
  .\run-dev.ps1 -Install  # run npm install in both folders, then launch
  .\run-dev.ps1 -Seed     # run seed scripts in backend before launching

Note: You may need to run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
#>

param(
    [switch]$Install,
    [switch]$Seed
)

$root = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

function Start-Terminal {
    param(
        [string]$Path,
        [string]$Commands
    )
    $cmd = "Set-Location -Path '$Path'; $Commands"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $cmd
}

if ($Install) {
    Write-Host "Running npm install in backend and frontend..."
    Start-Terminal -Path $backend -Commands 'npm install'
    Start-Sleep -Seconds 2
    Start-Terminal -Path $frontend -Commands 'npm install'
    Start-Sleep -Seconds 2
}

if (-Not (Test-Path (Join-Path $backend '.env'))) {
    Write-Warning "No backend\.env file found. Create one under 'backend\\.env' per docs/development.md"
}

# Start backend (optionally run seeds)
$backendCmds = @()
if ($Seed) { $backendCmds += 'node seed.js'; $backendCmds += 'node seed_system.js' }
$backendCmds += 'npm run dev'
$backendCmd = [string]::Join('; ', $backendCmds)

Start-Terminal -Path $backend -Commands $backendCmd
Start-Sleep -Seconds 1

# Start frontend
Start-Terminal -Path $frontend -Commands 'npm run dev'

Write-Host "Launched backend and frontend in new PowerShell windows." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser once the frontend server finishes starting." -ForegroundColor Cyan
