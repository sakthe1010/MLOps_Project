# Design Document – AI Adaptive MCQ Testing Platform

## Purpose
This web application allows students to take fixed or adaptive multiple choice tests generated via LLMs, and to view analytics on performance.

## Architecture
The software follows a **loosely coupled two-tier architecture**:
- Frontend: Next.js (React, functional paradigm)
- Backend: FastAPI exposing REST APIs
- Storage: PostgreSQL for reports and users
- Deployment: Docker Compose with frontend/backend as separate services

## Design Paradigm
Frontend uses **functional programming** via React Hooks (`useState`, `useEffect`).

## Component Mapping

| Component | Path | Description |
|----------|------|-------------|
| LoginPage | `/login` | Authenticates user |
| RegisterPage | `/register` | Register new user | 
| DashboardPage | `/dashboard` | View user dashboard |
| GradePage | `/grade` | Select class |
| SubjectPage | `/subject` | Select subject |
| ChapterPage | `/chapter` | Select chapter |
| ConfigurePage | `/configure` | Choose difficulty, mode |
| TestPage | `/test` | Adaptive or static MCQs |
| ProfilePage | `/profile` | View past tests |
| ReportDetail | `/profile/report/[id]` | View specific test |
| ReviewWrong | `/review-wrong` | List of wrong answers |
| HelpPage | `/help` | Guidlines on running the app |
| AdminLoginPage | `/admin/login` | Authenticates admin |
| AdminDashboardPage | `/admin/dashboard` | View admin dashboard |

## Loose Coupling
The frontend and backend are Dockerized separately and communicate only over REST API calls. No direct data sharing occurs.
