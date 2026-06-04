"""
============================================================
 models.py — Pydantic Veri Modelleri
 Dijital Yönetim Sistemi — Python FastAPI Backend

 Pydantic: FastAPI'nin veri doğrulama kütüphanesi.
 Her model, API'ye gelen veya giden veriyi tanımlar.
 Yanlış tip gelirse FastAPI otomatik hata döndürür.

 Hocaya anlatılacaklar:
   - "Bu modeller veritabanı şemasının Python karşılığıdır."
   - "FastAPI, Pydantic sayesinde otomatik doğrulama yapar."
   - "Swagger UI (/docs) bu modelleri otomatik gösterir."
============================================================
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, Literal


# ─── KİMLİK DOĞRULAMA MODELLERİ ──────────────────────────────────────────────

class LoginRequest(BaseModel):
    """
    Giriş İsteği Modeli
    Kullanıcının göndereceği kullanıcı adı ve şifre.
    FastAPI bu veriyi otomatik doğrular — eksik alan varsa 422 hatası döner.
    """
    username: str
    password: str


class LoginResponse(BaseModel):
    """
    Giriş Yanıtı Modeli
    Başarılı girişte döndürülecek veri yapısı.
    'token' alanı gerçek projede JWT token içerir.
    """
    success: bool
    user: Optional[dict] = None
    token: Optional[str] = None
    message: Optional[str] = None


class LogoutRequest(BaseModel):
    """Çıkış İsteği — log kaydı için kullanıcı adı yeterli"""
    username: Optional[str] = None


# ─── SAKİN MODELLERİ ──────────────────────────────────────────────────────────

class ResidentBase(BaseModel):
    """
    Sakin Temel Model
    Hem oluşturma hem güncelleme için ortak alanlar.
    Optional alanlar: değer girilmezse varsayılan kullanılır.
    """
    unit: str                          # Daire bilgisi: "Blok A / Daire 1"
    name: str                          # Ad soyad
    type: Literal["Mal Sahibi", "Kiracı"] = "Kiracı"  # Sakin tipi
    email: Optional[str] = ""
    phone: Optional[str] = ""
    status: Literal["paid", "warning"] = "paid"  # Aidat durumu
    dues: Optional[float] = 0.0        # Aidat borcu (TL)
    dueDate: Optional[str] = None      # Son ödeme tarihi


class ResidentCreate(ResidentBase):
    """Yeni Sakin Oluşturma Modeli — ResidentBase'den miras alır"""
    pass


class ResidentUpdate(BaseModel):
    """
    Sakin Güncelleme Modeli
    Tüm alanlar opsiyonel — sadece değişen alanları göndermek yeterli.
    (PATCH mantığı: tüm veriyi değil, sadece değişeni gönder)
    """
    unit: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    dues: Optional[float] = None
    dueDate: Optional[str] = None


class DuesPayment(BaseModel):
    """Aidat Ödeme İsteği Modeli"""
    amount: float           # Ödeme tutarı (TL)
    method: str = "Banka"   # Ödeme yöntemi


# ─── FİNANSAL İŞLEM MODELLERİ ───────────────────────────────────────────────

class TransactionCreate(BaseModel):
    """
    Finansal İşlem Oluşturma Modeli
    Literal tipler sayesinde sadece geçerli değerler kabul edilir.
    """
    type: Literal["income", "expense"]  # Gelir mi, gider mi?
    category: str                       # Aidat, Personel, Bakım, vb.
    amount: float                       # Tutar (TL)
    method: str = "Banka"              # Ödeme yöntemi
    description: Optional[str] = ""    # Açıklama
    date: Optional[str] = None         # Tarih (yoksa bugün alınır)


# ─── TALEP MODELLERİ ──────────────────────────────────────────────────────────

class RequestCreate(BaseModel):
    """Sakin Tarafından Oluşturulan Arıza/Talep Modeli"""
    title: str                          # Talep başlığı (zorunlu)
    description: Optional[str] = ""    # Detaylı açıklama
    category: str = "Genel"            # Arıza, Temizlik, Genel, vb.
    priority: Literal["Yüksek", "Orta", "Düşük"] = "Orta"
    unit: Optional[str] = ""           # Sakin dairesi
    residentName: Optional[str] = ""   # Sakin adı


class RequestStatusUpdate(BaseModel):
    """Talep Durumu Güncelleme Modeli (Yönetici tarafından)"""
    status: Literal["Beklemede", "İşlemde", "Tamamlandı"]


# ─── DUYURU MODELLERİ ─────────────────────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    """Yönetici Tarafından Yayınlanan Duyuru Modeli"""
    title: str                          # Duyuru başlığı (zorunlu)
    content: str                        # Duyuru içeriği (zorunlu)
    category: str = "Genel"            # Acil, Genel, Finansal
    priority: Literal["Yüksek", "Normal"] = "Normal"


# ─── REZERVASYON MODELLERİ ────────────────────────────────────────────────────

class ReservationCreate(BaseModel):
    """Tesis Rezervasyon Modeli"""
    facility: str                       # Tesis adı: Spor Salonu, Havuz, vb.
    date: str                           # Tarih: "2026-06-15"
    timeSlot: str                       # Saat dilimi: "10:00 - 12:00"
    unit: Optional[str] = ""
    residentName: Optional[str] = ""


# ─── AİDAT YÖNETİMİ ───────────────────────────────────────────────────────────

class GenerateDues(BaseModel):
    """Toplu Aidat Borçlandırma Modeli (Yönetici)"""
    amount: float = 1200.0  # Varsayılan: 1200 TL
