Add-Type -AssemblyName System.Drawing

function New-AppIcon {
  param(
    [int]$Size,
    [string]$Path
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $purple = [System.Drawing.Color]::FromArgb(255, 91, 95, 199)
  $white = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
  $brush = New-Object System.Drawing.SolidBrush $purple
  $whiteBrush = New-Object System.Drawing.SolidBrush $white

  $radius = [Math]::Max(2, [int]($Size * 0.22))
  $d = $radius * 2
  $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
  $pathObj.AddArc(0, 0, $d, $d, 180, 90)
  $pathObj.AddArc($Size - $d, 0, $d, $d, 270, 90)
  $pathObj.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90)
  $pathObj.AddArc(0, $Size - $d, $d, $d, 90, 90)
  $pathObj.CloseFigure()
  $g.FillPath($brush, $pathObj)

  $bx = [int]($Size * 0.22)
  $by = [int]($Size * 0.20)
  $bw = [int]($Size * 0.56)
  $bh = [int]($Size * 0.42)
  $g.FillEllipse($whiteBrush, $bx, $by, $bw, $bh)

  $p1 = New-Object System.Drawing.Point ([int]($Size * 0.32), [int]($Size * 0.54))
  $p2 = New-Object System.Drawing.Point ([int]($Size * 0.36), [int]($Size * 0.74))
  $p3 = New-Object System.Drawing.Point ([int]($Size * 0.50), [int]($Size * 0.56))
  $g.FillPolygon($whiteBrush, @($p1, $p2, $p3))

  $dir = Split-Path -Parent $Path
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $brush.Dispose()
  $whiteBrush.Dispose()
  $pathObj.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
if (-not $PSScriptRoot) {
  $root = (Get-Location).Path
}
$iconDir = Join-Path $root "src\assets\icons"
New-Item -ItemType Directory -Path $iconDir -Force | Out-Null

New-AppIcon -Size 16 -Path (Join-Path $iconDir "icon16.png")
New-AppIcon -Size 48 -Path (Join-Path $iconDir "icon48.png")
New-AppIcon -Size 128 -Path (Join-Path $iconDir "icon128.png")

Write-Output "Wrote icons to $iconDir"
