# Test Plan for MCQ Generator Backend

### 1. Overview

This document outlines the testing strategy and detailed test cases for the MCQ Generator backend, covering unit tests, integration tests, and system-level acceptance criteria.

---

### 2. Scope

- **Authentication**: Registration, login, JWT issuance/validation
- **MCQ Generation API**: `/api/generate-mcqs` behavior under valid and invalid conditions
- **Metadata Endpoints**: `/api/classes`, `/api/subjects`, `/api/chapters`
- **Reports Feature**: CRUD on `/api/user/report`, `/api/user/reports`, `/api/user/reports/{id}`, `/api/user/wrong-questions`
- **Generator Logic**: Corpus loading, prompt fallback, parsing
- **Schemas**: Pydantic validation for requests and responses
- **Observability**: `/metrics` endpoint

---

### 3. Test Strategy

1. **Unit Tests**
   - Pure functions and utilities (auth, generator, schemas)
2. **Integration Tests**
   - FastAPI endpoints via TestClient, mocking external dependencies
3. **Database Tests**
   - In-memory SQLite for models and report storage
4. **E2E Smoke Tests**
   - Full stack calls (no mocking) against a test database
5. **Performance & Load** *(optional)*
   - Verify latency under concurrent requests

---

### 4. Environment & Tools

- **Framework**: pytest
- **TestClient**: FastAPI’s starlette TestClient (requires httpx)
- **Mocking**: pytest monkeypatch
- **Database**: SQLite in-memory for tests, PostgreSQL for staging/prod
- **Coverage**: pytest-cov (target ≥ 85%)

---

### 5. Detailed Test Cases

| ID   | Feature                          | Scenario                                           | Steps                                                                                       | Expected Result                                    |
|------|----------------------------------|----------------------------------------------------|---------------------------------------------------------------------------------------------|----------------------------------------------------|
| U1   | Auth Utilities                   | Hash & verify password                             | Call `get_password_hash`, then `verify_password` with correct and incorrect passwords      | Correct passwords pass; incorrect fail             |
| U2   | JWT Issuance                     | Create + decode token                              | `create_access_token(sub=alice)`, then `decode_access_token`                                | Returns "alice"                                  |
| U3   | Generator - Corpus Load          | Load JSONL corpus once                             | Prepare small JSONL, call `load_corpus_once`, then `get_chapter_content`                   | Returns expected content                           |
| U4   | Generator - Fallback             | Pro model rate limit, flash fallback               | Mock generativeai to throw `ResourceExhausted` then succeed                                 | Returns flash response and correct model name      |
| U5   | Parser - Valid MCQs              | Parse well-formed raw text                         | Supply sample raw text, call `parse_mcqs`                                                  | List of MCQs with correct fields                   |
| U6   | Parser - Malformed MCQs          | Skip incomplete blocks                             | Raw text missing options or answer                                                          | Returns empty list                                 |
| I1   | Register Endpoint                | New user                                        | POST `/api/register` with form data                                                        | 200 OK, success message                            |
| I2   | Register - duplicate             | Existing username                                   | POST duplicate username                                                                     | 400 error, "Username already exists"             |
| I3   | Login Endpoint                   | Valid credentials                                  | POST `/api/login`                                                                            | 200 OK, token returned                             |
| I4   | Login - invalid                  | Wrong password                                     | POST `/api/login`                                                                            | 401 error                                         |
| I5   | MCQ Generation - auth required   | Missing token                                      | POST `/api/generate-mcqs`                                                                    | 401 Unauthorized                                   |
| I6   | MCQ Generation - valid           | Correct payload + token                            | POST with JWT and valid JSON                                                                | 200 OK, MCQSet JSON                               |
| I7   | Metadata endpoints               | `/api/classes`, `/api/subjects`, `/api/chapters`    | GET each with valid params                                                                  | 200 OK, correct arrays                             |
| I8   | Reports - save                   | POST `/api/user/report`                            | Valid JSON and auth                                                                        | 200 OK, returns new report ID                     |
| I9   | Reports - list                  | GET `/api/user/reports?username=`                  | Valid username                                                                              | 200 OK, array of last 10                         |
| I10  | Reports - detail                 | GET `/api/user/reports/{id}`                       | Valid ID                                                                                    | 200 OK, full report JSON                           |
| I11  | Reports - wrong questions        | GET `/api/user/wrong-questions?username=`          | Valid username                                                                              | 200 OK, flattened list                             |
| I12  | Metrics endpoint                 | GET `/metrics`                                      | Fetch metrics                                                                              | 200 OK, contains `starlette_requests_total`        |

---

### 6. Acceptance Criteria

- **Pass Rate**: All tests pass in CI/CD
- **Coverage**: ≥ 85% lines covered
- **Stability**: No intermittent failures
- **Performance**: Request latency < 200ms for simple endpoints

---

### 7. Execution & Reporting

- Tests run on every `git push` via GitHub Actions
- Coverage report published as part of build
- Failures block merges until fixed

---

*End of Test Plan.*
