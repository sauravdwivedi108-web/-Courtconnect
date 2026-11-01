# ============================================================
# CourtConnect — Android APK builder (no Gradle / Android Studio)
# Usage:
#   powershell -File tools/build-apk.ps1 `n#       -JdkDir C:\...\jdk-17 `n#       -SdkDir C:\...\android-sdk `n#       -AppUrl https://... `n#       -OutApk downloads\courtconnect-v1.0.apk
# ============================================================
param(
  [string]$JdkDir = $env:CC_JDK,
  [string]$SdkDir = $env:CC_SDK,
  [string]$AppUrl  = "https://instant-koto-4cqjp8g.tmp.now",
  [string]$OutApk = "downloads/courtconnect-v1.0.apk"
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

$Work = Join-Path $env:TEMP ("cc-apk-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $Work | Out-Null

# 0) pin app URL + version
(Get-Content (Join-Path $App "res/values/strings.xml") -Raw) -replace '(<string name="app_url">)[^<]*(</string>)', ('${1}' + $AppUrl + '${2}') | Set-Content (Join-Path $App "res/values/strings.xml") -NoNewline

# 1) compile resources
& $aapt2 compile --dir (Join-Path $App "res") -o (Join-Path $Work "compiled.flata")

# 2) link resources + manifest (also emit R.java)
$Gen = Join-Path $Work "gen"
New-Item -ItemType Directory -Force -Path $Gen | Out-Null
& $aapt2 link `
  -o (Join-Path $Work "base-unsigned.apk") `
  -I $AndroidJar `
  --manifest (Join-Path $App "AndroidManifest.xml") `
  -R (Join-Path $Work "compiled.flata") `
  --java $Gen `
  --auto-add-overlay

# 3) compile java (+ generated R.java)
$Classes = Join-Path $Work "classes"
New-Item -ItemType Directory -Force -Path $Classes | Out-Null
$Sources = @(Get-ChildItem (Join-Path $App "src") -Recurse -Filter *.java | ForEach-Object FullName)
$Sources += @(Get-ChildItem $Gen -Recurse -Filter *.java | ForEach-Object FullName)
& $javac -encoding UTF-8 -source 1.8 -target 1.8 -classpath $AndroidJar -d $Classes $Sources

# 4) dex
& $d8 --release --lib $AndroidJar --output $Work (Get-ChildItem $Classes -Recurse -Filter *.class | ForEach-Object FullName)

# 5) add classes.dex to apk (jar = standard zip tool)
Push-Location $Work
& $jar uf base-unsigned.apk classes.dex
Pop-Location

# 6) zipalign
$Aligned = Join-Path $Work "aligned.apk"
& $zipal -f 4 (Join-Path $Work "base-unsigned.apk") $Aligned

# 7) debug keystore + sign
$KS = Join-Path $Work "debug.keystore"
if (-not (Test-Path $KS)) {
  & $keytool -genkeypair -v -keystore $KS -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" | Out-Null
}
$OutAbs = Join-Path $Root $OutApk
New-Item -ItemType Directory -Force -Path (Split-Path $OutAbs) | Out-Null
& $sig sign --ks $KS --ks-pass pass:android --key-pass pass:android --out $OutAbs $Aligned

$size = (Get-Item $OutAbs).Length
Write-Host "APK ready: $OutAbs ($size bytes)"
Remove-Item -Recurse -Force $Work
