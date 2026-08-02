from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=False)

    transactions = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    date = Column(String, nullable=False)
    category = Column(String, nullable=False)
    merchant_name = Column(String, nullable=True)
    location = Column(String, nullable=True)

    user = relationship(
        "User",
        back_populates="transactions"
    )

    items = relationship(
        "Item",
        back_populates="transaction",
        cascade="all, delete-orphan"
    )


class Item(Base):
    __tablename__ = "items"

    item_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    transaction_id = Column(
        Integer,
        ForeignKey("transactions.transaction_id"),
        nullable=False
    )

    item_name = Column(String, nullable=False)
    item_price = Column(Float, nullable=False)

    transaction = relationship(
        "Transaction",
        back_populates="items"
    )
