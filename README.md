
# DocuMind AI — Intelligent Document Processing & Compliance Co-Pilot

An AI-powered document intelligence platform for automated document extraction, classification, validation, compliance monitoring and business analytics.

## Overview

DocuMind AI transforms unstructured business documents into structured, actionable information.

The platform combines React, TypeScript, Python, FastAPI, OCR and large language models to analyze invoices, receipts, contracts and business reports.

It identifies missing information, detects inconsistencies, highlights potential compliance concerns and provides an interactive environment for exploring document intelligence insights.

## Core Features

- Document upload and processing.
- PDF, TXT and image document support.
- OCR-based extraction from scanned documents and images.
- Automated document classification.
- Structured information extraction.
- Invoice and receipt validation.
- Potential compliance issue detection.
- AI-powered document question answering.
- Interactive analytics dashboard.
- Document repository management.
- CSV reporting and export.
- SQLite development database with PostgreSQL support.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- CSS3
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- REST APIs
- Pydantic

### Artificial Intelligence & Data Processing
- OpenAI API
- Tesseract OCR
- PyMuPDF
- Pandas
- Regular-expression-based extraction
- Rule-based document classification

### Database
- SQLite
- PostgreSQL-compatible SQLAlchemy configuration

## Architecture

```text
React + TypeScript
        |
        v
     Vite UI
        |
        v
   FastAPI REST API
        |
        +------ Document Processing
        |
        +------ OCR Extraction
        |
        +------ Classification Engine
        |
        +------ Validation Engine
        |
        +------ OpenAI Integration
        |
        v
     SQLAlchemy
        |
        v
 SQLite / PostgreSQL
```

## Project Structure

```text
AI-Document-Intelligence-Compliance-CoPilot/
|
|-- frontend/
|   |-- src/
|   |   |-- services/
|   |   |   |-- api.ts
|   |   |-- App.tsx
|   |   |-- main.tsx
|   |   |-- styles.css
|   |-- index.html
|   |-- package.json
|   |-- tsconfig.json
|   |-- vite.config.ts
|
|-- backend/
|   |-- uploads/
|   |-- main.py
|   |-- requirements.txt
|   |-- .env.example
|
|-- .gitignore
|-- README.md
```

## Getting Started

### Prerequisites

Install:

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- Git
- Tesseract OCR (for image and scanned PDF processing)

### 1. Clone the repository

```bash
git clone https://github.com/Regalson001/AI-Document-Intelligence-Compliance-CoPilot.git

cd AI-Document-Intelligence-Compliance-CoPilot
```

### 2. Configure the backend

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
venv\Scripts\activate.bat
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and configure your environment variables.

### 3. Start the backend

From the backend directory:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API documentation:

http://127.0.0.1:8000/docs

Health endpoint:

http://127.0.0.1:8000/api/health

### 4. Start the frontend

Open a second terminal in the project root:

```bash
cd frontend

npm install

npm run dev
```

Open:

http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Backend health |
| GET | /api/documents | Retrieve documents |
| POST | /api/documents/upload | Upload and process |
| DELETE | /api/documents/{id} | Delete document |
| GET | /api/analytics | Analytics data |
| POST | /api/chat | Ask document questions |
| GET | /api/export/csv | Export report |

## Environment Variables

| Variable | Purpose |
|---|---|
| DATABASE_URL | Database connection |
| OPENAI_API_KEY | Optional AI integration |
| OPENAI_MODEL | AI model selection |
| MAX_UPLOAD_SIZE | Upload size limit |
| FRONTEND_ORIGIN | Frontend CORS origin |
| TESSERACT_CMD | Optional OCR executable path |

## Development Roadmap

- [x] React and TypeScript interface
- [x] FastAPI backend
- [x] Document upload
- [x] PDF and image extraction
- [x] OCR integration
- [x] Document classification
- [x] Structured field extraction
- [x] Validation and compliance alerts
- [x] AI assistant integration
- [x] Analytics dashboard
- [x] CSV export
- [ ] Authentication and role-based access control
- [ ] Advanced machine learning classification
- [ ] Semantic search and vector embeddings
- [ ] Background processing and task queues
- [ ] Production deployment
- [ ] Automated testing and CI/CD

## Security Considerations

This repository is a development and demonstration project.

Before production use, implement authentication, authorization, encrypted storage, secure file handling, audit logging, rate limiting, retention policies and comprehensive security testing.

Automated compliance flags are preliminary indicators and must be reviewed by qualified personnel.

## Portfolio Purpose

This project demonstrates practical experience in:

- Full-stack application development.
- AI engineering and LLM integration.
- Python backend development.
- REST API engineering.
- Machine learning foundations.
- OCR and intelligent document processing.
- Data extraction and validation.
- Business analytics.
- Database integration.
- Software architecture.

## Author

**Stephen Oyugi Nyarangi**

AI Automation Engineer | Machine Learning Engineer | Full-Stack Developer

- GitHub: https://github.com/Regalson001
- LinkedIn: https://linkedin.com/in/stephenoyugi001

---

Built with React, TypeScript, Python and AI.
