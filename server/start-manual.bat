@echo off
chcp 65001 >nul
title Dashboard Server

:: Переходим в корневую папку проекта
cd /d "%~dp0\.."

:: Запускаем PowerShell скрипт
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-dashboard.ps1"