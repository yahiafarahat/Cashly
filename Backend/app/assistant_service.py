import os

from groq import Groq
from sqlalchemy.orm import Session

from app import crud

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
MAX_TRANSACTIONS_IN_CONTEXT = 500
MAX_HISTORY_MESSAGES = 20


class AssistantConfigError(Exception):
    """Raised when the assistant isn't configured (missing API key, etc.)."""


class AssistantUpstreamError(Exception):
    """Raised when the Groq API call itself fails."""


def _build_transaction_context(transactions):
    if not transactions:
        return "The user has no recorded transactions yet."

    shown = transactions[:MAX_TRANSACTIONS_IN_CONTEXT]

    lines = [
        "Here is the user's transaction history "
        "(id | date | description | category | amount in EGP):"
    ]

    for transaction in shown:
        lines.append(
            f"- #{transaction.transaction_id} | {transaction.date} | "
            f"{transaction.description} | {transaction.category} | "
            f"EGP {float(transaction.price):.2f}"
        )

    remaining = len(transactions) - len(shown)

    if remaining > 0:
        lines.append(
            f"...and {remaining} more older transactions not shown above."
        )

    return "\n".join(lines)


def _build_system_prompt(transactions):
    context = _build_transaction_context(transactions)

    return (
        "You are Cashly's financial assistant, a helpful and concise AI "
        "built into a personal finance app. You answer questions about the "
        "user's own spending.\n\n"
        f"{context}\n\n"
        "Rules:\n"
        "- Answer using the transaction data above. You may sum, average, "
        "filter, and compare it to answer questions.\n"
        "- Do not invent transactions, amounts, dates, or categories that "
        "aren't in the data.\n"
        "- If the data doesn't contain enough information to answer, say so "
        "honestly instead of guessing.\n"
        "- All amounts are in Egyptian Pounds (EGP); format them naturally, "
        "e.g. \"EGP 1,250\".\n"
        "- Be warm and conversational, but keep answers concise.\n"
        "- Only give general financial advice if the user asks for it; "
        "otherwise stay focused on answering about their own data."
    )


def ask_assistant(
    db: Session,
    user_id: int,
    message: str,
    history: list
):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise AssistantConfigError(
            "The assistant isn't configured yet. Set the GROQ_API_KEY "
            "environment variable on the backend."
        )

    transactions = crud.get_transactions_by_user(db, user_id)
    system_prompt = _build_system_prompt(transactions)

    messages = [{"role": "system", "content": system_prompt}]

    for turn in history[-MAX_HISTORY_MESSAGES:]:
        role = getattr(turn, "role", None)
        content = getattr(turn, "content", None)

        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    client = Groq(api_key=api_key, timeout=20.0, max_retries=1)

    try:
        completion = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.4,
            max_tokens=600
        )
    except Exception as error:
        raise AssistantUpstreamError(
            "The assistant is temporarily unavailable. Please try again."
        ) from error

    reply = completion.choices[0].message.content

    return reply.strip() if reply else (
        "Sorry, I couldn't come up with an answer for that."
    )
