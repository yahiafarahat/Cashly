from fastapi import APIRouter, Depends, HTTPException

from app import schemas
from app.categorization_service import (
    CategorizationModelNotAvailable,
    predict_category
)
from app.security import get_current_user


router = APIRouter(
    prefix="/categorization",
    tags=["Categorization"]
)


@router.post(
    "/predict",
    response_model=schemas.CategorizeResponse
)
def predict(
    request: schemas.CategorizeRequest,
    current_user=Depends(get_current_user)
):
    try:
        prediction = predict_category(request.description)
    except CategorizationModelNotAvailable as error:
        raise HTTPException(status_code=503, detail=str(error))

    if prediction is None:
        return {"category": None, "confidence": None}

    return prediction
