"""
============================================================
 routes/auth.py — Kimlik Doğrulama Rotaları
 Dijital Yönetim Sistemi — Python FastAPI Backend

 Bu dosya giriş (login) ve çıkış (logout) işlemlerini yönetir.
 Şifreler bcrypt algoritmasıyla hashlenerek güvenli saklanır.
 Gerçek projede: JWT token doğrulama + refresh token buraya eklenir.
============================================================
"""

import time
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

# Kendi modüllerimizi içe aktar
import schemas
import crud
from database import get_db

# Bcrypt şifre hashleme ayarı
# Bu sayede şifreler veritabanında düz metin yerine hash olarak saklanır
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/api/auth", tags=["Kimlik Doğrulama"])


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Kullanıcının girdiği şifreyi, veritabanındaki hashlenmiş şifreyle karşılaştırır.
    Eğer veritabanında eski (düz metin) şifre varsa, onu da kabul eder
    ve otomatik olarak hashlenmiş versiyonuyla günceller.
    """
    # Önce bcrypt hash ile karşılaştır
    try:
        if pwd_context.verify(plain_password, stored_password):
            return True
    except Exception:
        pass
    
    # Hash değilse düz metin karşılaştırma yap (geriye dönük uyumluluk)
    return plain_password == stored_password


@router.post(
    "/login",
    response_model=schemas.LoginResponse,
    summary="Kullanıcı Girişi",
)
async def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Kullanıcı Giriş Endpoint'i
    - Şifre doğrulama bcrypt hash ile yapılır.
    - Eski düz metin şifreler de kabul edilir ve otomatik hashlenmiş versiyona yükseltilir.
    """
    # Kullanıcıyı veritabanında ara
    user = crud.get_user_by_username(db, request.username.strip())

    # Kullanıcı bulunamazsa veya şifre eşleşmezse
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı."
        )
    
    # Eğer şifre hala düz metin ise, otomatik olarak hashle ve güncelle
    if not user.password.startswith("$2b$"):
        user.password = pwd_context.hash(request.password)
        db.commit()

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
