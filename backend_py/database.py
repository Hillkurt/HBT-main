"""
============================================================
 database.py — PostgreSQL Bağlantı Ayarları
 Dijital Yönetim Sistemi — Python FastAPI Backend

 SQLAlchemy kullanılarak PostgreSQL veritabanına bağlanır.
============================================================
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL bağlantı URL'si (Kullanıcı adı, şifre, host, port, veritabanı adı)
# Varsayılan olarak SQLite kullanacak (PostgreSQL kurulu değilse çalışması için fallback)
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Çevresel değişken (Environment Variable) olarak DATABASE_URL verilmişse onu kullan
# Eğer verilmemişse, yerel bilgisayardaki hbt_app.db dosyasını kullan (Fallback)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hbt_app.db")

# SQLite kullanılıyorsa özel bir parametre (check_same_thread) gereklidir,
# PostgreSQL kullanılıyorsa bu parametreye gerek yoktur.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

# Veritabanı oturumu (session) oluşturucu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Tüm veritabanı modellerinin (tabloların) miras alacağı temel sınıf
Base = declarative_base()

# FastAPI bağımlılığı (Dependency) olarak kullanılacak veritabanı oturumu fonksiyonu
def get_db():
    """
    Her API isteğinde yeni bir veritabanı oturumu (Session) açar,
    istek bittiğinde oturumu kapatır.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
