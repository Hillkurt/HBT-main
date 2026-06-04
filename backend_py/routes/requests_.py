"""routes/requests_.py — Talep (Arıza/Şikayet) Yönetimi Rotaları"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/requests", tags=["Talepler"])

@router.get("/", summary="Tüm Talepleri Listele")
async def get_requests(db: Session = Depends(get_db)):
    data = crud.get_requests(db)
    return {"success": True, "data": data}

@router.post("/", status_code=201, summary="Yeni Talep Oluştur")
async def create_request(req: schemas.RequestCreate, db: Session = Depends(get_db)):
    new_req = crud.create_request(db, req)
    return {"success": True, "data": new_req}

@router.patch("/{req_id}/status", summary="Talep Durumu Güncelle")
async def update_request_status(req_id: int, update: schemas.RequestStatusUpdate, db: Session = Depends(get_db)):
    updated_req = crud.update_request_status(db, req_id, update.status)
    if not updated_req:
        raise HTTPException(status_code=404, detail="Talep bulunamadı.")
    return {"success": True, "data": updated_req}

@router.delete("/{req_id}", summary="Talep Sil")
async def delete_request(req_id: int, db: Session = Depends(get_db)):
    deleted_req = crud.delete_request(db, req_id)
    if not deleted_req:
        raise HTTPException(status_code=404, detail="Talep bulunamadı.")
    return {"success": True, "message": "Talep silindi."}
