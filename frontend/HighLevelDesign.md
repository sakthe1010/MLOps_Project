# 📘 High Level Design (HLD)

## System Overview
This system is split into two major services:

### 1. Frontend (Next.js)
- React-based SPA with protected routing
- Users configure and submit test requests
- Uses `fetch` to call backend REST endpoints

### 2. Backend (FastAPI)
- Handles login, MCQ generation using gemini pro model (LLM), and database management
- Exposes RESTful endpoints for communication

## Design Rationale
- **Functional programming** makes UI easier to maintain
- **Loose-coupling** ensures frontend/backend can evolve independently
- **REST APIs** allow consistent data interchange and logging
- **Docker** enables reproducible builds and isolation

## Key Frontend Pages
- `/dashboard`: Main nav panel
- `/configure`: Inputs for MCQ generation
- `/test`: Displays and scores questions
- `/profile`: Shows test history
- `/review-wrong`: View past mistakes

## Data Flow
User → Frontend (React) → `/api/generate-mcqs` → Backend → LLM → MCQs → Test → Results → `/api/user/report` → DB
