# Automatychnyi build i submit dlia App Store
Write-Host "Zapusk iOS build dlia SoulTalk..." -ForegroundColor Green

# Perekhid v direktoriiu proektu
Set-Location "C:\Users\User\Documents\GitHub\SoulTalkApp"

# Zapusk build
Write-Host "`nStvorennia production build..." -ForegroundColor Cyan
eas build --platform ios --profile production

# Pislia zavershennia build - submit
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBuild uspishnyi! Zavantazhennia v App Store..." -ForegroundColor Green
    eas submit --platform ios --latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nHotovo! Dodatok zavantazheno v App Store Connect!" -ForegroundColor Green
        Write-Host "Pereidite na https://appstoreconnect.apple.com dlia zavershennia submission" -ForegroundColor Yellow
    } else {
        Write-Host "`nPomylka pry submit. Sprobuite vruchnu: eas submit --platform ios" -ForegroundColor Red
    }
} else {
    Write-Host "`nBuild failed. Perevirte lohy na https://expo.dev" -ForegroundColor Red
}
