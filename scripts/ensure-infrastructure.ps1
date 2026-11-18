$ErrorActionPreference = 'Stop'
$log = Join-Path $PSScriptRoot 'infrastructure.log'
function Log($m) { Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date -Format 'o'), $m) }

Log '=== Infra start ==='

$mysql = Get-Service -Name 'MySQL' -ErrorAction SilentlyContinue
if ($mysql) {
  if ($mysql.Status -ne 'Running') {
    Start-Service -Name 'MySQL'
    Log 'MySQL iniciado'
  } else {
    Log 'MySQL ya estaba activo'
  }
} else {
  Log 'ERROR: servicio MySQL no existe'
}

$dockerSvc = Get-Service -Name 'com.docker.service' -ErrorAction SilentlyContinue
if ($dockerSvc) {
  if ($dockerSvc.Status -ne 'Running') {
    Start-Service -Name 'com.docker.service'
    Log 'com.docker.service iniciado'
  } else {
    Log 'com.docker.service ya estaba activo'
  }
} else {
  Log 'ERROR: servicio com.docker.service no existe'
}

$dockerExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
if (-not (Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue)) {
  Start-Process -FilePath $dockerExe
  Log 'Docker Desktop lanzado'
} else {
  Log 'Docker Desktop ya estaba abierto'
}

$ready = $false
for ($i = 0; $i -lt 12; $i++) {
  if (docker info --format '{{.ServerVersion}}' 2>$null) { $ready = $true; break }
  Start-Sleep -Seconds 5
}
Log "Docker daemon listo: $ready"
Log '=== Infra end ==='
