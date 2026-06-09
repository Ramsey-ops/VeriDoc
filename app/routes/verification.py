from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from .. import crud, schemas
from ..config import settings
from ..database import get_db
from ..utils import verify_digital_signature

router = APIRouter()

@router.get("/verification/{document_id}", response_model=schemas.VerificationResult)
async def verify_document(document_id: str, db: AsyncSession = Depends(get_db)):
    document = await _get_authentic_document(db, document_id)

    await crud.create_audit_log(
        db,
        document_id=document.id,
        employee_id=None,
        event_type="verification_attempt",
        status="success",
        message="Document verified successfully.",
    )
    return schemas.VerificationResult(
        document_id=document.document_id,
        customer_name=document.customer_name,
        document_number=document.document_number,
        document_type=document.document_type,
        issue_date=document.date_uploaded,
        verification_status="Authentic",
        message="Document verified successfully.",
        document_url=f"{settings.API_V1_STR}/verification/{document.document_id}/document",
    )


@router.get("/verification/{document_id}/document")
async def view_verified_document(document_id: str, db: AsyncSession = Depends(get_db)):
    document = await _get_authentic_document(db, document_id)
    if not document.signed_file_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verified document not found")

    signed_path = Path(document.signed_file_path)
    if not signed_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verified document file not found")

    return FileResponse(
        signed_path,
        media_type="application/pdf",
        filename=f"veridoc_{document.document_number}.pdf",
        content_disposition_type="inline",
    )


async def _get_authentic_document(db: AsyncSession, document_id: str):
    document = await crud.get_document_by_document_id(db, document_id)
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not document.is_valid:
        await crud.create_audit_log(
            db,
            document_id=document.id,
            employee_id=None,
            event_type="verification_attempt",
            status="invalid",
            message="Document marked invalid.",
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document invalid or altered")
    if document.expiration_date:
        expiration_date = document.expiration_date
        if expiration_date.tzinfo is None:
            expiration_date = expiration_date.replace(tzinfo=timezone.utc)
        if expiration_date < datetime.now(timezone.utc):
            await crud.create_audit_log(
                db,
                document_id=document.id,
                employee_id=None,
                event_type="verification_attempt",
                status="expired",
                message="QR code expired.",
            )
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="QR code expired")

    document_path = Path(document.file_path)
    if not document_path.exists():
        await crud.create_audit_log(
            db,
            document_id=document.id,
            employee_id=None,
            event_type="verification_attempt",
            status="missing_file",
            message="Stored document file was not found.",
        )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored document file not found")

    file_content = document_path.read_bytes()
    signature_valid = verify_digital_signature(
        document_id=document.document_id,
        customer_name=document.customer_name,
        document_number=document.document_number,
        file_content=file_content,
        expected_signature=document.digital_signature,
    )
    if not signature_valid:
        document.is_valid = False
        await db.commit()
        await crud.create_audit_log(
            db,
            document_id=document.id,
            employee_id=None,
            event_type="verification_attempt",
            status="altered",
            message="Digital signature check failed.",
        )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document invalid or altered")

    return document
