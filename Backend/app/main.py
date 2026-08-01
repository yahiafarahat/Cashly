import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, transactions


def init_db():
    conn = sqlite3.connect("finance.db")

    with open("app/schema.sql", "r") as f:
        conn.executescript(f.read())

    conn.commit()
    conn.close()


init_db()

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


@app.get("/")
def root():
    return {"message": "Financial Tracker API"} 