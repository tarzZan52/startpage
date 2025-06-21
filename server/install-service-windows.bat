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

:: Проверяем существование index.html
if not exist "%PROJECT_PATH%\index.html" (
    color 0C
    echo.
    echo ❌ ОШИБКА: Файл index.html не найден!
    echo Убедитесь, что вы запускаете скрипт из правильной папки проекта.
    echo Ожидаемый путь: "%PROJECT_PATH%\index.html"
    echo.
    pause
    exit /b 1
)

echo.

:: Создаем PowerShell скрипт для сервера
echo 📝 Создание сервера...
set "PS_SCRIPT=%SCRIPT_PATH%\start-dashboard.ps1"

:: Создаем файл построчно, чтобы избежать проблем с экранированием
echo # Dashboard Web Server > "%PS_SCRIPT%"
echo $host.UI.RawUI.WindowTitle = "Dashboard Server" >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo # Получаем путь к корневой папке проекта >> "%PS_SCRIPT%"
echo $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path >> "%PS_SCRIPT%"
echo $projectPath = Split-Path -Parent $scriptPath >> "%PS_SCRIPT%"
echo Set-Location $projectPath >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo Write-Host "====================================" -ForegroundColor Cyan >> "%PS_SCRIPT%"
echo Write-Host "   DASHBOARD WEB SERVER" -ForegroundColor White >> "%PS_SCRIPT%"
echo Write-Host "====================================" -ForegroundColor Cyan >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo Write-Host "📁 Папка проекта: $projectPath" -ForegroundColor Yellow >> "%PS_SCRIPT%"
echo Write-Host "🚀 Запуск сервера..." -ForegroundColor Green >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo # Проверяем наличие Python >> "%PS_SCRIPT%"
echo $pythonCmd = $null >> "%PS_SCRIPT%"
echo if (Get-Command python -ErrorAction SilentlyContinue) { >> "%PS_SCRIPT%"
echo     $pythonCmd = "python" >> "%PS_SCRIPT%"
echo } elseif (Get-Command python3 -ErrorAction SilentlyContinue) { >> "%PS_SCRIPT%"
echo     $pythonCmd = "python3" >> "%PS_SCRIPT%"
echo } elseif (Get-Command py -ErrorAction SilentlyContinue) { >> "%PS_SCRIPT%"
echo     $pythonCmd = "py" >> "%PS_SCRIPT%"
echo } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo if (-not $pythonCmd) { >> "%PS_SCRIPT%"
echo     Write-Host "❌ Python не найден!" -ForegroundColor Red >> "%PS_SCRIPT%"
echo     Write-Host "Установите Python с https://www.python.org/downloads/" -ForegroundColor Yellow >> "%PS_SCRIPT%"
echo     exit >> "%PS_SCRIPT%"
echo } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo Write-Host "✅ Python найден: $pythonCmd" -ForegroundColor Green >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo Write-Host "====================================" -ForegroundColor Cyan >> "%PS_SCRIPT%"
echo Write-Host "📍 Ваш Dashboard доступен по адресу:" -ForegroundColor White >> "%PS_SCRIPT%"
echo Write-Host "   http://localhost:8000/" -ForegroundColor Green >> "%PS_SCRIPT%"
echo Write-Host "====================================" -ForegroundColor Cyan >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo # Устанавливаем обработчик Ctrl+C >> "%PS_SCRIPT%"
echo [Console]::TreatControlCAsInput = $false >> "%PS_SCRIPT%"
echo $Global:StopRequested = $false >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo # Обработчик прерывания >> "%PS_SCRIPT%"
echo $Handler = { >> "%PS_SCRIPT%"
echo     $Global:StopRequested = $true >> "%PS_SCRIPT%"
echo     Write-Host "" >> "%PS_SCRIPT%"
echo     Write-Host "🛑 Получен сигнал остановки..." -ForegroundColor Yellow >> "%PS_SCRIPT%"
echo } >> "%PS_SCRIPT%"
echo Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $Handler >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo # Основной цикл с корректной обработкой исключений >> "%PS_SCRIPT%"
echo while (-not $Global:StopRequested) { >> "%PS_SCRIPT%"
echo     try { >> "%PS_SCRIPT%"
echo         Write-Host "🌐 Запуск HTTP сервера на порту 8000..." -ForegroundColor Green >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo         # Запускаем Python сервер >> "%PS_SCRIPT%"
echo         $process = Start-Process -FilePath $pythonCmd -ArgumentList "-m", "http.server", "8000", "--bind", "0.0.0.0" -NoNewWindow -PassThru >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo         # Ожидаем завершения процесса или сигнала остановки >> "%PS_SCRIPT%"
echo         while (-not $process.HasExited -and -not $Global:StopRequested) { >> "%PS_SCRIPT%"
echo             Start-Sleep -Milliseconds 500 >> "%PS_SCRIPT%"
echo         } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo         # Если процесс еще запущен, завершаем его >> "%PS_SCRIPT%"
echo         if (-not $process.HasExited) { >> "%PS_SCRIPT%"
echo             $process.Kill() >> "%PS_SCRIPT%"
echo             $process.WaitForExit(5000) >> "%PS_SCRIPT%"
echo         } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo         if ($Global:StopRequested) { >> "%PS_SCRIPT%"
echo             Write-Host "✅ Сервер остановлен по запросу пользователя" -ForegroundColor Green >> "%PS_SCRIPT%"
echo             break >> "%PS_SCRIPT%"
echo         } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo     } catch { >> "%PS_SCRIPT%"
echo         Write-Host "" >> "%PS_SCRIPT%"
echo         Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"        
echo         if (-not $Global:StopRequested) { >> "%PS_SCRIPT%"
echo             Write-Host "⚠️  Перезапуск через 5 секунд..." -ForegroundColor Yellow >> "%PS_SCRIPT%"
echo             Write-Host "   (Нажмите Ctrl+C для остановки)" -ForegroundColor Gray >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"            
echo             # Ожидание с возможностью прерывания >> "%PS_SCRIPT%"
echo             for ($i = 5; $i -gt 0 -and -not $Global:StopRequested; $i--) { >> "%PS_SCRIPT%"
echo                 Start-Sleep -Seconds 1 >> "%PS_SCRIPT%"
echo             } >> "%PS_SCRIPT%"
echo         } >> "%PS_SCRIPT%"
echo     } >> "%PS_SCRIPT%"
echo } >> "%PS_SCRIPT%"
echo. >> "%PS_SCRIPT%"
echo Write-Host "" >> "%PS_SCRIPT%"
echo Write-Host "🏁 Сервер завершен" -ForegroundColor Cyan >> "%PS_SCRIPT%"

:: Создаем VBS скрипт для скрытого запуска
echo 📝 Создание автозапуска...
set "VBS_SCRIPT=%PROJECT_PATH%\dashboard-hidden.vbs"

echo Set objShell = CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo objShell.Run "powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File ""%SCRIPT_PATH%\start-dashboard.ps1""", 0, False >> "%VBS_SCRIPT%"

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