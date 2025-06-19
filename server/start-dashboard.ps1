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

# Бесконечный цикл для автоматического перезапуска
while ($true) {
    try {
        # Запускаем Python сервер
        & $pythonCmd -m http.server 8000 --bind 0.0.0.0
    }
    catch {
        Write-Host ""
        Write-Host "⚠️  Сервер остановлен. Перезапуск через 5 секунд..." -ForegroundColor Yellow
        Write-Host "   (Нажмите Ctrl+C дважды для полной остановки)" -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}