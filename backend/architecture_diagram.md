```markdown
# Architecture Diagram

```mermaid
flowchart LR
  subgraph Docker Compose Stack
    direction TB

    Client[Web / Mobile Client]
    FastAPI["FastAPI Service<br/>(Uvicorn + `app.main`)"]
    Postgres[(PostgreSQL<br/>`mcq_db`)]
    Prometheus[(Prometheus<br/>(scrapes `/metrics`))]
    Grafana[(Grafana<br/>(dashboards))]
    Airflow["Airflow Scheduler & DAGs<br/>(`ncert_pipeline_dag.py`)<br/>– updates `ncert_dataset.jsonl` daily"]
  end

  Client -->|HTTP API| FastAPI
  FastAPI -->|reads & writes| Postgres
  FastAPI -->|exposes `/metrics`| Prometheus
  Prometheus -->|data source| Grafana
  Airflow -.->|shared volume| FastAPI
```

**Notes:**

- **FastAPI Service** hosts all REST endpoints (`/api/*`) and `/metrics`.  
- **Airflow** runs in parallel, executing the NCERT ingestion DAG once per day and writing `ncert_dataset.jsonl` to a volume mounted into the FastAPI container.  
- **PostgreSQL** stores user credentials and report data.  
- **Prometheus** scrapes the FastAPI metrics endpoint every 15 s.  
- **Grafana** connects to Prometheus to render real-time dashboards.