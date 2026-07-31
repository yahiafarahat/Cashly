from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )

    try:
        payload = crud.decode_access_token(token)
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_id(db, int(user_id))

    if user is None:
        raise credentials_exception

    return user


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return crud.create_user(db, user)


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = crud.create_access_token(data={"sub": str(user.user_id)})

    return schemas.Token(access_token=access_token, user=user)