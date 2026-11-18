$ErrorActionPreference = 'Stop'
$log = 'C:\Users\Deivis_Pc\Desktop\proyectos\gymsync\scripts\grant-service-control.log'
function Log($m) { Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date -Format 'o'), $m) }

$sid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
Log "SID usuario: $sid"

foreach ($svc in @('MySQL', 'com.docker.service')) {
  $sd = ((& sc.exe sdshow $svc) 2>&1 | Out-String).Trim()
  if (-not $sd.StartsWith('D:')) {
    Log "ERROR: no se pudo leer SDDL de $svc : $sd"
    continue
  }
  if ($sd -match [regex]::Escape($sid)) {
    Log "$svc ya tenia permiso para $sid"
    continue
  }
  $ace = "(A;;LCRPWP;;;$sid)"
  $new = $sd -replace '^D:', "D:$ace"
  & sc.exe sdset $svc $new 2>&1 | ForEach-Object { Log "sdset $svc : $_" }
  $check = ((& sc.exe sdshow $svc) 2>&1 | Out-String)
  if ($check -match [regex]::Escape($sid)) {
    Log "$svc: permiso concedido"
  } else {
    Log "$svc: NO se pudo conceder"
  }
}
Log '=== Fin ==='
