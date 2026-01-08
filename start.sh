#!/bin/bash

# 🚀 SoulTalk - Швидкий запуск

echo "💝 SoulTalk - Native iOS App Setup"
echo "=================================="

# Перевірка Node.js
echo ""
echo "1️⃣  Перевірка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено. Завантажте з https://nodejs.org/"
    exit 1
fi
echo "✅ Node version: $(node --version)"

# Перевірка npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не встановлено"
    exit 1
fi
echo "✅ npm version: $(npm --version)"

# Перехід в директорію проекту
cd "$(dirname "$0")"

# Встановлення залежностей (якщо потрібно)
if [ ! -d "node_modules" ]; then
    echo ""
    echo "2️⃣  Встановлення залежностей..."
    npm install
else
    echo ""
    echo "2️⃣  ✅ Залежності вже встановлені"
fi

# Очистка кешу
echo ""
echo "3️⃣  Очистка кешу..."
rm -rf node_modules/.cache

# Запуск Expo
echo ""
echo "4️⃣  Запуск Expo Dev Server..."
echo ""
echo "📱 Інструкції:"
echo "   • Натисніть 'i' для iOS Simulator"
echo "   • Натисніть 'a' для Android Emulator"
echo "   • Скануйте QR код для фізичного пристрою"
echo ""
echo "🧪 Для тестування на iPad Air (M3):"
echo "   • Відкрийте Xcode Simulator"
echo "   • Виберіть iPad Air (5th generation)"
echo "   • Натисніть 'i' в терміналі"
echo ""

npx expo start -c

# Після завершення
echo ""
echo "👋 Дякуємо за використання SoulTalk!"
