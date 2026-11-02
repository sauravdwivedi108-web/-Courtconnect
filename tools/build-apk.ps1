# ============================================================
# CourtConnect - Android APK builder (no Gradle / Android Studio)
# Usage:
#   powershell -File tools/build-apk.ps1 `
#       -JdkDir C:\...\jdk-17 `
#       -SdkDir C:\...\Android\Sdk `
#       -OutApk downloads\courtconnect-v1.2.apk
#
# The current website (root *.html, manifest, assets/) is copied into
# android-app/assets/www and bundled, so the app works fully offline.
# Version / min + target SDK live in android-app/AndroidManifest.xml.
#
# Signing key: kept OUTSIDE the repo (default %USERPROFILE%\.courtconnect\courtconnect.jks)
# and created on first run. Reuse the same key for every release, otherwise
# phones refuse to update over the installed app.
# ============================================================
param(
  [string]$JdkDir = $env:CC_JDK,
  [string]$SdkDir = $(if ($env:CC_SDK) { $env:CC_SDK } else { Join-Path $env:LOCALAPPDATA "Android\Sdk" }),
  [string]$OutApk = "downloads/courtconnect-v1.2.apk",
  [string]$KeyStore = $(if ($env:CC_KEYSTORE) { $env:CC_KEYSTORE } else { Join-Path $env:USERPROFILE ".courtconnect\courtconnect.jks" }),
  [string]$KeyPass = $(if ($env:CC_KEYSTORE_PASS) { $env:CC_KEYSTORE_PASS } else { "courtconnect" })
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

if (-not $JdkDir -or -not $SdkDir) {
  Write-Host "Provide -JdkDir and -SdkDir (or set CC_JDK / CC_SDK)."
  exit 1
}

# ensure java is on PATH for .bat wrappers (d8 / apksigner)
$env:JAVA_HOME = $JdkDir
$env:Path = (Join-Path $JdkDir "bin") + ";" + $env:Path

$Root = Split-Path -Parent $PSScriptRoot
$App  = Join-Path $Root "android-app"
$BT   = Join-Path $SdkDir "build-tools/34.0.0"
$Plat = Join-Path $SdkDir "platforms/android-34"
$AndroidJar = Join-Path $Plat "android.jar"

$aapt2 = Join-Path $BT "aapt2.exe"
$d8    = Join-Path $BT "d8.bat"
$zipal = Join-Path $BT "zipalign.exe"
$sig   = Join-Path $BT "apksigner.bat"
$java  = Join-Path $JdkDir "bin/java.exe"
$javac = Join-Path $JdkDir "bin/javac.exe"
$keytool = Join-Path $JdkDir "bin/keytool.exe"
$jar   = Join-Path $JdkDir "bin/jar.exe"

foreach ($t in @($aapt2,$d8,$zipal,$sig,$java,$javac,$keytool,$jar,$AndroidJar)) {
  if (-not (Test-Path $t)) { Write-Host "Missing tool: $t"; exit 1 }
}

function Assert-Ok($step) {
  if ($LASTEXITCODE -ne 0) { Write-Host "$step failed (exit $LASTEXITCODE)"; exit 1 }
}

$Work = Join-Path $env:TEMP ("cc-apk-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Work | Out-Null

# 0) sync the current website into the bundle
$Www = Join-Path $App "assets/www"
if (Test-Path $Www) { Remove-Item -Recurse -Force $Www }
New-Item -ItemType Directory -Force -Path $Www | Out-Null
Copy-Item (Join-Path $Root "*.html") $Www
Copy-Item (Join-Path $Root "manifest.webmanifest") $Www
Copy-Item -Recurse (Join-Path $Root "assets") (Join-Path $Www "assets")

# 1) compile resources
& $aapt2 compile --dir (Join-Path $App "res") -o (Join-Path $Work "compiled.flata")
Assert-Ok "aapt2 compile"

# 2) link resources + manifest + assets (-A puts the site at assets/www/ inside the APK)
$Gen = Join-Path $Work "gen"
New-Item -ItemType Directory -Force -Path $Gen | Out-Null
& $aapt2 link `
  -o (Join-Path $Work "base-unsigned.apk") `
  -I $AndroidJar `
  --manifest (Join-Path $App "AndroidManifest.xml") `
  -R (Join-Path $Work "compiled.flata") `
  -A (Join-Path $App "assets") `
  --java $Gen `
  --auto-add-overlay
Assert-Ok "aapt2 link"

# 3) compile java (+ generated R.java)
$Classes = Join-Path $Work "classes"
New-Item -ItemType Directory -Force -Path $Classes | Out-Null
$Sources = @(Get-ChildItem (Join-Path $App "src") -Recurse -Filter *.java | ForEach-Object FullName)
$Sources += @(Get-ChildItem $Gen -Recurse -Filter *.java | ForEach-Object FullName)
& $javac -encoding UTF-8 -source 1.8 -target 1.8 -nowarn -classpath $AndroidJar -d $Classes $Sources
Assert-Ok "javac"

# 4) dex
& $d8 --release --min-api 24 --lib $AndroidJar --output $Work (Get-ChildItem $Classes -Recurse -Filter *.class | ForEach-Object FullName)
Assert-Ok "d8"

# 5) add classes.dex to apk (jar = standard zip tool)
Push-Location $Work
& $jar uf base-unsigned.apk classes.dex
Pop-Location
Assert-Ok "jar"

# 6) zipalign
$Aligned = Join-Path $Work "aligned.apk"
& $zipal -f 4 (Join-Path $Work "base-unsigned.apk") $Aligned
Assert-Ok "zipalign"

# 7) persistent signing key + sign
if (-not (Test-Path $KeyStore)) {
  New-Item -ItemType Directory -Force -Path (Split-Path $KeyStore) | Out-Null
  & $keytool -genkeypair -keystore $KeyStore -storepass $KeyPass -alias courtconnect -keypass $KeyPass -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=CourtConnect,O=CourtConnect,C=IN" | Out-Null
  Assert-Ok "keytool"
  Write-Host "Created signing key: $KeyStore  (back it up - every future update must be signed with it)"
}
$OutAbs = Join-Path $Root $OutApk
New-Item -ItemType Directory -Force -Path (Split-Path $OutAbs) | Out-Null
& $sig sign --ks $KeyStore --ks-key-alias courtconnect --ks-pass "pass:$KeyPass" --key-pass "pass:$KeyPass" --out $OutAbs $Aligned
Assert-Ok "apksigner"
Remove-Item -Force -ErrorAction SilentlyContinue ($OutAbs + ".idsig")

$size = (Get-Item $OutAbs).Length
Write-Host "APK ready: $OutAbs ($size bytes)"
Remove-Item -Recurse -Force $Work
