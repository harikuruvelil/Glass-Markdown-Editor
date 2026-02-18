$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $projectRoot 'new_icon_images'
$primaryOut = Join-Path $PSScriptRoot 'icons\icon.ico'
$secondaryOut = Join-Path $PSScriptRoot 'icon.ico'

$iconSources = @(
  @{ Size = 16;  Path = (Join-Path $sourceDir 'icon16.png') },
  @{ Size = 32;  Path = (Join-Path $sourceDir 'icon32.png') },
  @{ Size = 64;  Path = (Join-Path $sourceDir 'icon64.png') },
  @{ Size = 128; Path = (Join-Path $sourceDir 'icon128.png') }
)

foreach ($item in $iconSources) {
  if (-not (Test-Path -LiteralPath $item.Path)) {
    throw "Missing icon source file: $($item.Path)"
  }
}

$images = foreach ($item in $iconSources) {
  $src = [System.Drawing.Image]::FromFile($item.Path)
  try {
    $targetSize = [int]$item.Size
    $bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $g.DrawImage($src, 0, 0, $targetSize, $targetSize)

      $ms = New-Object System.IO.MemoryStream
      try {
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBytes = $ms.ToArray()
      } finally {
        $ms.Dispose()
      }

      [PSCustomObject]@{
        Size = $targetSize
        Data = $pngBytes
      }
    } finally {
      $g.Dispose()
      $bmp.Dispose()
    }
  } finally {
    $src.Dispose()
  }
}

$iconDir = New-Object System.Collections.Generic.List[byte]
$iconDir.AddRange([byte[]](0x00, 0x00, 0x01, 0x00))
$iconDir.AddRange([System.BitConverter]::GetBytes([UInt16]$images.Count))

$entriesLength = 16 * $images.Count
$dataOffset = 6 + $entriesLength
$dataBlocks = New-Object System.Collections.Generic.List[byte]

foreach ($img in $images) {
  $sizeByte = if ($img.Size -ge 256) { 0 } else { [byte]$img.Size }
  $iconDir.Add($sizeByte) # width
  $iconDir.Add($sizeByte) # height
  $iconDir.Add(0)         # color count
  $iconDir.Add(0)         # reserved
  $iconDir.AddRange([System.BitConverter]::GetBytes([UInt16]1))   # planes
  $iconDir.AddRange([System.BitConverter]::GetBytes([UInt16]32))  # bit depth
  $iconDir.AddRange([System.BitConverter]::GetBytes([UInt32]$img.Data.Length))
  $iconDir.AddRange([System.BitConverter]::GetBytes([UInt32]$dataOffset))

  $dataBlocks.AddRange($img.Data)
  $dataOffset += $img.Data.Length
}

$output = New-Object System.Collections.Generic.List[byte]
$output.AddRange($iconDir)
$output.AddRange($dataBlocks)
$bytes = $output.ToArray()

[System.IO.File]::WriteAllBytes($primaryOut, $bytes)
[System.IO.File]::WriteAllBytes($secondaryOut, $bytes)

Write-Host "Created ICO from provided icon set:"
Write-Host " - $primaryOut"
Write-Host " - $secondaryOut"
Write-Host "Sizes: $($iconSources.Size -join ', ')"
Write-Host "Output bytes: $($bytes.Length)"
