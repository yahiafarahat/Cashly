from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

from app import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "cashly-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def create_transaction(db: Session, user_id: int, transaction: schemas.TransactionCreate):
    db_transaction = models.Transaction(
        user_id=user_id,
        **transaction.model_dump()
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


def get_transactions_by_user(db: Session, user_id: int):
    return db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()


def get_transaction_by_id(db: Session, transaction_id: int, user_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id,
        models.Transaction.user_id == user_id
    ).first()


def delete_transaction(db: Session, transaction: models.Transaction):
    db.delete(transaction)
    db.commit()