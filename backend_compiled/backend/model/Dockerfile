# Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy all of your source
COPY . .

# run uvicorn on container startup
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
