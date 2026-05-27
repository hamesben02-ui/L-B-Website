param([string]$Message = "")

$source = "C:\Users\User\OneDrive\Desktop\Ad Planner\L&B Website"
$dest   = "C:\Projects\L-B-Website"

$syncExtensions = @("*.html","*.css","*.js","*.json","*.txt","*.xml","*.gs","*.mjs")

foreach ($ext in $syncExtensions) {
    Get-ChildItem -Path $source -Filter $ext -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination (Join-Path $dest $_.Name) -Force
    }
}

$gitStatus = git -C $dest status --porcelain
if (-not $gitStatus) {
    Write-Host "Nothing to deploy — working tree is clean." -ForegroundColor Yellow
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
if ($Message) {
    $commitMsg = $Message
} else {
    $commitMsg = "Deploy website updates [$timestamp]"
}

git -C $dest add .
git -C $dest commit -m $commitMsg
git -C $dest push origin main

Write-Host ""
Write-Host "Deployed to Vercel. Live in ~30 seconds." -ForegroundColor Green
