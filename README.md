# VText

## Description
A project to transcribe audio to text utilizing Whisper.

## Setup

### 1. Install Node.js, npm and ffmpeg
Run the following commands to install Node.js, npm and ffmpeg:
```bash
sudo apt install nodejs
sudo apt install npm
```

### 2. Install Python Dependencies
Install the required Node.js packages from the package.json file:
```bash
pip install -r requirements.txt
```

### 3. Install Node.js Dependencies
Install the required Node.js packages from the `package.json` file:
```bash
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory of your project and add the following line:
```ini
SECRET_KEY=your_secret_key
```

### 5. Run it
To start the server, run:
```bash
npm start
```

## Notes
If an NVIDIA graphics card with CUDA is available, it is utilized.
