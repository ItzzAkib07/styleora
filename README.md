# STYLEORA — Digital Personal Style Atelier

STYLEORA is a premium luxury personal styling platform designed to combine world-class fashion house aesthetics with modern, production-grade digital engineering.

---

## Module 1 Architecture & Sub-Module Roadmap

This repository is organized as a modular monolith adhering strictly to the phased delivery rules:

- **MODULE 1.1: Foundation & Architecture** *(Completed)*
  - Modular monolith project structure: `styleora/` (React/Vite) & `styleora/backend/` (FastAPI).
  - PostgreSQL / Async SQLAlchemy 2.0 connection layer with declarative models & UUIDs.
  - Alembic database migration environment and baseline schema.
  - Centralized Pydantic v2 settings and environment management.
  - Production security headers middleware, CSP, and strict origin-whitelisted CORS.
  - Correlation request tracking (`X-Request-ID`), structured access logging, and sensitive data masking.
  - Centralized exception handlers ensuring uniform JSON envelopes without raw stack trace exposure.
  - Active liveness (`/api/v1/health`) and readiness (`/api/v1/health/ready`) probes.
  - Tailored luxury design tokens and theme (zero Tailwind, non-generic MUI styling).
  - Centralized API client with timeouts, correlation headers, and error normalization.
  - Foundational routing for all 9 public pages plus branded luxury 404 experience.
- **MODULE 1.2: Luxury Website & Landing Page** *(Next)*
- **MODULE 1.3: 3D / GSAP / Video / Motion System**
- **MODULE 1.4: Consultation Booking**
- **MODULE 1.5: Razorpay Payment**
- **MODULE 1.6: Resend Email System**
- **MODULE 1.7: Security / Logging / Reliability**
- **MODULE 1.8: SEO / Performance / Production Hardening**

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with Vite & TypeScript
- **Routing**: React Router v6
- **UI Foundation**: Custom STYLEORA Design System with tailored MUI engine
- **Typography**: Cormorant Garamond (Editorial Display Serif) & Plus Jakarta Sans (Interface Sans)
- **Icons**: Lucide React
- **Motion**: GSAP + ScrollTrigger (integrated for Phase 1.3)

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database & ORM**: PostgreSQL with async SQLAlchemy 2.0 & Alembic
- **Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **Security & Headers**: Starlette custom middleware (CSP, X-Frame-Options, HSTS, strict CORS)
- **Logging**: Structured JSON logging with `X-Request-ID` context propagation

---

## Getting Started

### 1. Backend Setup

```bash
cd styleora/backend

# Create virtual environment (Python 3.12+)
python -m venv .venv
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Run automated tests
pytest -v

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The interactive API documentation is available at:
`http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd styleora

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run local development server
npm run dev

# Build for production
npm run build
```

---

## API Envelopes

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully."
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found.",
    "reference_id": "8f8c9b20-7f2e-4b2e-a34f-0b29efb7a102"
  }
}
```
Stack traces and database error internals are never exposed to clients.
