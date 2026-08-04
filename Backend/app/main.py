import sqlite3
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, transactions, analytics, assistant
from app.database import DATABASE_PATH


def init_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA foreign_keys = ON")

    schema_path = Path(__file__).resolve().parent / "schema.sql"

    with schema_path.open("r", encoding="utf-8") as f:
        conn.executescript(f.read())

    transaction_columns = {
        row[1] for row in conn.execute(
            "PRAGMA table_info(transactions)"
        )
    }

    for column in ("time", "payment_method"):
        if column not in transaction_columns:
            conn.execute(
                f"ALTER TABLE transactions ADD COLUMN {column} TEXT"
            )

    conn.commit()
    conn.close()


app = FastAPI(
    title="Financial Tracker API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(assistant.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {"message": "Financial Tracker API"}
