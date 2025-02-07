# VText

## Description
A project to transcribe audio to text utilizing Whisper.

## Setup

### 1. Install the Required Packages
Install Node.js & npm & ffmpeg & python3 & python-is-python3 & python3-pip & python3-venv with:
```bash
sudo apt install -y nodejs npm ffmpeg python3 python-is-python3 python3-pip python3-venv
```

### 2. Install Python Dependencies
If you're using an NVIDIA GPU with CUDA, specify the correct CUDA version in the `requirements.txt` file:
```txt
torch --index-url https://download.pytorch.org/whl/cu<YOUR_CUDA_VERSION>
```

For example, if you have CUDA 12.4:
```txt
torch --index-url https://download.pytorch.org/whl/cu124
```

If things don't work out, it's backwards compatible! So, go for another build.

Then install the required Python dependencies from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies
Install the required Node.js packages from the `package.json` file:
```bash
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file in the project root with:
```ini
SECRET_KEY=YOUR_SECRET_KEY
```

### 5. Run it
To start the server, run:
```bash
npm start
```

## Run with Docker

### 0. [Have an NVIDIA GPU?](#2-install-python-dependencies)

### 1. Build the Docker Image
Run the following command to build the Docker image:
```bash
docker build -t vtext .
```

### 2. [Set Up Environment Variables](#4-set-up-environment-variables)


### 3. Run the Container
To run the container, use:
```bash
docker run --env-file .env -p 6482:6482 vtext
```

To run the container in the background:
```bash
docker run -d --env-file .env -p 6482:6482 vtext
```

If an NVIDIA GPU with CUDA is in place, run it with `--gpus all`.

### 4. Stop the Container
To stop the running container, first find its ID:
```bash
docker ps
```

Then stop it using:
```bash
docker stop <CONTAINER_ID>  
```

### 5. Remove Unused Containers
To clean up stopped containers:
```bash
docker container prune
```