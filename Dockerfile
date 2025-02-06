# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json /app/package.json
RUN npm install

# Install Python, virtual environment, and system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv ffmpeg
RUN rm -rf /var/lib/apt/lists/*

# Copy requirements.txt before creating the virtual environment
COPY requirements.txt /app/

# Create a Python virtual environment
RUN python3 -m venv /app/venv

# Activate the virtual environment and install Python dependencies
RUN /app/venv/bin/pip install -U pip
RUN /app/venv/bin/pip install -r requirements.txt

# Ensure the virtual environment is activated when running the app
ENV PATH="/app/venv/bin:$PATH"

# Copy the rest of the application
COPY . /app

# Expose port 6482
EXPOSE 6482

# Start the application
CMD ["npm", "start"]
