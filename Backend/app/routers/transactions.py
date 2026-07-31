from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.routers.auth import get_current_user

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_transaction(db, current_user.user_id, transaction)


@router.get("", response_model=list[schemas.TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_transactions_by_user(db, current_user.user_id)


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    transaction = crud.get_transaction_by_id(db, transaction_id, current_user.user_id)

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    transaction = crud.get_transaction_by_id(db, transaction_id, current_user.user_id)

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    crud.delete_transaction(db, transaction)
