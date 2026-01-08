# Автоматичний build і submit для App Store
Write-Host "🚀 Запуск iOS build для SoulTalk..." -ForegroundColor Green

# Перехід в директорію проекту
Set-Location "C:\Users\User\Documents\GitHub\SoulTalkApp"

# Запуск build
Write-Host "`n📦 Створення production build..." -ForegroundColor Cyan
eas build --platform ios --profile production

# Після завершення build - submit
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build успішний! Завантаження в App Store..." -ForegroundColor Green
    eas submit --platform ios --latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 Готово! Додаток завантажено в App Store Connect!" -ForegroundColor Green
        Write-Host "Перейдіть на https://appstoreconnect.apple.com для завершення submission" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Помилка при submit. Спробуйте вручну: eas submit --platform ios" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Build failed. Перевірте логи на https://expo.dev" -ForegroundColor Red
}
