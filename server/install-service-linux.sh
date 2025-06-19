#!/bin/bash

# Скрипт установки Dashboard сервиса для Linux
# Работает с Python 3 (обычно предустановлен в Linux)

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 Установка Dashboard сервиса..."

# Проверяем наличие Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 не найден!${NC}"
    echo "Установите Python 3:"
    echo "  Ubuntu/Debian: sudo apt install python3"
    echo "  Fedora: sudo dnf install python3"
    echo "  Arch: sudo pacman -S python"
    exit 1
fi

# Получаем путь к корневой директории проекта (на уровень выше)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
USERNAME=$(whoami)

echo -e "${YELLOW}📁 Путь к проекту: $PROJECT_PATH${NC}"

# Создаем файл сервиса
echo "[Unit]
Description=Personal Dashboard Web Server
After=network.target

[Service]
Type=simple
User=$USERNAME
WorkingDirectory=$PROJECT_PATH
ExecStart=/usr/bin/python3 -m http.server 8000 --bind 0.0.0.0
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target" > /tmp/dashboard.service

# Копируем файл сервиса в системную директорию
sudo cp /tmp/dashboard.service /etc/systemd/system/dashboard.service
rm /tmp/dashboard.service

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем автозапуск
sudo systemctl enable dashboard.service

# Запускаем сервис
sudo systemctl start dashboard.service

# Ждем запуска
sleep 2

# Проверяем статус
if sudo systemctl is-active --quiet dashboard.service; then
    echo -e "${GREEN}✅ Сервис успешно установлен и запущен!${NC}"
    echo -e "${GREEN}📍 Ваш дашборд доступен по адресу: http://localhost:8000/${NC}"
    echo -e "${GREEN}📍 Или по IP: http://0.0.0.0:8000/${NC}"
    echo ""
    echo "Полезные команды:"
    echo "  sudo systemctl status dashboard.service  - проверить статус"
    echo "  sudo systemctl stop dashboard.service    - остановить"
    echo "  sudo systemctl restart dashboard.service - перезапустить"
    echo "  sudo journalctl -u dashboard.service -f  - просмотр логов"
    echo ""
    echo "Для удаления используйте: ./uninstall-service-linux.sh"
else
    echo -e "${RED}❌ Ошибка при запуске сервиса${NC}"
    echo "Проверьте логи:"
    sudo systemctl status dashboard.service
fi