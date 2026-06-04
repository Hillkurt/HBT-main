"""
============================================================
 routes/residents.py — Sakin Yönetimi Rotaları
 Dijital Yönetim Sistemi — Python FastAPI Backend

 CRUD işlemleri: Create, Read, Update, Delete
 Tüm sakin verileri db.json'dan okunur ve yazılır.
============================================================
"""

import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional

import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/residents", tags=["Sakinler"])


@router.get(
    "/",
    summary="Tüm Sakinleri Listele",
)
async def get_residents(db: Session = Depends(get_db)):
    residents = crud.get_residents(db)
    return {"success": True, "data": residents}


@router.get(
    "/{resident_id}",
    summary="Tek Sakin Getir",
)
async def get_resident(resident_id: int, db: Session = Depends(get_db)):
    resident = crud.get_resident(db, resident_id)
    if not resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID={resident_id} olan sakin bulunamadı."
        )
    return {"success": True, "data": resident}


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Yeni Sakin Ekle",
)
async def create_resident(resident: schemas.ResidentCreate, db: Session = Depends(get_db)):
    new_resident = crud.create_resident(db, resident)
    return {"success": True, "data": new_resident}


@router.put(
    "/{resident_id}",
    summary="Sakin Bilgilerini Güncelle",
)
async def update_resident(resident_id: int, resident: schemas.ResidentUpdate, db: Session = Depends(get_db)):
    updated_resident = crud.update_resident(db, resident_id, resident)
    if not updated_resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID={resident_id} olan sakin bulunamadı."
        )
    return {"success": True, "data": updated_resident}


@router.delete(
    "/{resident_id}",
    summary="Sakin Sil",
)
async def delete_resident(resident_id: int, db: Session = Depends(get_db)):
    deleted_resident = crud.delete_resident(db, resident_id)
    if not deleted_resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ID={resident_id} olan sakin bulunamadı."
        )
    return {"success": True, "message": f"{deleted_resident.name} başarıyla silindi."}


@router.post(
    "/{resident_id}/pay",
    summary="Aidat Ödeme",
)
async def pay_dues(resident_id: int, payment: schemas.DuesPayment, db: Session = Depends(get_db)):
    if payment.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Geçerli bir ödeme tutarı giriniz."
        )
        
    updated_resident = crud.pay_dues(db, resident_id, payment)
    if not updated_resident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sakin bulunamadı."
        )

    return {"success": True, "data": updated_resident}
