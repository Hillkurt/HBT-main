@echo off
echo.
echo  ====================================================
echo   DİJİTAL YÖNETİM SİSTEMİ - BACKEND BAŞLATICI
echo  ====================================================
echo.
echo  Backend sunucusu başlatılıyor...
echo  Sunucu: http://localhost:5000
echo.
cd /d "%~dp0backend"
node server.js
pause
