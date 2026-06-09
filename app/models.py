from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="employee", nullable=False)
    is_active = Column(Boolean, default=True)
    date_created = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="uploaded_by")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(128), unique=True, nullable=False, index=True)
    customer_name = Column(String(128), nullable=False)
    document_number = Column(String(128), nullable=False)
    document_type = Column(String(64), nullable=False)
    file_path = Column(String(512), nullable=False)
    signed_file_path = Column(String(512), nullable=True)
    qr_code_path = Column(String(512), nullable=True)
    digital_signature = Column(String(256), nullable=True)
    expiration_date = Column(DateTime(timezone=True), nullable=True)
    is_valid = Column(Boolean, default=True)
    date_uploaded = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    uploaded_by = relationship("Employee", back_populates="documents")
    audit_logs = relationship("AuditLog", back_populates="document")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    event_type = Column(String(64), nullable=False)
    status = Column(String(64), nullable=False)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="audit_logs")
