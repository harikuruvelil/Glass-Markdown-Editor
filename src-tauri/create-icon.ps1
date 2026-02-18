$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Resize-Png {
  param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][int]$Size,
    [Parameter(Mandatory = $true)][string]$OutputPath
  )

  $src = [System.Drawing.Image]::FromFile($InputPath)
  try {
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.DrawImage($src, 0, 0, $Size, $Size)
      $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $g.Dispose()
      $bmp.Dispose()
    }
  } finally {
    $src.Dispose()
  }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $projectRoot 'new_icon_images'
$iconsDir = Join-Path $PSScriptRoot 'icons'
$tempOutput = Join-Path ([System.IO.Path]::GetTempPath()) ("markdown-notes-icon-" + [System.Guid]::NewGuid().ToString('N'))
$sourceHashFile = Join-Path $iconsDir '.icon-source.hash'
$secondaryOut = Join-Path $PSScriptRoot 'icon.ico'
$cargoTargetDir = Join-Path $projectRoot 'target-tauri'
$forceIconRelink = $env:FORCE_ICON_RELINK -eq '1'

function Invoke-CargoCleanIfAvailable {
  param(
    [Parameter(Mandatory = $true)][string]$ManifestPath,
    [Parameter(Mandatory = $true)][string]$TargetDir
  )

  $cargoCommand = Get-Command 'cargo' -ErrorAction SilentlyContinue
  if ($cargoCommand) {
    & $cargoCommand.Source clean --manifest-path $ManifestPath --target-dir $TargetDir
  } else {
    Write-Host 'Cargo not found in PATH during icon regeneration; skipping target clean.'
  }
}

$sourceFiles = @(
  'icon16.png',
  'icon32.png',
  'icon64.png',
  'icon128.png'
)

foreach ($file in $sourceFiles) {
  $path = Join-Path $sourceDir $file
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing icon source file: $path"
  }
}

if (-not (Test-Path -LiteralPath $iconsDir)) {
  New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

$hashParts = foreach ($file in $sourceFiles) {
  $fullPath = Join-Path $sourceDir $file
  $hash = (Get-FileHash -Path $fullPath -Algorithm SHA256).Hash
  "${file}:${hash}"
}
$sourceHash = $hashParts -join '|'

$requiredOutputs = @(
  'icon.ico',
  'icon.png',
  '32x32.png',
  '64x64.png',
  '128x128.png',
  '128x128@2x.png',
  'StoreLogo.png',
  'Square44x44Logo.png'
)

$allOutputsPresent = $true
foreach ($required in $requiredOutputs) {
  if (-not (Test-Path -LiteralPath (Join-Path $iconsDir $required))) {
    $allOutputsPresent = $false
    break
  }
}

$previousHash = if (Test-Path -LiteralPath $sourceHashFile) {
  Get-Content -Path $sourceHashFile -Raw
} else {
  ''
}

if ($allOutputsPresent -and $previousHash -eq $sourceHash) {
  Copy-Item -Path (Join-Path $iconsDir 'icon.ico') -Destination $secondaryOut -Force
  if ($forceIconRelink) {
    Invoke-CargoCleanIfAvailable -ManifestPath (Join-Path $PSScriptRoot 'Cargo.toml') -TargetDir $cargoTargetDir
  }
  Write-Host 'Icon assets unchanged; skipped regeneration.'
  exit 0
}

New-Item -ItemType Directory -Path $tempOutput -Force | Out-Null

$npxCommand = Get-Command 'npx.cmd' -ErrorAction SilentlyContinue
if (-not $npxCommand) {
  throw 'Could not find npx.cmd. Ensure Node.js is installed.'
}

$sourceForTauri = Join-Path $sourceDir 'icon128.png'
& $npxCommand.Path tauri icon $sourceForTauri --output $tempOutput
if ($LASTEXITCODE -ne 0) {
  throw "tauri icon command failed with exit code $LASTEXITCODE"
}

$filesToCopy = @(
  'icon.ico',
  'icon.icns',
  'icon.png',
  '32x32.png',
  '64x64.png',
  '128x128.png',
  '128x128@2x.png',
  'StoreLogo.png',
  'Square30x30Logo.png',
  'Square44x44Logo.png',
  'Square71x71Logo.png',
  'Square89x89Logo.png',
  'Square107x107Logo.png',
  'Square142x142Logo.png',
  'Square150x150Logo.png',
  'Square284x284Logo.png',
  'Square310x310Logo.png'
)

foreach ($file in $filesToCopy) {
  $from = Join-Path $tempOutput $file
  if (Test-Path -LiteralPath $from) {
    Copy-Item -Path $from -Destination (Join-Path $iconsDir $file) -Force
  }
}

# Use the user-provided sizes as authoritative for desktop PNG outputs.
Resize-Png -InputPath (Join-Path $sourceDir 'icon32.png') -Size 32 -OutputPath (Join-Path $iconsDir '32x32.png')
Resize-Png -InputPath (Join-Path $sourceDir 'icon64.png') -Size 64 -OutputPath (Join-Path $iconsDir '64x64.png')
Resize-Png -InputPath (Join-Path $sourceDir 'icon128.png') -Size 128 -OutputPath (Join-Path $iconsDir '128x128.png')
Resize-Png -InputPath (Join-Path $sourceDir 'icon128.png') -Size 256 -OutputPath (Join-Path $iconsDir '128x128@2x.png')
Resize-Png -InputPath (Join-Path $sourceDir 'icon128.png') -Size 512 -OutputPath (Join-Path $iconsDir 'icon.png')

Copy-Item -Path (Join-Path $iconsDir 'icon.ico') -Destination $secondaryOut -Force
Set-Content -Path $sourceHashFile -Value $sourceHash -NoNewline

# Force a resource relink when icons change so installed app icon updates reliably.
Invoke-CargoCleanIfAvailable -ManifestPath (Join-Path $PSScriptRoot 'Cargo.toml') -TargetDir $cargoTargetDir

Remove-Item -Path $tempOutput -Recurse -Force -ErrorAction SilentlyContinue

Write-Host 'Generated icon assets from provided icon set:'
Write-Host " - $(Join-Path $iconsDir 'icon.ico')"
Write-Host " - $(Join-Path $iconsDir 'icon.png')"
Write-Host " - $(Join-Path $iconsDir '32x32.png')"
Write-Host " - $(Join-Path $iconsDir '64x64.png')"
Write-Host " - $(Join-Path $iconsDir '128x128.png')"
Write-Host " - $(Join-Path $iconsDir '128x128@2x.png')"
