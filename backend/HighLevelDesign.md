## High-Level Design Document

---

### 1. Introduction

This document describes the high-level architecture, components, data flows, and interactions for the MCQ Generator backend service. The goal is to provide a clear overview of how requests travel from clients through the FastAPI application, into the database and AI generator, and back—while also illustrating how observability and security are integrated.

---

### 2. Architecture Overview

```mermaid
flowchart LR
    Client[Web / Mobile Client]
    subgraph API Layer
      APIGW[(FastAPI UVicorn)]
      Auth[Authentication Service]
      Metrics[/metrics\n(Prometheus Endpoint)/]
    end
    subgraph Business Logic
      Generator[MCQ Generator Module]
      Parser[MCQ Parser]
      Reports[Reports Module]
    end
    subgraph Data Layer
      DB[(PostgreSQL)]
      Corpus[/NCERT JSONL Corpus/]
    end
    subgraph Observability
      Prometheus[(Prometheus)]
      Grafana[(Grafana)]
    end

    Client --> APIGW
    APIGW --> Auth
    APIGW --> Metrics
    APIGW --> Generator
    Generator --> Parser
    Parser --> Reports
    Reports --> DB
    Generator -->|reads| Corpus
    APIGW --> DB
    Prometheus -->|scrapes| Metrics
    Grafana -->|queries| Prometheus
```

---

### 3. Components

#### 3.1 FastAPI Application
- **UVicorn** server hosting  
- **Endpoints**:
  - `/api/register`, `/api/login` → user management
  - `/api/generate-mcqs` → invokes MCQ generation
  - `/api/classes`, `/api/subjects`, `/api/chapters` → metadata
  - `/api/user/report*` → report CRUD
  - `/metrics` → Prometheus scrape endpoint
- **Middleware**:
  - CORS (allow all origins for frontend)
  - `PrometheusMiddleware` for HTTP metrics
  - Startup event: `Base.metadata.create_all(bind=engine)`

#### 3.2 Authentication
- **JWT-based** via `python-jose`
- **Password hashing**: `passlib[bcrypt]`
- `create_access_token` / `decode_access_token`  
- Protected routes depend on `get_current_user` header guard

#### 3.3 MCQ Generator Module
- **`generator.py`**:
  - Loads NCERT corpus (JSONL) once into memory  
  - Builds prompts, calls Google Gemini via `google-generativeai`
  - Retries: pro-model → flash-model fallback on rate limits  
  - Persists raw responses to disk for audit (`raw_responses/`)
- **Parser**:
  - Regex-based extraction of question blocks  
  - Normalizes options, difficulty, and answer

#### 3.4 Reports Module
- **SQLAlchemy model** `ReportModel`  
  - UUID PK, `username`, `mode`, `score`, `total`, `date`, JSON columns  
- **Pydantic schemas** `ReportSchema` / `ReportResponse`  
- **Endpoints**:
  - `POST /api/user/report`
  - `GET /api/user/reports?username=…`
  - `GET /api/user/reports/{id}`
  - `GET /api/user/wrong-questions?username=…`

#### 3.5 Data Storage
- **PostgreSQL**:
  - Tables: `users`, `reports`
  - Connection via `psycopg2-binary`
  - Schema auto-creation (no migrations; future: Alembic)

- **NCERT Corpus**:
  - JSONL file loaded at startup from configurable path

#### 3.6 Observability
- **Prometheus**:
  - Scrapes `/metrics` every 15s
  - Exports metrics:  
    - `starlette_requests_total`, `starlette_request_duration_seconds`,  
    - `starlette_requests_in_progress`, process & Python GC stats
- **Grafana**:
  - Data source: Prometheus  
  - Custom dashboard panels for request rate, p95/p99 latency, in-flight

---

### 4. Data Flows

1. **Client Request**  
   User hits a protected endpoint (e.g. `/api/generate-mcqs`) with Bearer token.
2. **Auth Check**  
   `get_current_user` validates JWT → rejects missing/invalid with 401.
3. **Business Logic**  
   - Generator loads corpus → sends prompt to Gemini → receives raw text.  
   - Parser extracts MCQ objects.
4. **Persistence**  
   For reports, data written to PostgreSQL via SQLAlchemy session.
5. **Response**  
   FastAPI serializes Pydantic models to JSON and returns to client.
6. **Metrics**  
   Each HTTP request is instrumented; Prometheus scrapes metrics; Grafana visualizes.

---

### 5. Technology Stack

| Layer            | Technology                   |
|------------------|------------------------------|
| Web Framework    | FastAPI + Uvicorn            |
| Database         | PostgreSQL                   |
| ORM              | SQLAlchemy                   |
| Auth             | JWT (`python-jose`), Bcrypt  |
| MCQ Generation   | Google Gemini API            |
| Config           | YAML (`PyYAML`) + `.env`     |
| Metrics Exporter | Prometheus client, starlette-exporter |
| Monitoring UI    | Grafana                      |
| Testing          | Pytest, FastAPI TestClient   |

---

### 6. Deployment

- **Containerization** (future): Docker + Docker Compose  
  - Services: `app`, `db`, `node_exporter`, `postgres_exporter`, `prometheus`, `grafana`  
- **Startup**: `uvicorn app.main:app` auto-creates tables  
- **Scaling**: Stateless API allows horizontal scaling behind a load balancer; DB as a single primary (future: replicas)

---

### 7. Security & Configuration

- **Secrets** via environment variables (`.env`)  
- **CORS** wide-open (for prototyping; restrict in production)  
- **HTTPS** termination at ingress or via reverse proxy  
- **Future**:  
  - Rate limiting  
  - Role-based access control  
  - API gateway integration

---

### 8. Next Steps

- **Schema migrations** using Alembic  
- **CI/CD** pipelines (GitHub Actions + DVC)  
- **Alerts** via Prometheus Alertmanager  
- **Enhanced logging** (structured logs, correlation IDs)  
- **API versioning** and backward compatibility  

---

*This high-level design establishes a modular, observable, and secure foundation for the MCQ Generator service.*