# Cashly backend

The FastAPI backend persists users, transactions, and transaction items in SQLite. Passwords are salted and hashed; authenticated endpoints require a bearer JWT.

## Run locally

```powershell
cd Backend
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:CASHLY_SECRET_KEY = "replace-this-with-a-long-random-secret"
uvicorn app.main:app --reload
```

The API starts at `http://127.0.0.1:8000`; interactive documentation is available at `/docs`. The SQLite database is created at `Backend/finance.db` by default. Set `CASHLY_DATABASE_PATH` to use another SQLite file.

## Required API routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{transaction_id}`

`POST /transactions` accepts `description`, `price`, `date`, and `category`, plus optional `merchant_name`, `location`, and nested `items`.
