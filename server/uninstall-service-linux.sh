#!/bin/bash

# Скрипт удаления Dashboard сервиса

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "${CYAN}     УДАЛЕНИЕ DASHBOARD АВТОЗАПУСКА${NC}"
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo ""

# Проверяем права sudo
echo -e "${BLUE}🔐 Проверка прав администратора...${NC}"
if ! sudo -n true 2>/dev/null; then
    echo -e "${YELLOW}Для удаления системного сервиса требуются права администратора${NC}"
    echo "Пожалуйста, введите пароль для продолжения..."
    if ! sudo true; then
        echo -e "${RED}❌ Отказано в доступе. Удаление прервано.${NC}"
        exit 1
    fi
fi

# Останавливаем сервис
echo -e "${BLUE}🛑 Остановка сервиса...${NC}"
if sudo systemctl stop dashboard.service 2>/dev/null; then
    echo -e "${GREEN}✅ Сервис остановлен${NC}"
else
    echo -e "${YELLOW}⚠️  Сервис уже был остановлен или не существует${NC}"
fi

# Отключаем автозапуск
echo -e "${BLUE}🔓 Отключение автозапуска...${NC}"
if sudo systemctl disable dashboard.service 2>/dev/null; then
    echo -e "${GREEN}✅ Автозапуск отключен${NC}"
else
    echo -e "${YELLOW}⚠️  Автозапуск уже был отключен${NC}"
fi

# Удаляем файл сервиса
echo -e "${BLUE}🗑️  Удаление файла сервиса...${NC}"
if [[ -f /etc/systemd/system/dashboard.service ]]; then
    if sudo rm -f /etc/systemd/system/dashboard.service; then
        echo -e "${GREEN}✅ Файл сервиса удален${NC}"
    else
        echo -e "${RED}❌ Ошибка удаления файла сервиса${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Файл сервиса не найден${NC}"
fi

# Перезагружаем systemd
echo -e "${BLUE}🔄 Перезагрузка systemd...${NC}"
if sudo systemctl daemon-reload; then
    echo -e "${GREEN}✅ Systemd перезагружен${NC}"
else
    echo -e "${RED}❌ Ошибка перезагрузки systemd${NC}"
fi

# Завершаем процессы Python (если запущены)
echo -e "${BLUE}🛑 Остановка Python серверов...${NC}"
pkill -f "python.*http.server.*8000" 2>/dev/null
pkill -f "python3.*http.server.*8000" 2>/dev/null

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ СЕРВИС УСПЕШНО УДАЛЕН!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Dashboard больше не будет запускаться автоматически.${NC}"
echo ""
echo -e "${CYAN}🚀 Для ручного запуска:${NC}"
echo -e "   1. Перейдите в корневую папку проекта"
echo -e "   2. Выполните: ${YELLOW}python3 -m http.server 8000${NC}"
echo -e "   3. Откройте ${YELLOW}http://localhost:8000/${NC} в браузере"
echo ""
echo -e "${CYAN}💡 Для повторной установки запустите:${NC}"
echo -e "   ${YELLOW}./install-service-linux.sh${NC}"
echo ""