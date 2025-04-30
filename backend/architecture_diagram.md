Here’s a high-level architecture diagram showing all of your services, plus the Airflow container that updates `ncert_dataset.jsonl` once per day:

```mermaid
flowchart LR
    subgraph DockerComposeStack
        direction LR
        Client[Web / Mobile Client]
        FastAPI["FastAPI Service\n(Uvicorn + app.main)"]
        Postgres[(PostgreSQL\nmcq_db)]
        Prometheus[(Prometheus\n(scrapes /metrics))]
        Grafana[(Grafana\n(visual dashboards))]
        Airflow["Airflow Scheduler & DAGs\n(ncert_pipeline_dag.py)\nupdates ncert_dataset.jsonl daily"]
    end

    Client --> FastAPI
    FastAPI --> Postgres
    FastAPI --> Prometheus
    Prometheus --> Grafana
    Airflow -. shared volume .-> FastAPI
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