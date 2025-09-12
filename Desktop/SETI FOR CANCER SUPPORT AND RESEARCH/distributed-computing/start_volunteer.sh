#!/bin/bash
echo "Starting SETI Cancer Research Volunteer Client..."

# Check Python version
python3 --version

# Install dependencies if needed
if [ ! -f "requirements.txt" ]; then
    echo "Error: requirements.txt not found"
    exit 1
fi

pip3 install -r requirements.txt

# Start volunteer client
echo "Connecting to task server..."
python3 volunteer_client.py --server ws://localhost:8765 --project cancer-genome-2024
