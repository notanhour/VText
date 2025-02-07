FROM node:20-slim

WORKDIR /app

COPY package.json /app/package.json
RUN npm install

RUN apt update && apt install -y python3 python-is-python3 python3-pip python3-venv ffmpeg
RUN rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/

RUN python3 -m venv /app/venv

RUN /app/venv/bin/pip install -U pip
RUN /app/venv/bin/pip install -r requirements.txt

ENV PATH="/app/venv/bin:$PATH"

COPY . /app

EXPOSE 6482

CMD ["npm", "start"]
