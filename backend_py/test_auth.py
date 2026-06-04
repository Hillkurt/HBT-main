from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from database import get_db, Base
from models import User

# Testler için geçici bir in-memory veritabanı oluşturalım
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["success"] == True

def test_login_failure():
    response = client.post(
        "/api/auth/login",
        json={"username": "wrong_user", "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Kullanıcı adı veya şifre hatalı."

def test_login_success():
    # Önce test veritabanına kullanıcı ekleyelim
    db = TestingSessionLocal()
    user = db.query(User).filter_by(username="testuser").first()
    if not user:
        new_user = User(
            username="testuser",
            password="testpassword",
            role="sakin",
            name="Test User",
            unit="Blok T",
            type="Kiracı",
            email="test@test.com",
            phone="123"
        )
        db.add(new_user)
        db.commit()
    db.close()

    # Şimdi giriş yapmayı deneyelim
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert response.json()["success"] == True
    assert "token" in response.json()
