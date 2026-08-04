import secrets

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app import models, schemas


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ---------- Password Functions ----------

def generate_salt():
    return secrets.token_hex(16)


def get_password_hash(password: str, salt: str):
    return pwd_context.hash(password + salt)


def verify_password(
    plain_password: str,
    salt: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password + salt,
        hashed_password
    )


# ---------- User Functions ----------

def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def get_user_by_id(db: Session, user_id: int):
    return (
        db.query(models.User)
        .filter(models.User.user_id == user_id)
        .first()
    )


def create_user(
    db: Session,
    user: schemas.UserCreate
):
    salt = generate_salt()

    hashed_password = get_password_hash(
        user.password,
        salt
    )

    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        salt=salt
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = get_user_by_email(db, email)

    if not user:
        return None

    password_is_correct = verify_password(
        password,
        user.salt,
        user.password_hash
    )

    if not password_is_correct:
        return None

    return user


# ---------- Transaction Functions ----------

def create_transaction(
    db: Session,
    transaction: schemas.TransactionCreate,
    user_id: int
):
    db_transaction = models.Transaction(
        user_id=user_id,
        description=transaction.description,
        price=transaction.price,
        category=transaction.category,
        date=transaction.date,
        time=transaction.time,
        payment_method=transaction.payment_method
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


def get_transactions_by_user(
    db: Session,
    user_id: int
):
    return (
        db.query(models.Transaction)
        .filter(
            models.Transaction.user_id == user_id
        )
        .order_by(
            models.Transaction.transaction_id.desc()
        )
        .all()
    )


def get_transaction_by_id(
    db: Session,
    transaction_id: int,
    user_id: int
):
    return (
        db.query(models.Transaction)
        .filter(
            models.Transaction.transaction_id
            == transaction_id,
            models.Transaction.user_id
            == user_id
        )
        .first()
    )


def update_transaction(
    db: Session,
    transaction_id: int,
    user_id: int,
    transaction_update: schemas.TransactionUpdate
):
    transaction = get_transaction_by_id(db, transaction_id, user_id)

    if transaction is None:
        return None

    transaction.description = transaction_update.description
    transaction.price = transaction_update.price
    transaction.date = transaction_update.date
    transaction.category = transaction_update.category
    transaction.time = transaction_update.time
    transaction.payment_method = transaction_update.payment_method

    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int):
    transaction = get_transaction_by_id(db, transaction_id, user_id)

    if transaction is None:
        return None

    db.delete(transaction)
    db.commit()
    return transaction
