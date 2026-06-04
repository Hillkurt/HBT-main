"""
============================================================
 crud.py — Veritabanı İşlemleri (Create, Read, Update, Delete)
 Dijital Yönetim Sistemi — Python FastAPI Backend

 Bu dosya, route'lar ile veritabanı arasındaki bağlantıyı sağlar.
 Rota (endpoint) fonksiyonları doğrudan veritabanına erişmez,
 bu dosyadaki CRUD fonksiyonlarını çağırır.
============================================================
"""

from sqlalchemy.orm import Session
import models
import schemas
import time
from datetime import datetime

# --- KULLANICILAR (USERS) ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


# --- LOGLAR ---
def add_log(db: Session, message: str):
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    db_log = models.Log(time=now_str, message=message)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_logs(db: Session, limit: int = 50):
    return db.query(models.Log).order_by(models.Log.id.desc()).limit(limit).all()


# --- SAKİNLER (RESIDENTS) ---
def get_residents(db: Session):
    return db.query(models.Resident).all()

def get_resident(db: Session, resident_id: int):
    return db.query(models.Resident).filter(models.Resident.id == resident_id).first()

def create_resident(db: Session, resident: schemas.ResidentCreate):
    db_resident = models.Resident(**resident.model_dump())
    db.add(db_resident)
    db.commit()
    db.refresh(db_resident)
    add_log(db, f"Yeni sakin eklendi: {db_resident.name} ({db_resident.unit})")
    return db_resident

def update_resident(db: Session, resident_id: int, resident_data: schemas.ResidentUpdate):
    db_resident = get_resident(db, resident_id)
    if db_resident:
        update_data = resident_data.model_dump(exclude_unset=True)
        if update_data.get("status") == "paid":
            update_data["dues"] = 0.0
            
        for key, value in update_data.items():
            setattr(db_resident, key, value)
        db.commit()
        db.refresh(db_resident)
        add_log(db, f"Sakin bilgileri güncellendi: {db_resident.name}")
    return db_resident

def delete_resident(db: Session, resident_id: int):
    db_resident = get_resident(db, resident_id)
    if db_resident:
        db.delete(db_resident)
        db.commit()
        add_log(db, f"Sakin silindi: {db_resident.name} ({db_resident.unit})")
    return db_resident

def pay_dues(db: Session, resident_id: int, payment: schemas.DuesPayment):
    db_resident = get_resident(db, resident_id)
    if db_resident and payment.amount > 0:
        new_dues = max(0.0, db_resident.dues - payment.amount)
        db_resident.dues = new_dues
        db_resident.status = "paid" if new_dues == 0 else "warning"
        
        # İşlemlere gelir olarak ekle
        now_date = datetime.now().strftime("%Y-%m-%d")
        new_tx = models.Transaction(
            date=now_date,
            type="income",
            category="Aidat",
            amount=payment.amount,
            method=payment.method,
            description=f"{db_resident.name} - Aidat Ödemesi"
        )
        db.add(new_tx)
        db.commit()
        db.refresh(db_resident)
        add_log(db, f"{db_resident.name} {payment.amount:.0f} TL aidat ödemesi gerçekleştirdi.")
    return db_resident

def generate_dues_for_all(db: Session, amount: float):
    residents = db.query(models.Resident).all()
    due_date = f"{datetime.now().year}-{datetime.now().month:02d}-15"
    for r in residents:
        r.dues += amount
        r.status = "warning"
        r.dueDate = due_date
    db.commit()
    add_log(db, f"Toplu aidat: Tüm sakinler için {amount:.0f} TL borçlandırıldı.")
    return residents


# --- FİNANSAL İŞLEMLER (TRANSACTIONS) ---
def get_transactions(db: Session, type: str = None):
    query = db.query(models.Transaction)
    if type:
        query = query.filter(models.Transaction.type == type)
    return query.order_by(models.Transaction.id.desc()).all()

def create_transaction(db: Session, tx: schemas.TransactionCreate):
    db_tx = models.Transaction(
        date=tx.date or datetime.now().strftime("%Y-%m-%d"),
        **tx.model_dump(exclude={"date"})
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    add_log(db, f"Finansal işlem kaydedildi: {'Gelir' if tx.type=='income' else 'Gider'} - {tx.category} ({tx.amount:.0f} TL)")
    return db_tx

def delete_transaction(db: Session, tx_id: int):
    db_tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if db_tx:
        desc = db_tx.description or ""
        db.delete(db_tx)
        db.commit()
        add_log(db, f"Finansal işlem silindi: {desc}")
    return db_tx


# --- TALEPLER (REQUESTS) ---
def get_requests(db: Session):
    return db.query(models.Request).order_by(models.Request.id.desc()).all()

def create_request(db: Session, req: schemas.RequestCreate):
    db_req = models.Request(
        date=datetime.now().strftime("%Y-%m-%d"),
        **req.model_dump()
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    add_log(db, f"Yeni talep: \"{db_req.title}\" - {db_req.residentName}")
    return db_req

def update_request_status(db: Session, req_id: int, status: str):
    db_req = db.query(models.Request).filter(models.Request.id == req_id).first()
    if db_req:
        db_req.status = status
        db.commit()
        db.refresh(db_req)
        add_log(db, f"Talep durumu: \"{db_req.title}\" → {status}")
    return db_req

def delete_request(db: Session, req_id: int):
    db_req = db.query(models.Request).filter(models.Request.id == req_id).first()
    if db_req:
        title = db_req.title
        db.delete(db_req)
        db.commit()
        add_log(db, f"Talep silindi: \"{title}\"")
    return db_req


# --- DUYURULAR (ANNOUNCEMENTS) ---
def get_announcements(db: Session):
    return db.query(models.Announcement).order_by(models.Announcement.id.desc()).all()

def create_announcement(db: Session, ann: schemas.AnnouncementCreate):
    db_ann = models.Announcement(
        date=datetime.now().strftime("%Y-%m-%d"),
        **ann.model_dump()
    )
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    add_log(db, f"Yeni duyuru: \"{db_ann.title}\"")
    return db_ann

def delete_announcement(db: Session, ann_id: int):
    db_ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if db_ann:
        title = db_ann.title
        db.delete(db_ann)
        db.commit()
        add_log(db, f"Duyuru silindi: \"{title}\"")
    return db_ann


# --- REZERVASYONLAR (RESERVATIONS) ---
def get_reservations(db: Session):
    return db.query(models.Reservation).all()

def get_conflicting_reservation(db: Session, facility: str, date: str, timeSlot: str):
    return db.query(models.Reservation).filter(
        models.Reservation.facility == facility,
        models.Reservation.date == date,
        models.Reservation.timeSlot == timeSlot
    ).first()

def create_reservation(db: Session, res: schemas.ReservationCreate):
    db_res = models.Reservation(**res.model_dump())
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    add_log(db, f"Rezervasyon: {db_res.facility} - {db_res.date} / {db_res.timeSlot}")
    return db_res

def delete_reservation(db: Session, res_id: int):
    db_res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if db_res:
        facility = db_res.facility
        date = db_res.date
        db.delete(db_res)
        db.commit()
        add_log(db, f"Rezervasyon iptal: {facility} - {date}")
    return db_res
