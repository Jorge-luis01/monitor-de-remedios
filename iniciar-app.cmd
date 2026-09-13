@echo off
setlocal
cd /d "%~dp0frontend-react"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js 24 e tente novamente.
  pause
  exit /b 1
)
if not exist node_modules\vite\bin\vite.js (
  call npm.cmd ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Dose Certa: http://localhost:5173
echo Mantenha esta janela aberta. Para encerrar, pressione Ctrl+C.
call npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort --open
if errorlevel 1 pause
