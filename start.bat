@echo off
REM 💝 SoulTalk - Native iOS App Setup (Windows)

echo 💝 SoulTalk - Native iOS App Setup
echo ==================================

REM Перевірка Node.js
echo.
echo 1️⃣  Перевірка Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не встановлено. Завантажте з https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo ✅ Node.js встановлено

REM Перевірка npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm не встановлено
    pause
    exit /b 1
)
npm --version
echo ✅ npm встановлено

REM Встановлення залежностей
echo.
echo 2️⃣  Перевірка залежностей...
if not exist "node_modules" (
    echo Встановлення залежностей...
    call npm install
) else (
    echo ✅ Залежності вже встановлені
)

REM Очистка кешу
echo.
echo 3️⃣  Очистка кешу...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
)

REM Запуск Expo
echo.
echo 4️⃣  Запуск Expo Dev Server...
echo.
echo 📱 Інструкції:
echo    • Натисніть 'i' для iOS Simulator (потрібен Mac)
echo    • Натисніть 'a' для Android Emulator
echo    • Скануйте QR код для фізичного пристрою
echo.
echo 🧪 Для тестування на iPad Air (M3):
echo    • Відкрийте Xcode Simulator (Mac)
echo    • Виберіть iPad Air (5th generation)
echo    • Натисніть 'i' в терміналі
echo.

call npx expo start -c

echo.
echo 👋 Дякуємо за використання SoulTalk!
pause
