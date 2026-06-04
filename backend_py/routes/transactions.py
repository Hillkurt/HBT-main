"""routes/transactions.py — Finansal İşlem Rotaları"""
import time
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Depends
from sqlalchemy.orm import Session
import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/transactions", tags=["Finansal İşlemler"])

@router.get("/", summary="Tüm Finansal İşlemleri Listele")
async def get_transactions(type: Optional[str] = Query(None, description="income veya expense"), db: Session = Depends(get_db)):
    data = crud.get_transactions(db, type)
    return {"success": True, "data": data}

@router.post("/", status_code=201, summary="Yeni Finansal İşlem Ekle")
async def create_transaction(tx: schemas.TransactionCreate, db: Session = Depends(get_db)):
    new_tx = crud.create_transaction(db, tx)
    return {"success": True, "data": new_tx}

@router.delete("/{tx_id}", summary="Finansal İşlem Sil")
async def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    deleted_tx = crud.delete_transaction(db, tx_id)
    if not deleted_tx:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı.")
    return {"success": True, "message": "İşlem silindi."}
