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
    description: str = Field(min_length=1, max_length=500)
    price: float = Field(gt=0)
    date: str
    category: str = Field(min_length=1, max_length=100)
    merchant_name: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    items: list[ItemCreate] = Field(default_factory=list)


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


# ---------- Analytics Schemas ----------

class CategoryAnalytics(BaseModel):
    name: str
    amount: float
    percent: float
    change_percent: float | None
    tone: str


class MonthlySpending(BaseModel):
    month: str
    amount: float


class BiggestOpportunity(BaseModel):
    category: str
    share_percent: float
    potential_savings: float


class SpendingInsight(BaseModel):
    tag: str
    title: str
    text: str
    positive: bool = False


class AnalyticsSummary(BaseModel):
    current_month: str
    total_spent: float
    category_breakdown: list[CategoryAnalytics]
    monthly_trend: list[MonthlySpending]
    trend_change_percent: float
    amount_difference: float
    biggest_opportunity: BiggestOpportunity | None
    insights: list[SpendingInsight]
