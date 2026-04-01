@echo off
chcp 65001 >nul
title Codelens - Iniciar
cd /d "%~dp0"

:: Encerra processos antigos nas portas usadas pelo app
for %%P in (5173 3001) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    taskkill /PID %%I /F >nul 2>&1
  )
)

:: Servidor de email (backup por email) - roda em segundo plano
start "Codelens Email" cmd /k "cd /d "%~dp0" && npm run email-server"

:: Servidor do site (Vite)
start "Codelens Servidor" cmd /k "cd /d "%~dp0" && npm run dev"

:: Espera os servidores subirem antes de abrir o navegador
timeout /t 5 /nobreak >nul

:: Abre o site no navegador padrao
start "" "http://localhost:5173"

echo.
echo Navegador aberto.
echo - Site: janela "Codelens Servidor"
echo - Email (backup): janela "Codelens Email"
echo Para encerrar, feche as duas janelas.
timeout /t 2 >nul
