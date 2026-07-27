from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    transactions = relationship(
        "Transaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    merchant_name = Column(String, nullable=False)
    date = Column(String, nullable=False)
    location = Column(String)

    user = relationship("User", back_populates="transactions")

    items = relationship(
        "Item",
        back_populates="transaction",
        cascade="all, delete-orphan"
    )


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    item_name = Column(String, nullable=False)
    item_price = Column(Float, nullable=False)

    transaction = relationship("Transaction", back_populates="items")