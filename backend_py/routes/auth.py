"""
============================================================
 routes/auth.py — Kimlik Doğrulama Rotaları
 Dijital Yönetim Sistemi — Python FastAPI Backend

 Bu dosya giriş (login) ve çıkış (logout) işlemlerini yönetir.
 Gerçek projede: JWT token doğrulama + refresh token buraya eklenir.
============================================================
"""

import time
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

# Kendi modüllerimizi içe aktar
import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["Kimlik Doğrulama"])


@router.post(
    "/login",
    response_model=schemas.LoginResponse,
    summary="Kullanıcı Girişi",
)
async def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Kullanıcı Giriş Endpoint'i
    """
    # Kullanıcıyı veritabanında ara
    user = crud.get_user_by_username(db, request.username.strip())

    # Kullanıcı bulunamazsa veya şifre eşleşmezse
    if not user or user.password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı."
        )

    # Başarılı girişi log kaydına ekle
    crud.add_log(db, f"{user.name} ({user.role}) sisteme giriş yaptı.")

    safe_user = {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "name": user.name,
        "unit": user.unit,
        "type": user.type,
        "email": user.email,
        "phone": user.phone
    }

    mock_token = f"fastapi-mock-token-{user.id}-{int(time.time())}"

    return schemas.LoginResponse(
        success=True,
        user=safe_user,
        token=mock_token
    )


@router.post(
    "/logout",
    summary="Kullanıcı Çıkışı",
)
async def logout(request: schemas.LogoutRequest, db: Session = Depends(get_db)):
    """
    Kullanıcı Çıkış Endpoint'i
    """
    username = request.username or "Bilinmeyen Kullanıcı"
    crud.add_log(db, f"{username} sistemden çıkış yaptı.")

    return {"success": True, "message": "Başarıyla çıkış yapıldı."}
