from pydantic import BaseModel, EmailStr


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


# ---------- Token Schemas ----------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Transaction Schemas ----------

class TransactionCreate(BaseModel):
    description: str | None = None
    price: float
    date: str
    category: str


class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    description: str | None
    price: float
    date: str
    category: str

    class Config:
        from_attributes = True