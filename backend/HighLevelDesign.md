# High-Level Design (HLD) Document

## Project Overview

This project implements an end-to-end pipeline to automatically generate Multiple-Choice Questions (MCQs) from NCERT textbooks using AI, with an intuitive web interface and robust backend infrastructure.

---

## Project Objectives

- Automate MCQ generation using NCERT textbook content.
- Provide interactive web frontend for users.
- Ensure robust backend architecture with authentication and API integration.
- Enable continuous monitoring and pipeline orchestration through Airflow.
- Adhere to MLOps best practices for scalability, reproducibility, and maintainability.

---

## Architecture Overview

The project comprises three main components:

1. **Data Preparation Pipeline** (Airflow)
2. **Backend Service** (FastAPI)
3. **Frontend Interface** (Interactive Web Portal)

### 1. Data Preparation Pipeline

This pipeline prepares and structures data for MCQ generation.

- **Step 1 (Data Collection)**:
  - Scrapes NCERT PDFs from online sources.
  - Concurrently downloads and stores PDFs locally.

- **Step 2 (Data Extraction & Ingestion)**:
  - Extracts text content from PDFs using PyPDF2 with fallback via pdfplumber.
  - Stores structured data in SQLite (or PostgreSQL) database using SQLAlchemy ORM.

- **Step 3 (Data Export)**:
  - Exports structured data from the database to JSONL format, facilitating downstream AI processing.

This pipeline is orchestrated via Apache Airflow.

### 2. Backend Service

The backend is powered by FastAPI, providing RESTful APIs for frontend consumption.

- **Authentication & User Management**:
  - Secure JWT-based authentication.
  - Password hashing using bcrypt.
  
- **MCQ Generation**:
  - Integrates Google's Gemini API for generative AI.
  - Dynamically generates MCQs based on difficulty levels requested.
  - Parses raw AI responses into structured, JSON-based MCQs.

- **Data Storage**:
  - Uses PostgreSQL managed via SQLAlchemy for storing user data, MCQs, and user activity reports.

- **Monitoring & Observability**:
  - Prometheus instrumentation with Grafana dashboards for real-time monitoring.

### 3. Frontend Interface

- Interactive and intuitive user interface.
- Allows users to register, log in, and generate MCQs.
- Presents structured MCQs clearly and interactively.
- Supports responsive UI design for seamless user experience.

---

## Technology Stack

| Component                  | Technology Used                                   |
|----------------------------|---------------------------------------------------|
| Web Framework              | FastAPI                                           |
| Database                   | PostgreSQL, SQLite                                |
| ORM                        | SQLAlchemy                                        |
| Containerization           | Docker, Docker Compose                            |
| Orchestration & Scheduling | Apache Airflow                                    |
| Monitoring                 | Prometheus, Grafana                               |
| Authentication             | JWT, bcrypt                                       |
| AI Generation              | Google Gemini API                                 |
| Data Processing            | PyPDF2, pdfplumber, BeautifulSoup, Requests       |
| Version Control            | Git, Git LFS                                      |
| Experiment Tracking        | MLflow (planned integration)                      |

---

## Deployment Architecture

- Containerized deployment using Docker and orchestrated via Docker Compose.
- CI/CD pipelines planned for automated deployment and version management.
- Airflow for workflow automation, running daily scheduled data ingestion and export tasks.

---

## Security and Compliance

- API keys and credentials managed securely via environment variables.
- JWT-based authentication with bcrypt hashing.
- Regular database backups and secure handling of user data.

---

## Future Enhancements

- Advanced user analytics for deeper insights into MCQ effectiveness.
- Transition to a fully PostgreSQL-backed data pipeline for greater scalability.

---

## Conclusion

This design ensures a robust, scalable, and maintainable architecture, adhering closely to MLOps best practices, enabling efficient MCQ generation, seamless user interaction, and effective monitoring.
