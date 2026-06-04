"""routes/announcements.py — Duyuru Yönetimi Rotaları"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import schemas
import crud
from database import get_db

router = APIRouter(prefix="/api/announcements", tags=["Duyurular"])

@router.get("/", summary="Tüm Duyuruları Listele")
async def get_announcements(db: Session = Depends(get_db)):
    data = crud.get_announcements(db)
    return {"success": True, "data": data}

@router.post("/", status_code=201, summary="Yeni Duyuru Yayınla")
async def create_announcement(ann: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    new_ann = crud.create_announcement(db, ann)
    return {"success": True, "data": new_ann}

@router.delete("/{ann_id}", summary="Duyuru Sil")
async def delete_announcement(ann_id: int, db: Session = Depends(get_db)):
    deleted_ann = crud.delete_announcement(db, ann_id)
    if not deleted_ann:
        raise HTTPException(status_code=404, detail="Duyuru bulunamadı.")
    return {"success": True, "message": "Duyuru silindi."}
