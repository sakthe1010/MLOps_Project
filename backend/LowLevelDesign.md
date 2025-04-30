# Low-Level Design (LLD) Document

This document provides detailed specifications and definitions of internal components and API interfaces for the NCERT MCQ generation application.

---

## Backend Components

### Database Models (PostgreSQL with SQLAlchemy)

#### User Table

```sql
users
├── id (Integer, Primary Key)
├── username (String, Unique)
└── hashed_password (String)
```

#### Report Table

```sql
reports
├── id (UUID, Primary Key)
├── username (String, Indexed)
├── mode (String)
├── score (Integer)
├── total (Integer)
├── date (DateTime)
├── context_json (JSONB)
└── wrong_questions (JSONB)
```

---

## API Endpoint Definitions

Base URL: `/api`

### Authentication

#### POST `/register`

- **Inputs**:
  - `username`: string (form)
  - `password`: string (form)
- **Output**:
  - Success: `{ msg: "User registered successfully." }`

#### POST `/login`

- **Inputs**:
  - `username`: string (form)
  - `password`: string (form)
- **Output**:
  - Success: `{ access_token: string, token_type: "bearer" }`

---

### MCQ Generation

#### POST `/generate-mcqs`

- **Inputs (JSON)**:

```json
{
  "class_": "10",
  "subject": "Math",
  "chapter": "Chapter 1",
  "difficulty_counts": {
    "easy": 5,
    "medium": 3,
    "hard": 2
  }
}
```

- **Output (JSON)**:

```json
{
  "class_": "10",
  "subject": "Math",
  "chapter": "Chapter 1",
  "difficulty": "mixed",
  "model_used": "gemini-pro",
  "mcqs": [
    {
      "question": "Question text?",
      "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
      "answer": "A",
      "difficulty": "easy"
    }
  ]
}
```

---

### Metadata APIs

#### GET `/classes`

- **Output**: `{ classes: ["1", "2", ..., "12"] }`

#### GET `/subjects?class=10`

- **Output**: `{ subjects: ["Math", "Science"] }`

#### GET `/chapters?class=10&subject=Math`

- **Output**: `{ chapters: ["Chapter 1", "Chapter 2"] }`

---

### User Reports

#### POST `/user/report`

- **Inputs (JSON)**:

```json
{
  "username": "user1",
  "mode": "practice",
  "score": 8,
  "total": 10,
  "date": "2025-05-01T12:00:00Z",
  "context_json": {},
  "wrong_questions": []
}
```
- **Output**: (saved report with UUID)

#### GET `/user/reports?username=user1`

- **Output**: List of last 10 reports.

#### GET `/user/reports/{report_id}`

- **Output**: Single report details.

#### GET `/user/wrong-questions?username=user1`

- **Output**: Aggregated list of wrong questions.

---

## Error Handling

- Uses standard HTTP status codes:
  - `200 OK`: Successful requests
  - `400 Bad Request`: Client-side input errors
  - `401 Unauthorized`: Invalid or expired tokens
  - `404 Not Found`: Data not found
  - `500 Internal Server Error`: Server-side errors

---

## Monitoring and Logging

- All endpoints instrumented with Prometheus middleware.
- Metrics accessible at `/metrics`.

---

## Data Pipeline (Airflow Tasks)

### step1_download

- Scrapes and downloads PDFs.

### step2_ingest

- Parses PDFs, extracts text, and stores in SQLite DB.

### step3_export

- Exports DB content to JSONL file.

---

## Security and Configurations

- Environment variables and YAML-based config management.
- JWT with secure secret management.

---

## Architecture Diagram

```plaintext
+------------------------------------------------+
|                 Web Frontend                   |
+--------------------+---------------------------+
                     |
                     |
           RESTful APIs via HTTP
                     |
+--------------------v---------------------------+
|                FastAPI Backend                 |
|------------------------------------------------|
| - JWT Authentication                           |
| - MCQ Generation (Gemini API Integration)      |
| - User Management & Reports                    |
| - Prometheus Metrics Exposure                  |
+--------------------+---------------------------+
       |                               |
       | SQLAlchemy ORM (PostgreSQL)   | SQLAlchemy ORM (SQLite)
       |                               |
+------v-------+              +--------v---------+
| PostgreSQL   |              | SQLite DB        |
| (Users,      |              | (NCERT PDF       |
| Reports,     |              |  Content)        |
| Questions,   |              +--------^---------+
| Metadata)    |                       |
+--------------+              +--------v---------+
                              | Airflow DAG      |
                              |------------------|
                              | - PDF Scraping   |
                              | - PDF Parsing    |
                              | - JSONL Export   |
                              +------------------+
```

---

## Conclusion

This LLD ensures clear and detailed guidance for backend development, API integrations, and data management, facilitating ease of development, maintenance, and scalability.
