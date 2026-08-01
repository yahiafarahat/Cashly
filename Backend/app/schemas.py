from pydantic import BaseModel, EmailStr, Field


# ---------- User Schemas ----------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ---------- Authentication Schemas ----------

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ---------- Item Schemas ----------

class ItemCreate(BaseModel):
    item_name: str
    item_price: float = Field(gt=0)


class ItemResponse(BaseModel):
    item_id: int
    transaction_id: int
    item_name: str
    item_price: float

    class Config:
        from_attributes = True


# ---------- Transaction Schemas ----------

class TransactionCreate(BaseModel):
    description: str
    price: float = Field(gt=0)
    date: str
    category: str

    # Extra Cashly fields
    merchant_name: str | None = None
    location: str | None = None

    items: list[ItemCreate] = Field(min_length=1)


class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    description: str
    price: float
    date: str
    category: str
    merchant_name: str | None
    location: str | None
    items: list[ItemResponse]

    class Config:
        from_attributes = True