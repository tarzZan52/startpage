@echo off
chcp 65001 >nul

cls
echo ════════════════════════════════════════════
echo     УДАЛЕНИЕ DASHBOARD АВТОЗАПУСКА
echo ════════════════════════════════════════════
echo.

:: Останавливаем задачу
echo 🛑 Остановка сервера...
schtasks /end /tn "DashboardWebServer" >nul 2>&1

:: Удаляем задачу из планировщика
echo 🗑️  Удаление из автозагрузки...
schtasks /delete /tn "DashboardWebServer" /f >nul 2>&1

:: Получаем пути к файлам
set "SCRIPT_PATH=%~dp0"
set "SCRIPT_PATH=%SCRIPT_PATH:~0,-1%"
for %%i in ("%SCRIPT_PATH%") do set "PROJECT_PATH=%%~dpi"
set "PROJECT_PATH=%PROJECT_PATH:~0,-1%"

:: Удаляем вспомогательные файлы
echo 🗑️  Удаление файлов сервера...

:: Удаляем VBS файл
if exist "%PROJECT_PATH%\dashboard-hidden.vbs" (
    del "%PROJECT_PATH%\dashboard-hidden.vbs" >nul 2>&1
    echo ✅ Удален dashboard-hidden.vbs
)

:: Удаляем PowerShell скрипт
if exist "%SCRIPT_PATH%\start-dashboard.ps1" (
    del "%SCRIPT_PATH%\start-dashboard.ps1" >nul 2>&1
    echo ✅ Удален start-dashboard.ps1
)

:: Завершаем процессы Python (если запущены)
echo 🛑 Остановка Python серверов...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im python3.exe >nul 2>&1
taskkill /f /im py.exe >nul 2>&1

echo.
color 0A
echo ════════════════════════════════════════════
echo     ✅ АВТОЗАПУСК УСПЕШНО УДАЛЕН!
echo ════════════════════════════════════════════
echo.
echo 📝 Dashboard больше не будет запускаться автоматически.
echo.
echo 🚀 Для ручного запуска:
echo    1. Откройте командную строку в папке проекта
echo    2. Выполните: python -m http.server 8000
echo    3. Откройте http://localhost:8000/ в браузере
echo.
echo 💡 Для повторной установки запустите:
echo    install-service-windows.bat
echo.
pause