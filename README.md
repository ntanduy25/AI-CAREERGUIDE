# AI CareerGuide (Capstone Project C1SE.71)

Production-minded monorepo foundation for an explainable vocational career guidance and major recommendation platform for Vietnamese high school students (Grades 11–12).

## Monorepo Structure

```text
backend/
  app/
    ai/
    api/
      v1/
    core/
    db/
    models/
    repositories/
    schemas/
    services/
  alembic/
  tests/
frontend/
  src/
    components/
    features/
    hooks/
    pages/
    routes/
    services/
    types/
```

## Tech Stack

- Backend: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Pytest
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router
- DB: PostgreSQL 16 + pgvector (Docker image)
- AI/RAG: Optional service with deterministic fallback and timeout

## Key Implemented Foundations

- JWT authentication with Argon2 hashing
- Student profile + consent tracking
- Versioned assessments and deterministic RIASEC scoring (`[R, I, A, S, E, C]`)
- Academic grade storage and Z-score standardization with safe zero-std handling
- Deterministic 3-pillar ranking:
  - `Score_Major = 0.45*RIASEC + 0.35*Academic + 0.20*Preference`
  - cosine similarity, normalization, explicit tie-breaking
- Recommendation run persistence with formula version
- Major taxonomy model with metadata/versioning fields
- Optional roadmap RAG with 8s timeout and deterministic template fallback when AI key missing/fails
- Admin staging workflow (`import_batches`, `staged_major_records`) with `PENDING` defaults and review actions
- Seeded **illustrative demo data only** (not official MOET references/mappings)

## Run with Docker Compose

1. Copy environment template:

```bash
cp .env.example .env
```

2. Start stack:

```bash
docker compose up --build
```

3. Verify:

```bash
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/health/ready
```

4. Backend API docs:

```text
http://localhost:8000/docs
```

5. Frontend app:

```text
http://localhost:5173
```

## Backend Local Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## Frontend Local Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Migrations

- Initial migration: `backend/alembic/versions/0001_initial.py`
- Apply:

```bash
cd backend
alembic upgrade head
```

## Tests

Run targeted backend tests:

```bash
cd backend
pytest tests/unit/test_recommendation_engine.py tests/integration/test_api_workflow.py
```

## Deterministic Recommendation Verification

- Unit tests validate ranking order, tie behavior, zero vectors, and score helper edge cases.
- Integration flow verifies auth + recommendation endpoint response contract.

## Admin Ingestion Review Workflow

- Create batch (admin only)
- New staged records saved as `PENDING`
- Review endpoint supports approve/reject
- Approved records can be promoted into production `majors`
- Duplicate detection on `(major_name, moet_code_level_iv)`

## Known Limitations

- RAG currently uses deterministic fallback template as baseline; live retrieval/LLM connector is intentionally optional.
- Admin ingestion parser currently accepts structured payloads and citations; PDF/Excel parser extraction pipeline is not fully implemented yet.
- MOET and legal references are modeled as metadata and marked for verification; no official reference values are embedded.
