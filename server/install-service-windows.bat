@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

cls
echo ════════════════════════════════════════════
echo     УСТАНОВКА DASHBOARD АВТОЗАПУСКА
echo ════════════════════════════════════════════
echo.

:: Проверяем права администратора
net session >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ❌ ОШИБКА: Требуются права администратора!
    echo.
    echo 📌 Как запустить правильно:
    echo    1. Закройте это окно
    echo    2. Нажмите правой кнопкой на этот файл
    echo    3. Выберите "Запуск от имени администратора"
    echo.
    pause
    exit /b 1
)

:: Проверяем наличие Python
echo 🔍 Проверка Python...
where python >nul 2>&1 || where python3 >nul 2>&1 || where py >nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo.
    echo ⚠️  Python не установлен!
    echo.
    echo 📌 Что делать:
    echo    1. Скачайте Python с https://www.python.org/downloads/
    echo    2. При установке ОБЯЗАТЕЛЬНО отметьте галочку:
    echo       ☑ Add Python to PATH
    echo    3. После установки запустите этот файл снова
    echo.
    pause
    exit /b 1
)

echo ✅ Python найден!
echo.

:: Получаем путь к проекту (на уровень выше от server/)
set "SCRIPT_PATH=%~dp0"
set "SCRIPT_PATH=%SCRIPT_PATH:~0,-1%"
for %%i in ("%SCRIPT_PATH%") do set "PROJECT_PATH=%%~dpi"
set "PROJECT_PATH=%PROJECT_PATH:~0,-1%"

echo 📁 Путь к проекту: %PROJECT_PATH%
echo.

:: Создаем VBS скрипт для скрытого запуска
echo 📝 Создание скриптов автозапуска...
echo Set objShell = CreateObject("WScript.Shell") > "%PROJECT_PATH%\dashboard-hidden.vbs"
echo objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""%SCRIPT_PATH%\start-dashboard.ps1""", 0, False >> "%PROJECT_PATH%\dashboard-hidden.vbs"

:: Создаем задачу в планировщике
echo 📝 Добавление в автозагрузку Windows...
echo.

:: Удаляем старую задачу если есть
schtasks /delete /tn "DashboardWebServer" /f >nul 2>&1

:: Создаем новую задачу
schtasks /create /tn "DashboardWebServer" ^
    /tr "\"%PROJECT_PATH%\dashboard-hidden.vbs\"" ^
    /sc onlogon ^
    /ru "%USERNAME%" ^
    /rl highest ^
    /f >nul

if %errorlevel% equ 0 (
    echo ✅ Автозапуск настроен!
    echo.
    echo 🚀 Запускаем сервер...
    schtasks /run /tn "DashboardWebServer" >nul
    
    :: Ждем запуска
    timeout /t 3 /nobreak >nul
    
    cls
    color 0A
    echo ════════════════════════════════════════════
    echo     ✅ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!
    echo ════════════════════════════════════════════
    echo.
    echo 🎉 Ваш Dashboard теперь:
    echo    • Запускается автоматически при входе в Windows
    echo    • Доступен по адресу: http://localhost:8000/
    echo.
    echo 💡 Полезные команды (Win+R, cmd):
    echo    • Остановить:  schtasks /end /tn "DashboardWebServer"
    echo    • Запустить:   schtasks /run /tn "DashboardWebServer"  
    echo    • Удалить:     запустите uninstall-service-windows.bat
    echo.
    echo 🌐 Откройте браузер и перейдите на:
    echo    http://localhost:8000/
    echo.
    echo ════════════════════════════════════════════
    echo.
    
    :: Предлагаем открыть в браузере
    choice /C YN /M "Открыть Dashboard в браузере сейчас?"
    if !errorlevel! equ 1 (
        start http://localhost:8000/
    )
) else (
    color 0C
    echo ❌ Ошибка при создании задачи автозапуска!
    echo.
    pause
)

echo.
pause