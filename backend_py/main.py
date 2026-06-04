"""
============================================================
 main.py — Ana FastAPI Uygulaması
 Dijital Yönetim Sistemi — Python Backend

 Çalıştırmak için:
   cd backend_py
   py -m uvicorn main:app --reload --port 8000

 API Dokümantasyonu (otomatik oluşur!):
   http://localhost:8000/docs      ← Swagger UI
   http://localhost:8000/redoc     ← ReDoc görünümü
============================================================
"""

import time
import json
import os
from datetime import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# SQLAlchemy ve CRUD Modülleri
from database import engine, get_db, SessionLocal
import models
import schemas
import crud

# Route modüllerini içe aktar
from routes.auth import router as auth_router
from routes.residents import router as residents_router
from routes.transactions import router as transactions_router
from routes.requests_ import router as requests_router
from routes.announcements import router as announcements_router
from routes.reservations import router as reservations_router

# Veritabanı tablolarını oluştur (PostgreSQL veya SQLite)
# Bu satır sayesinde sunucu başlarken "users", "residents" gibi tablolar yoksa otomatik yaratılır.
models.Base.metadata.create_all(bind=engine)


# ─── FastAPI Uygulaması ────────────────────────────────────────────────────────
app = FastAPI(
    title="Dijital Yönetim Sistemi API",
    description="""
## 🏢 Apartman & Site Dijital Yönetim Sistemi

Bu API, bir apartman/site yönetim sisteminin arka yüzüdür.

### Teknoloji Stack:
- **Dil:** Python 3.13
- **Framework:** FastAPI
- **Sunucu:** Uvicorn (ASGI)
- **Veri:** PostgreSQL (SQLAlchemy ORM ile)
- **Frontend:** React 19 + Vite
    """,
    version="1.0.0",
)


# ─── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Route'ları Kaydet ────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(residents_router)
app.include_router(transactions_router)
app.include_router(requests_router)
app.include_router(announcements_router)
app.include_router(reservations_router)


# ─── Özel Route'lar ───────────────────────────────────────────────────────────

@app.get("/api/health", tags=["Sistem"], summary="Sağlık Kontrolü")
async def health_check(db: Session = Depends(get_db)):
    """Sunucu ve veritabanı bağlantı durumunu kontrol eder."""
    try:
        # Basit bir sorgu ile DB bağlantısını test et
        db.execute(models.User.__table__.select().limit(1))
        db_status = "✅ PostgreSQL/SQLite Bağlantısı Başarılı"
    except Exception as e:
        db_status = f"❌ Veritabanı Hatası: {str(e)}"

    return {
        "success": True,
        "message": "✅ Dijital Yönetim FastAPI Backend çalışıyor!",
        "database_status": db_status,
        "framework": "FastAPI",
        "timestamp": datetime.now().isoformat(),
        "docs": "http://localhost:8000/docs"
    }


@app.get("/api/logs", tags=["Sistem"], summary="Sistem Loglarını Getir")
async def get_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = crud.get_logs(db, limit=limit)
    return {"success": True, "data": logs}


@app.post("/api/dues/generate", tags=["Aidat Yönetimi"], summary="Toplu Aidat Borçlandır")
async def generate_dues(body: schemas.GenerateDues, db: Session = Depends(get_db)):
    crud.generate_dues_for_all(db, body.amount)
    return {
        "success": True,
        "message": f"{body.amount:.0f} TL aidat tüm sakinlere eklendi."
    }


# ─── Başlangıç Verilerini Yükle ───────────────────────────────────────────────

def seed_database():
    """
    Eğer veritabanı boşsa, db.json (eski mock data) dosyasındaki verileri
    SQLAlchemy ile PostgreSQL/SQLite veritabanına aktarır.
    Bu sayede sunum sırasında tablolar dolu gelir.
    """
    db = SessionLocal()
    try:
        # Sadece kullanıcı tablosu boşsa verileri yükle
        if db.query(models.User).first() is None:
            json_path = os.path.join(os.path.dirname(__file__), "db.json")
            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Kullanıcıları ekle
                for u in data.get("users", []):
                    user = models.User(
                        username=u["username"],
                        password=u["password"],
                        role=u["role"],
                        name=u["name"],
                        unit=u["unit"],
                        type=u.get("type", "Yönetici"),
                        email=u.get("email", ""),
                        phone=u.get("phone", "")
                    )
                    db.add(user)

                # Sakinleri ekle
                for r in data.get("residents", []):
                    res = models.Resident(
                        unit=r["unit"],
                        name=r["name"],
                        type=r["type"],
                        email=r.get("email", ""),
                        phone=r.get("phone", ""),
                        status=r.get("status", "paid"),
                        dues=r.get("dues", 0.0),
                        dueDate=r.get("dueDate", "")
                    )
                    db.add(res)
                
                db.commit()
                print("Baslangic verileri veritabanina basariyla aktarildi.")
    except Exception as e:
        print(f"Veri yukleme hatasi: {e}")
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    seed_database()
    print()
    print("=" * 55)
    print("   DIJITAL YONETIM --- FastAPI + PostgreSQL BACKEND")
    print("   Sunucu : http://localhost:8000")
    print("   Docs   : http://localhost:8000/docs")
    print("   Health : http://localhost:8000/api/health")
    print("=" * 55)
    print()
