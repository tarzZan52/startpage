#!/bin/bash

# Скрипт установки Dashboard сервиса для Linux

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "${CYAN}     УСТАНОВКА DASHBOARD АВТОЗАПУСКА${NC}"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo ""

# Проверяем права sudo
echo -e "${BLUE}🔐 Проверка прав администратора...${NC}"
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}Для установки системного сервиса требуются права администратора${NC}"
    echo "Пожалуйста, введите пароль для продолжения..."
    if ! sudo true; then
        echo -e "${RED}❌ Отказано в доступе. Установка прервана.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Права администратора получены${NC}"
echo ""

# Проверяем наличие Python
echo -e "${BLUE}🔍 Проверка Python...${NC}"
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
fi

if [[ -z "$PYTHON_CMD" ]]; then
    echo -e "${RED}❌ Python не найден!${NC}"
    echo ""
    echo -e "${YELLOW}📌 Установите Python:${NC}"
    echo "   Ubuntu/Debian: sudo apt update && sudo apt install python3"
    echo "   CentOS/RHEL:   sudo yum install python3"
    echo "   Arch Linux:    sudo pacman -S python"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Python найден: $PYTHON_CMD${NC}"
echo ""

# Получаем пути
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📁 Путь к проекту: $PROJECT_PATH${NC}"

# Проверяем существование index.html
if [[ ! -f "$PROJECT_PATH/index.html" ]]; then
    echo -e "${RED}❌ Ошибка: Файл index.html не найден в $PROJECT_PATH${NC}"
    echo "Убедитесь, что вы запускаете скрипт из правильной директории проекта"
    exit 1
fi

echo ""

# Останавливаем и удаляем старый сервис если существует
echo -e "${BLUE}🛑 Очистка предыдущих установок...${NC}"
if sudo systemctl list-unit-files | grep -q "dashboard.service"; then
    sudo systemctl stop dashboard.service 2>/dev/null
    sudo systemctl disable dashboard.service 2>/dev/null
    sudo rm -f /etc/systemd/system/dashboard.service
    sudo systemctl daemon-reload
    echo -e "${GREEN}✅ Предыдущая установка очищена${NC}"
fi

# Создаем файл сервиса
echo -e "${BLUE}📝 Создание системного сервиса...${NC}"
sudo tee /etc/systemd/system/dashboard.service > /dev/null << EOF
[Unit]
Description=Dashboard Web Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_PATH
ExecStart=$PYTHON_CMD -m http.server 8000 --bind 0.0.0.0
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Файл сервиса создан${NC}"
else
    echo -e "${RED}❌ Ошибка создания файла сервиса${NC}"
    exit 1
fi

# Перезагружаем systemd
echo -e "${BLUE}🔄 Перезагрузка systemd...${NC}"
if sudo systemctl daemon-reload; then
    echo -e "${GREEN}✅ Systemd перезагружен${NC}"
else
    echo -e "${RED}❌ Ошибка перезагрузки systemd${NC}"
    exit 1
fi

# Включаем автозапуск
echo -e "${BLUE}🚀 Включение автозапуска...${NC}"
if sudo systemctl enable dashboard.service; then
    echo -e "${GREEN}✅ Автозапуск включен${NC}"
else
    echo -e "${RED}❌ Ошибка включения автозапуска${NC}"
    exit 1
fi

# Запускаем сервис
echo -e "${BLUE}▶️  Запуск сервиса...${NC}"
if sudo systemctl start dashboard.service; then
    echo -e "${GREEN}✅ Сервис запущен${NC}"
else
    echo -e "${RED}❌ Ошибка запуска сервиса${NC}"
    echo ""
    echo -e "${YELLOW}Логи ошибок:${NC}"
    sudo journalctl -u dashboard.service --no-pager -n 10
    exit 1
fi

# Ждем запуска и проверяем статус
echo -e "${BLUE}⏳ Проверка статуса...${NC}"
sleep 3

if sudo systemctl is-active --quiet dashboard.service; then
    STATUS="✅ Запущен"
    STATUS_COLOR="${GREEN}"
else
    STATUS="❌ Ошибка"
    STATUS_COLOR="${RED}"
fi

clear
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}🎉 Ваш Dashboard теперь:${NC}"
echo -e "   • Запускается автоматически при загрузке системы"
echo -e "   • Доступен по адресу: ${YELLOW}http://localhost:8000/${NC}"
echo -e "   • Статус сервиса: ${STATUS_COLOR}${STATUS}${NC}"
echo ""
echo -e "${CYAN}💡 Полезные команды:${NC}"
echo -e "   • Статус:      ${YELLOW}sudo systemctl status dashboard.service${NC}"
echo -e "   • Остановить:  ${YELLOW}sudo systemctl stop dashboard.service${NC}"
echo -e "   • Запустить:   ${YELLOW}sudo systemctl start dashboard.service${NC}"
echo -e "   • Перезапуск:  ${YELLOW}sudo systemctl restart dashboard.service${NC}"
echo -e "   • Логи:        ${YELLOW}sudo journalctl -u dashboard.service -f${NC}"
echo -e "   • Удалить:     ${YELLOW}./uninstall-service-linux.sh${NC}"
echo ""
echo -e "${CYAN}🌐 Откройте браузер и перейдите на:${NC}"
echo -e "   ${YELLOW}http://localhost:8000/${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""

# Предлагаем открыть в браузере
read -p "Открыть Dashboard в браузере сейчас? (y/n): " -n 1 -r
    echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000/
    elif command -v open &> /dev/null; then
        open http://localhost:8000/
else
        echo -e "${YELLOW}Автоматическое открытие браузера недоступно.${NC}"
        echo -e "Откройте вручную: ${YELLOW}http://localhost:8000/${NC}"
    fi
fi