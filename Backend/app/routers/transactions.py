from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas
from app.security import get_current_user


router = APIRouter(
   prefix="/transactions",
    tags=["Transactions"]
)


@router.post(
    "",
    response_model=schemas.TransactionResponse,
    status_code=201
)
def create_new_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.create_transaction(
        db,
        transaction,
        current_user.user_id
    )


@router.get(
    "",
    response_model=list[schemas.TransactionResponse]
)
def get_all_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_transactions_by_user(
        db,
        current_user.user_id
    )


@router.get(
    "/{transaction_id}",
    response_model=schemas.TransactionResponse
)
def get_one_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    transaction = crud.get_transaction_by_id(
        db,
        transaction_id,
        current_user.user_id
    )

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction
    