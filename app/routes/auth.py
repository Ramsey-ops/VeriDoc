from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..auth import create_access_token
from ..database import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
async def login(form_data: schemas.EmployeeLogin, db: AsyncSession = Depends(get_db)):
    employee = await crud.authenticate_employee(db, username=form_data.username, password=form_data.password)
    if not employee:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(subject=employee.username, role=employee.role, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer"}
