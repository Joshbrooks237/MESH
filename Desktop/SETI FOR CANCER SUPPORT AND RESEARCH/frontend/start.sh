#!/bin/bash
echo "Starting SETI Cancer Research Frontend..."

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

# Start the development server
echo "Starting development server on port 3000..."
npm start
