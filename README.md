# VeriDoc Backend

VeriDoc is a QR Code-Based Document Authentication and Verification Platform for Union Bank of Cameroon.

## Backend Environment

This repository contains the FastAPI backend environment for VeriDoc, built to support:
- Employee authentication
- Document upload and storage
- QR code generation and verification
- Administrative user management
- Audit logging
- PostgreSQL persistence
- Docker-based local development

## Local Setup

1. Copy `.env.example` to `.env` and adjust values.
2. Run `docker compose up --build`.
3. The API will be available at `http://localhost:8000`.

## API Endpoints

The backend exposes a versioned API under `/api/v1`.

## Notes

This scaffold is the backend foundation only. The UI frontend will be built separately after this environment is validated.
