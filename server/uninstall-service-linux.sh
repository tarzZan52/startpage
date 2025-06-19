#!/bin/bash

# Скрипт удаления Dashboard сервиса

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🗑️  Удаление Dashboard сервиса..."

# Останавливаем сервис
echo "Остановка сервиса..."
sudo systemctl stop dashboard.service

# Отключаем автозапуск
echo "Отключение автозапуска..."
sudo systemctl disable dashboard.service

# Удаляем файл сервиса
echo "Удаление файлов сервиса..."
sudo rm /etc/systemd/system/dashboard.service

# Перезагружаем systemd
sudo systemctl daemon-reload

echo -e "${GREEN}✅ Сервис успешно удален!${NC}"
echo ""
echo "Dashboard больше не будет запускаться автоматически."
echo "Вы можете запустить его вручную из корневой папки проекта:"
echo "  python3 -m http.server 8000"