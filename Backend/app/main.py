from fastapi import FastAPI

from app.database import Base, engine
from app import models

import sqlite3

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


@app.get("/")
def root():
    return {"message": "Financial Tracker API"}