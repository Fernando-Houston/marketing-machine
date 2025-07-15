FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY schema.sql .
COPY init_db.py .

CMD ["python", "init_db.py"]
