import os
import yaml
from datetime import datetime
from airflow import DAG
from airflow.operators.bash import BashOperator

# load your external schedule
cfg_path = "/opt/airflow/config/schedule.yaml"
with open(cfg_path) as f:
    cfg = yaml.safe_load(f)
schedule = cfg.get("run_interval", "*/2 * * * *")

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "retries": 0,
}

with DAG(
    dag_id="ncert_pipeline",
    default_args=default_args,
    start_date=datetime(2025, 4, 29),
    schedule_interval=schedule,
    catchup=False,
    tags=["ncert"],
) as dag:

    step1 = BashOperator(
        task_id="step1_download",
        bash_command="cd {{ dag.folder }} && python step1.py"
    )

    step2 = BashOperator(
        task_id="step2_ingest",
        bash_command="cd {{ dag.folder }} && python step2.py"
    )

    step3 = BashOperator(
        task_id="step3_export",
        bash_command="cd {{ dag.folder }} && python step3.py"
    )

    step1 >> step2 >> step3
