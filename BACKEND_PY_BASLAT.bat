@echo off
title Dijital Yonetim - FastAPI Backend
echo =======================================================
echo    DIJITAL YONETIM SISTEMI - FastAPI (Python)
echo =======================================================
echo.
echo Bu pencereyi kapatmayin. Sunucu arka planda calisiyor...
echo.

:: Python yüklü mü kontrol et
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [HATA] Python yuklu degil veya PATH'e eklenmemis!
    echo Lutfen Python 3.13 yukleyin.
    pause
    exit /b
)

:: backend_py klasörüne gir
cd backend_py

:: Gerekli kütüphanelerin yüklü olduğundan emin ol
echo Kutuphaneler kontrol ediliyor... (Bu islem kisa surecektir)
py -m pip install -r requirements.txt >nul 2>&1

:: Sunucuyu başlat
echo.
echo [BASARILI] Sunucu baslatiliyor... (http://localhost:8000)
echo.
py -m uvicorn main:app --port 8000 --reload

pause
