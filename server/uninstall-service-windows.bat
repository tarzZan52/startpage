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

:: Удаляем задачу
echo 🗑️  Удаление из автозагрузки...
schtasks /delete /tn "DashboardWebServer" /f >nul 2>&1

:: Удаляем вспомогательные файлы
echo 🗑️  Удаление вспомогательных файлов...
if exist "%~dp0..\dashboard-hidden.vbs" (
    del "%~dp0..\dashboard-hidden.vbs" >nul 2>&1
)

echo.
echo ════════════════════════════════════════════
echo     ✅ АВТОЗАПУСК УСПЕШНО УДАЛЕН!
echo ════════════════════════════════════════════
echo.
echo Dashboard больше не будет запускаться автоматически.
echo Вы можете запустить его вручную через start-dashboard.ps1
echo.
pause