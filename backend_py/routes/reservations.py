"""routes/reservations.py — Rezervasyon Yönetimi Rotaları"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/reservations", tags=["Rezervasyonlar"])

@router.get("/", summary="Tüm Rezervasyonları Listele")
async def get_reservations(db: Session = Depends(get_db)):
    data = crud.get_reservations(db)
    return {"success": True, "data": data}

@router.post("/", status_code=201, summary="Yeni Rezervasyon Yap")
async def create_reservation(res: schemas.ReservationCreate, db: Session = Depends(get_db)):
    # Çakışma kontrolü
    conflict = crud.get_conflicting_reservation(db, res.facility, res.date, res.timeSlot)
    if conflict:
        raise HTTPException(status_code=409, detail="Bu saat dilimi zaten dolu.")

    new_res = crud.create_reservation(db, res)
    return {"success": True, "data": new_res}

@router.delete("/{res_id}", summary="Rezervasyon İptal Et")
async def cancel_reservation(res_id: int, db: Session = Depends(get_db)):
    deleted_res = crud.delete_reservation(db, res_id)
    if not deleted_res:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı.")
    return {"success": True, "message": "Rezervasyon iptal edildi."}
