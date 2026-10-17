param(
  [int]$Port = 4173
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Life Memory Corridor: http://localhost:$Port" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor DarkGray
python -m http.server $Port --directory $root
