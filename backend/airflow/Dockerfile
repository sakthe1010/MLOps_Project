# extend the same base you used for Airflow
FROM apache/airflow:2.7.3

# install all your script dependencies
COPY requirements.txt /
RUN pip install --no-cache-dir -r /requirements.txt

# drop your DAGs into the image (they’ll also be mount-overwritten in dev)
COPY dags/ /opt/airflow/dags/

# ensure config is available
COPY config/ /opt/airflow/config/

USER airflow
