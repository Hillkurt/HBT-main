"""
============================================================
 models.py — SQLAlchemy Veritabanı Modelleri
 Dijital Yönetim Sistemi — Python FastAPI Backend

 Bu dosyadaki sınıflar PostgreSQL veritabanındaki TABLOLARI temsil eder.
 SQLAlchemy ORM sayesinde SQL sorgusu yazmadan veritabanı işlemleri yapılır.
============================================================
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="yonetici")
    name = Column(String)
    unit = Column(String)
    type = Column(String)
    email = Column(String)
    phone = Column(String)


class Resident(Base):
    __tablename__ = "residents"

    id = Column(Integer, primary_key=True, index=True)
    unit = Column(String, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, default="Kiracı")
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    status = Column(String, default="paid")
    dues = Column(Float, default=0.0)
    dueDate = Column(String, nullable=True)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    type = Column(String, nullable=False) # income / expense
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String, default="Banka")
    description = Column(String, nullable=True)


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, default="Genel")
    priority = Column(String, default="Orta")
    status = Column(String, default="Beklemede")
    date = Column(String)
    unit = Column(String, nullable=True)
    residentName = Column(String, nullable=True)


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    category = Column(String, default="Genel")
    priority = Column(String, default="Normal")
    date = Column(String)


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    facility = Column(String, nullable=False)
    date = Column(String, nullable=False)
    timeSlot = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    residentName = Column(String, nullable=True)


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(String, nullable=False)
    message = Column(String, nullable=False)
