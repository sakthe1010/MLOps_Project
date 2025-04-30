# Low Level Design (LLD): API I/O Specifications

---

## 1. POST /api/login

**Purpose:** User login and token generation

### Request (Form Data)
```json
{
  "username": "user@example.com",
  "password": "user_password"
}
```

### Response
```json
{
  "access_token": "<JWT access token>"
}
```
**Used in:** /login page → saved in localStorage

## 2. POST /api/register

**Purpose:** Register a new user

### Request (Form Data)
```json
{
  "username": "user@example.com",
  "password": "user_password",
  "name": "John Doe"
}
```
### Response
```json
{
  "message": "Registration successful"
}
```
**Used in:** /register page → redirects to /login

## 3. GET /api/classes
**Purpose:** Get available class list

### Response
```json
{
  "classes": [6, 7, 8, 9, 10]
}
```
**Used in:** /grade page → dropdown population

## 4. GET /api/subjects?class=10
**Purpose:** Get subject list for a class

**Query Param:**
class: number (e.g. 10)

### Response
```json
{
  "subjects": ["math", "science", "english"]
}
```
**Used in:** /subject page → subject card grid

## 5. GET /api/chapters?class=10&subject=math
**Purpose:** Get chapters for a selected subject and class

**Query Params:**
class: number
subject: string

### Response
```json
{
  "chapters": ["Chapter 1: Real Numbers", "Chapter 2: Polynomials"]
}
```
**Used in:** /chapter page → chapter selection

## 6. POST /api/generate-mcqs
**Purpose:** Generate MCQs using OpenAI API based on user config

### Request
```json
{
  "class_": "10",
  "subject": "science",
  "chapter": "Light",
  "difficulty_counts": {
    "easy": 3,
    "medium": 4,
    "hard": 3
  },
  "mode": "practice",
  "difficulty": "Adaptive"
}
```
### Response
```json
{
  "mcqs": [
    {
      "question": "What is refraction?",
      "options": { "A": "Bending of light", "B": "...", "C": "...", "D": "..." },
      "answer": "A",
      "difficulty": "medium"
    },
    ...
  ]
}
```
**Used in:** /configure → /test

## 7. POST /api/user/report
**Purpose:** Store the result of a completed test

### Request
```json
{
  "username": "alice",
  "mode": "practice",
  "score": 7,
  "total": 10,
  "date": "2025-04-30T14:15:22Z",
  "context_json": {
    "class_": "10",
    "subject": "science",
    "chapter": "Light",
    "difficulty_counts": { "easy": 5, "medium": 3, "hard": 2 },
    "mode": "practice"
  },
  "wrong_questions": [
    { "question": "What is refraction?", "selected": "A", "correct": "C" }
  ]
}
```

### Response
```json
{
  "id": "report-uuid"
}
```
**Used in:** /test page on test completion

## 8. GET /api/user/reports?username=alice
**Purpose:** Get all reports for a user

**Query Param:**
username: string

### Response
```json
[
  {
    "id": "report-id",
    "score": 8,
    "total": 10,
    "date": "...",
    "context_json": { ... },
    "mode": "test"
  },
  ...
]
```
**Used in:** /profile page → for report list

## 9. GET /api/user/reports/{id}
**Purpose:** Get details for one report

**Path Param:**
id: string (UUID)

### Response
```json
{
  "id": "...",
  "username": "alice",
  "mode": "practice",
  "score": 7,
  "total": 10,
  "date": "...",
  "context_json": { ... },
  "wrong_questions": [
    {
      "question": "What is refraction?",
      "selected": "A",
      "correct": "C"
    }
  ]
}
```
**Used in:** /profile/report/[id]

## 10. GET /api/user/wrong-questions?username=alice
**Purpose:** Returns flattened list of all wrong questions by user

### Response
```json
[
  {
    "question": "What is refraction?",
    "selected": "A",
    "correct": "C"
  },
  ...
]
```
**Used in:** /review-wrong page