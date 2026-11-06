@echo off
setlocal EnableExtensions
REM GymSync backend startup helper (Windows)
REM Uses portable Node 20 if available; falls back to system Node.
if exist "%LOCALAPPDATA%\node20\node.exe" set "PATH=%LOCALAPPDATA%\node20;%PATH%"
cd /d "%~dp0"
if not exist ".env" copy ".env.example" ".env" >nul
echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (echo npm install failed; exit /b 1)
echo [2/3] Building TypeScript...
call npm run build
if errorlevel 1 (echo build failed; exit /b 1)
echo [3/3] Starting server...
node dist\main.js
pause