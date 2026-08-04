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


# ---------- Transaction Schemas ----------

class TransactionCreate(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    price: float = Field(gt=0)
    date: str
    category: str = Field(min_length=1, max_length=100)
    time: str | None = Field(default=None, max_length=20)
    payment_method: str | None = Field(default=None, max_length=100)


class TransactionUpdate(TransactionCreate):
    """Full replacement payload for an existing transaction."""


class TransactionResponse(BaseModel):
    transaction_id: int
    user_id: int
    description: str
    price: float
    date: str
    category: str
    time: str | None
    payment_method: str | None

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


class CategoryFrequency(BaseModel):
    name: str
    count: int
    percent: float


class PeriodSpending(BaseModel):
    period: str
    amount: float
    average: float


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
    category_frequency: list[CategoryFrequency]
    monthly_trend: list[MonthlySpending]
    granularity: str
    spending_by_period: list[PeriodSpending]
    trend_change_percent: float
    amount_difference: float
    biggest_opportunity: BiggestOpportunity | None
    insights: list[SpendingInsight]


# ---------- Assistant Schemas ----------

class AssistantMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class AssistantAskRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[AssistantMessage] = Field(default_factory=list)


class AssistantAskResponse(BaseModel):
    reply: str
