# Dashboard Web Server для Windows
# Автоматический запуск Python сервера

$host.UI.RawUI.WindowTitle = "Dashboard Server"

# Получаем путь к корневой папке проекта (на уровень выше от server/)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath
Set-Location $projectPath

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   DASHBOARD WEB SERVER" -ForegroundColor White
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Папка проекта: $projectPath" -ForegroundColor Yellow
Write-Host "🚀 Запуск сервера..." -ForegroundColor Green
Write-Host ""

# Проверяем наличие Python
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if (-not $pythonCmd) {
    Write-Host "❌ Python не найден!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Python с официального сайта:" -ForegroundColor Yellow
    Write-Host "https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "При установке обязательно отметьте:" -ForegroundColor Yellow
    Write-Host "☑ Add Python to PATH" -ForegroundColor White
    Write-Host ""
    Write-Host "Нажмите любую клавишу для выхода..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "✅ Python найден: $pythonCmd" -ForegroundColor Green
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "📍 Ваш Dashboard доступен по адресу:" -ForegroundColor White
Write-Host "   http://localhost:8000/" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Устанавливаем обработчик Ctrl+C
[Console]::TreatControlCAsInput = $false
$Global:StopRequested = $false

# Обработчик прерывания
$Handler = {
    $Global:StopRequested = $true
    Write-Host ""
    Write-Host "🛑 Получен сигнал остановки..." -ForegroundColor Yellow
}

# Регистрируем обработчик
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $Handler

# Основной цикл с корректной обработкой исключений
while (-not $Global:StopRequested) {
    try {
        Write-Host "🌐 Запуск HTTP сервера на порту 8000..." -ForegroundColor Green
        
        # Запускаем Python сервер
        $process = Start-Process -FilePath $pythonCmd -ArgumentList "-m", "http.server", "8000", "--bind", "0.0.0.0" -NoNewWindow -PassThru
        
        # Ожидаем завершения процесса или сигнала остановки
        while (-not $process.HasExited -and -not $Global:StopRequested) {
            Start-Sleep -Milliseconds 500
        }
        
        # Если процесс еще запущен, завершаем его
        if (-not $process.HasExited) {
            $process.Kill()
            $process.WaitForExit(5000)
        }
        
        if ($Global:StopRequested) {
            Write-Host "✅ Сервер остановлен по запросу пользователя" -ForegroundColor Green
            break
        }
        
    } catch {
        Write-Host ""
        Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        
        if (-not $Global:StopRequested) {
            Write-Host "⚠️  Перезапуск через 5 секунд..." -ForegroundColor Yellow
            Write-Host "   (Нажмите Ctrl+C для остановки)" -ForegroundColor Gray
            
            # Ожидание с возможностью прерывания
            for ($i = 5; $i -gt 0 -and -not $Global:StopRequested; $i--) {
                Start-Sleep -Seconds 1
            }
        }
    }
}

Write-Host ""
Write-Host "🏁 Сервер завершен" -ForegroundColor Cyan