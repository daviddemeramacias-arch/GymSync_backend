$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$log = Join-Path $PSScriptRoot 'start-all.log'
function Log($m) { Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date -Format 'o'), $m) }
function Test-Port([int]$port) {
  [bool](Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)
}

Log '=== GymSync auto-start ==='

# Infra (MySQL + Docker)
try {
  & (Join-Path $PSScriptRoot 'ensure-infrastructure.ps1')
  Log 'Infra (MySQL + Docker) verificada'
} catch {
  Log "ERROR al verificar infra: $($_.Exception.Message)"
}

# Backend :3000
if (-not (Test-Port 3000)) {
  $dir = Join-Path $root 'backend'
  $p = Start-Process -FilePath 'C:\Users\Deivis_Pc\AppData\Local\node20\node.exe' `
    -ArgumentList '-r', './path-setup.js', '-r', 'tsconfig-paths/register', 'dist/main.js' `
    -WorkingDirectory $dir -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $dir 'backend-stdout.log') `
    -RedirectStandardError (Join-Path $dir 'backend-stderr.log')
  Log "Backend iniciado PID $($p.Id)"
} else { Log 'Backend :3000 ya activo' }

# Admin Angular :4200
if (-not (Test-Port 4200)) {
  $dir = Join-Path $root 'admin-web'
  $p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npm start' `
    -WorkingDirectory $dir -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $dir 'ng-serve.log') `
    -RedirectStandardError (Join-Path $dir 'ng-serve.err.log')
  Log "Admin iniciado PID $($p.Id)"
} else { Log 'Admin :4200 ya activo' }

# Preview :5173
if (-not (Test-Port 5173)) {
  $p = Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', '5173' `
    -WorkingDirectory $root -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $root 'preview-stdout.log') `
    -RedirectStandardError (Join-Path $root 'preview-stderr.log')
  Log "Preview iniciado PID $($p.Id)"
} else { Log 'Preview :5173 ya activo' }

# PWA socio :4201
if (-not (Test-Port 4201)) {
  $dir = Join-Path $root 'pwa-socio'
  $p = Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', '4201' `
    -WorkingDirectory $dir -PassThru -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $dir 'pwa-stdout.log') `
    -RedirectStandardError (Join-Path $dir 'pwa-stderr.log')
  Log "PWA iniciada PID $($p.Id)"
} else { Log 'PWA :4201 ya activa' }

Log '=== GymSync auto-start fin ==='
