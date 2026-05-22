FROM python:3.14


WORKDIR /code


COPY ./requirements.txt /code/requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./app /code/app


CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
