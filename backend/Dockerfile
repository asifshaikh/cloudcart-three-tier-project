FROM python:3.13-slim

# tells Python not to write .pyc bytecode files, helping avoid extra cache files in the image
ENV PYTHONDONTWRITEBYTECODE=1
# makes Python send output to stdout and stderr immediately instead of buffering it, so logs appear promptly in Docker
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

COPY app/ ./app/
COPY run.py .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--access-logfile", "-", "run:app"]
