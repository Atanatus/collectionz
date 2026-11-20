param(
    [string]$Cartas = (Join-Path $env:USERPROFILE 'Downloads\Criaturas\CARTAS Temp1'),
    [string]$Reverso = (Join-Path $env:USERPROFILE 'Downloads\reverso.png')
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$catalogo = Join-Path $repo 'assets\js\catalogo.js'
$destino = Join-Path $repo 'assets\cartas\temporada-1'
$texto = [IO.File]::ReadAllText($catalogo)
$ediciones = @([regex]::Matches($texto, '"editionId": "([^"]+)"') |
    ForEach-Object { $_.Groups[1].Value })
if ($ediciones.Count -ne 27 -or @($ediciones | Sort-Object -Unique).Count -ne 27) {
    throw 'El catalogo debe contener 27 identificadores de edicion distintos.'
}

$archivos = @(Get-ChildItem -LiteralPath $Cartas -File -Filter '*.png')
$imagenes = [ordered]@{}
foreach ($edicion in $ediciones) {
    $patron = '(?:^|-)' + [regex]::Escape($edicion) + '(?: \(\d+\))?$'
    $encontradas = @($archivos | Where-Object { $_.BaseName -match $patron })
    if ($encontradas.Count -ne 1) {
        throw "$edicion necesita un PNG. Encontrados: $($encontradas.Count)."
    }
    $imagenes["$edicion.png"] = $encontradas[0].FullName
}
$imagenes['reverso.png'] = (Get-Item -LiteralPath $Reverso).FullName

Add-Type -AssemblyName System.Drawing
foreach ($ruta in $imagenes.Values) {
    $imagen = [System.Drawing.Image]::FromFile($ruta)
    try {
        if ($imagen.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Png.Guid) {
            throw "El archivo debe ser PNG: $ruta"
        }
        if ($ruta -ne $imagenes['reverso.png'] -and
            ($imagen.Width -ne 1000 -or $imagen.Height -ne 1400)) {
            throw "La carta debe medir 1000 x 1400: $ruta"
        }
    } finally {
        $imagen.Dispose()
    }
}

New-Item -ItemType Directory -Path $destino -Force | Out-Null
foreach ($nombre in $imagenes.Keys) {
    Copy-Item -LiteralPath $imagenes[$nombre] -Destination (Join-Path $destino $nombre)
}
Write-Host 'Temporada 1: 27 cartas y reverso importados.'
