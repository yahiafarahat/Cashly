from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import schemas
from app.assistant_service import (
    AssistantConfigError,
    AssistantUpstreamError,
    ask_assistant
)
from app.security import get_current_user


router = APIRouter(
    prefix="/assistant",
    tags=["Assistant"]
)


@router.post(
    "/ask",
    response_model=schemas.AssistantAskResponse
)
def ask(
    request: schemas.AssistantAskRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        reply = ask_assistant(
            db,
            current_user.user_id,
            request.message,
            request.history
        )
    except AssistantConfigError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except AssistantUpstreamError as error:
        raise HTTPException(status_code=502, detail=str(error))

    return {"reply": reply}
