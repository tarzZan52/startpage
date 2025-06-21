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
set "PYTHON_CMD="
where python >nul 2>&1
if %errorlevel% equ 0 set "PYTHON_CMD=python"
if "%PYTHON_CMD%"=="" (
    where python3 >nul 2>&1
    if %errorlevel% equ 0 set "PYTHON_CMD=python3"
)
if "%PYTHON_CMD%"=="" (
    where py >nul 2>&1
    if %errorlevel% equ 0 set "PYTHON_CMD=py"
)

if "%PYTHON_CMD%"=="" (
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

echo ✅ Python найден: %PYTHON_CMD%
echo.

:: Получаем путь к проекту (на уровень выше от server/)
set "SCRIPT_PATH=%~dp0"
set "SCRIPT_PATH=%SCRIPT_PATH:~0,-1%"
for %%i in ("%SCRIPT_PATH%") do set "PROJECT_PATH=%%~dpi"
set "PROJECT_PATH=%PROJECT_PATH:~0,-1%"

echo 📁 Путь к проекту: "%PROJECT_PATH%"
echo.

:: Создаем PowerShell скрипт для сервера
echo 📝 Создание сервера...
(
echo # Dashboard Web Server
echo $host.UI.RawUI.WindowTitle = "Dashboard Server"
echo.
echo # Получаем путь к корневой папке проекта
echo $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
echo $projectPath = Split-Path -Parent $scriptPath
echo Set-Location $projectPath
echo.
echo Write-Host "====================================" -ForegroundColor Cyan
echo Write-Host "   DASHBOARD WEB SERVER" -ForegroundColor White
echo Write-Host "====================================" -ForegroundColor Cyan
echo Write-Host ""
echo Write-Host "📁 Папка проекта: $projectPath" -ForegroundColor Yellow
echo Write-Host "🚀 Запуск сервера..." -ForegroundColor Green
echo Write-Host ""
echo.
echo # Проверяем наличие Python
echo $pythonCmd = $null
echo if ^(Get-Command python -ErrorAction SilentlyContinue^) {
echo     $pythonCmd = "python"
echo } elseif ^(Get-Command python3 -ErrorAction SilentlyContinue^) {
echo     $pythonCmd = "python3"
echo } elseif ^(Get-Command py -ErrorAction SilentlyContinue^) {
echo     $pythonCmd = "py"
echo }
echo.
echo if ^(-not $pythonCmd^) {
echo     Write-Host "❌ Python не найден!" -ForegroundColor Red
echo     Write-Host "Установите Python с https://www.python.org/downloads/" -ForegroundColor Yellow
echo     exit
echo }
echo.
echo Write-Host "✅ Python найден: $pythonCmd" -ForegroundColor Green
echo Write-Host ""
echo Write-Host "====================================" -ForegroundColor Cyan
echo Write-Host "📍 Ваш Dashboard доступен по адресу:" -ForegroundColor White
echo Write-Host "   http://localhost:8000/" -ForegroundColor Green
echo Write-Host "====================================" -ForegroundColor Cyan
echo Write-Host ""
echo Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
echo Write-Host ""
echo.
echo # Устанавливаем обработчик Ctrl+C
echo [Console]::TreatControlCAsInput = $false
echo $Global:StopRequested = $false
echo.
echo # Обработчик прерывания
echo $Handler = {
echo     $Global:StopRequested = $true
echo     Write-Host ""
echo     Write-Host "🛑 Получен сигнал остановки..." -ForegroundColor Yellow
echo }
echo.
echo # Основной цикл с корректной обработкой исключений
echo while ^(-not $Global:StopRequested^) {
echo     try {
echo         Write-Host "🌐 Запуск HTTP сервера на порту 8000..." -ForegroundColor Green
echo         
echo         # Запускаем Python сервер
echo         $process = Start-Process -FilePath $pythonCmd -ArgumentList "-m", "http.server", "8000", "--bind", "0.0.0.0" -NoNewWindow -PassThru
echo         
echo         # Ожидаем завершения процесса или сигнала остановки
echo         while ^(-not $process.HasExited -and -not $Global:StopRequested^) {
echo             Start-Sleep -Milliseconds 500
echo         }
echo         
echo         # Если процесс еще запущен, завершаем его
echo         if ^(-not $process.HasExited^) {
echo             $process.Kill^(^)
echo             $process.WaitForExit^(5000^)
echo         }
echo         
echo         if ^($Global:StopRequested^) {
echo             Write-Host "✅ Сервер остановлен по запросу пользователя" -ForegroundColor Green
echo             break
echo         }
echo         
echo     } catch {
echo         Write-Host ""
echo         Write-Host "❌ Ошибка: $^($_.Exception.Message^)" -ForegroundColor Red
echo         
echo         if ^(-not $Global:StopRequested^) {
echo             Write-Host "⚠️  Перезапуск через 5 секунд..." -ForegroundColor Yellow
echo             Write-Host "   ^(Нажмите Ctrl+C для остановки^)" -ForegroundColor Gray
echo             
echo             # Ожидание с возможностью прерывания
echo             for ^($i = 5; $i -gt 0 -and -not $Global:StopRequested; $i--^) {
echo                 Start-Sleep -Seconds 1
echo             }
echo         }
echo     }
echo }
echo.
echo Write-Host ""
echo Write-Host "🏁 Сервер завершен" -ForegroundColor Cyan
) > "%SCRIPT_PATH%\start-dashboard.ps1"

:: Создаем VBS скрипт для скрытого запуска
echo 📝 Создание автозапуска...
(
echo Set objShell = CreateObject^("WScript.Shell"^)
echo objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File """%SCRIPT_PATH%\start-dashboard.ps1"""", 0, False
) > "%PROJECT_PATH%\dashboard-hidden.vbs"

:: Удаляем старую задачу если есть
schtasks /delete /tn "DashboardWebServer" /f >nul 2>&1

:: Создаем новую задачу в планировщике
echo 📝 Добавление в автозагрузку Windows...
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
    timeout /t 5 /nobreak >nul
    
    cls
    color 0A
    echo ════════════════════════════════════════════
    echo     ✅ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!
    echo ════════════════════════════════════════════
    echo.
    echo 🎉 Ваш Dashboard теперь:
    echo    • Запускается автоматически при входе в Windows
    echo    • Доступен по адресу: http://localhost:8000/
    echo    • Работает в фоновом режиме
    echo.
    echo 💡 Полезные команды:
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
    echo Код ошибки: %errorlevel%
    echo.
    pause
)

echo.
pause