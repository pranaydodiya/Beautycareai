# syntax=docker/dockerfile:1
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEEPFACE_HOME=/cache/deepface \
    FLASK_SKIP_DOTENV=1 \
    PIP_DEFAULT_TIMEOUT=600

# Allow overriding PyPI index via build arg if needed (network mirror)
ARG PIP_INDEX_URL=https://pypi.org/simple

RUN sed -i 's|http://deb.debian.org|https://mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list \
 && sed -i 's|http://security.debian.org|https://mirrors.tuna.tsinghua.edu.cn/debian-security|g' /etc/apt/sources.list \
 && apt-get -o Acquire::Retries=5 -o Acquire::ForceIPv4=true -o Acquire::http::Timeout=120 update \
 && apt-get -o Acquire::Retries=5 -o Acquire::ForceIPv4=true -o Acquire::http::Timeout=120 install -y --no-install-recommends \
    build-essential gcc git curl ffmpeg libsm6 libxext6 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv

RUN pip config set global.timeout 600 \
 && pip config set global.index-url ${PIP_INDEX_URL}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /cache/deepface

EXPOSE 5001
CMD ["python", "face_analysis_deepface.py"]


