# Cashly backend

The FastAPI backend persists users and transactions in SQLite. Passwords are salted and hashed; authenticated endpoints require a bearer JWT.

## Run locally

```powershell
cd Backend
venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:CASHLY_SECRET_KEY = "replace-this-with-a-long-random-secret"
$env:GROQ_API_KEY = "your-groq-api-key"
uvicorn app.main:app --reload
```

The API starts at `http://127.0.0.1:8000`; interactive documentation is available at `/docs`. The SQLite database is created at `Backend/finance.db` by default. Set `CASHLY_DATABASE_PATH` to use another SQLite file.

`GROQ_API_KEY` is required for the `/assistant/ask` endpoint (the in-app financial assistant), which uses the Groq API to answer free-text questions grounded in the logged-in user's transaction data. Get a key at [console.groq.com](https://console.groq.com). Optionally set `GROQ_MODEL` to override the default model (`llama-3.3-70b-versatile`).

## Required API routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{transaction_id}`
- `PUT /transactions/{transaction_id}`

`POST /transactions` accepts `description`, `price`, `date`, and `category`.
