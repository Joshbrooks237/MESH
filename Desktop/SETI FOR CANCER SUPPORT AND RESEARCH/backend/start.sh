#!/bin/bash
echo "Starting SETI Cancer Research Backend..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please run setup.py first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port 5000..."
npm start
