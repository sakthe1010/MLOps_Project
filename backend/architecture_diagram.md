Here’s a high-level architecture diagram showing all of your services, plus the Airflow container that updates `ncert_dataset.jsonl` once per day:

```mermaid
flowchart LR
  subgraph Docker Compose Stack
    style Docker Compose Stack fill:#f9f,stroke:#333,stroke-width:1px

    CLIENT[Web / Mobile Client]
    FASTAPI[FastAPI Service<br/>(Uvicorn + app.main)]
    POSTGRES[(PostgreSQL<br/>mcq_db)]
    AIRFLOW[Airflow Scheduler & DAGs<br/>(ncert_pipeline_dag.py)<br/>→ updates ncert_dataset.jsonl daily]
    PROM[Prometheus<br/>(scrapes /metrics)]
    GRAF[Grafana<br/>(visual dashboards)]
  end

  CLIENT -- “POST/GET HTTP” → FASTAPI
  FASTAPI -- “reads/writes” → POSTGRES
  FASTAPI -- “/metrics” → PROM
  PROM -- “Scrape & store” → GRAF
  AIRFLOW -. “shared volume” .-> FASTAPI
```

- **FastAPI Service**  
  - Hosts all your `/api/*` endpoints and `/metrics`  
  - Mounted with the same volume as Airflow’s DAG folder so it always sees the latest `ncert_dataset.jsonl`

- **Airflow Container**  
  - Runs `ncert_pipeline_dag.py` on a daily schedule  
  - Reads raw NCERT sources (PDFs/DB), writes out `ncert_dataset.jsonl` into a shared volume

- **PostgreSQL**  
  - Stores `users` and `reports` tables  

- **Prometheus & Grafana**  
  - Prometheus scrapes FastAPI’s `/metrics` every 15 s  
  - Grafana connects to Prometheus for real-time monitoring dashboards  

All of these run side-by-side under Docker Compose, with a shared volume between the **airflow** and **model** services for the daily-updated NCERT dataset.