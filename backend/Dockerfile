FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY . backend/

RUN mkdir -p backend/uploads

RUN chmod +x backend/entrypoint.sh

EXPOSE 8000

CMD ["backend/entrypoint.sh"]
