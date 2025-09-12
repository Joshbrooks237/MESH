#!/usr/bin/env python3
"""
SETI Cancer Research Universe - Setup Script

This script helps users set up the complete SETI Cancer Research Universe
environment including backend, frontend, and distributed computing components.
"""

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

def check_requirements():
    """Check system requirements and dependencies."""
    print("🔍 Checking system requirements...")

    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")

    # Check Node.js
    try:
        node_version = subprocess.check_output(['node', '--version']).decode().strip()
        print(f"✅ Node.js {node_version}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js is required but not found")
        print("   Please install Node.js from https://nodejs.org/")
        return False

    # Check npm
    try:
        npm_version = subprocess.check_output(['npm', '--version']).decode().strip()
        print(f"✅ npm {npm_version}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ npm is required but not found")
        return False

    return True

def install_backend_dependencies():
    """Install backend Node.js dependencies."""
    print("\n📦 Installing backend dependencies...")

    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False

    os.chdir(backend_dir)

    try:
        # Install Node.js dependencies
        subprocess.check_call(['npm', 'install'])
        print("✅ Backend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False
    finally:
        os.chdir("..")

    return True

def install_frontend_dependencies():
    """Install frontend Node.js dependencies."""
    print("\n📦 Installing frontend dependencies...")

    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False

    os.chdir(frontend_dir)

    try:
        # Install Node.js dependencies
        subprocess.check_call(['npm', 'install'])
        print("✅ Frontend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False
    finally:
        os.chdir("..")

    return True

def create_environment_config():
    """Create environment configuration files."""
    print("\n⚙️  Creating environment configuration...")

    # Backend .env
    backend_env = Path("backend/.env")
    if not backend_env.exists():
        env_content = """# SETI Cancer Research Universe - Backend Configuration

# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/seti-cancer-research
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# External Services
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100MB

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# Research Projects
DEFAULT_PROJECT=cancer-genome-2024
MAX_CONCURRENT_TASKS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/server.log
"""
        backend_env.parent.mkdir(exist_ok=True)
        with open(backend_env, 'w') as f:
            f.write(env_content)
        print("✅ Backend .env created")

    # Frontend .env
    frontend_env = Path("frontend/.env")
    if not frontend_env.exists():
        env_content = """# SETI Cancer Research Universe - Frontend Configuration

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_COLLABORATION=true
REACT_APP_ENABLE_DISTRIBUTED_COMPUTING=true

# UI Configuration
REACT_APP_THEME=dark
REACT_APP_CHART_LIBRARY=recharts

# External Services
REACT_APP_ANALYTICS_ID=your-analytics-id
REACT_APP_SUPPORT_EMAIL=support@seti-cancer-research.org
"""
        frontend_env.parent.mkdir(exist_ok=True)
        with open(frontend_env, 'w') as f:
            f.write(env_content)
        print("✅ Frontend .env created")

def create_directories():
    """Create necessary directories."""
    print("\n📁 Creating project directories...")

    directories = [
        "backend/logs",
        "backend/uploads",
        "frontend/public",
        "frontend/src",
        "distributed-computing/logs",
        "ai-models/models",
        "ai-models/data",
        "research-data",
        "backups"
    ]

    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✅ Created {directory}")

def generate_ssl_certificates():
    """Generate self-signed SSL certificates for development."""
    print("\n🔐 Generating SSL certificates...")

    cert_dir = Path("backend/ssl")
    cert_dir.mkdir(exist_ok=True)

    try:
        # Generate private key
        subprocess.check_call([
            'openssl', 'genpkey', '-algorithm', 'RSA', '-out', 'backend/ssl/server.key', '-pkcs8'
        ])

        # Generate certificate
        subprocess.check_call([
            'openssl', 'req', '-new', '-x509', '-key', 'backend/ssl/server.key',
            '-out', 'backend/ssl/server.crt', '-days', '365', '-subj',
            '/C=US/ST=Research/L=Internet/O=SETI Cancer Research/CN=localhost'
        ])

        print("✅ SSL certificates generated")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  OpenSSL not found. SSL certificates not generated.")
        print("   You can install OpenSSL or use HTTP for development.")

def create_docker_compose():
    """Create Docker Compose configuration."""
    print("\n🐳 Creating Docker Compose configuration...")

    docker_compose = {
        "version": "3.8",
        "services": {
            "backend": {
                "build": "./backend",
                "ports": ["5000:5000"],
                "environment": [
                    "NODE_ENV=development",
                    "MONGODB_URI=mongodb://mongodb:27017/seti-cancer-research"
                ],
                "depends_on": ["mongodb", "redis"],
                "volumes": ["./backend/uploads:/app/uploads"]
            },
            "frontend": {
                "build": "./frontend",
                "ports": ["3000:3000"],
                "depends_on": ["backend"]
            },
            "mongodb": {
                "image": "mongo:6.0",
                "ports": ["27017:27017"],
                "volumes": ["mongodb_data:/data/db"]
            },
            "redis": {
                "image": "redis:7.0-alpine",
                "ports": ["6379:6379"]
            },
            "task-server": {
                "build": "./distributed-computing",
                "ports": ["8765:8765"],
                "depends_on": ["backend"],
                "environment": ["PYTHONPATH=/app"]
            }
        },
        "volumes": {
            "mongodb_data": {}
        }
    }

    with open("docker-compose.yml", 'w') as f:
        json.dump(docker_compose, f, indent=2)

    print("✅ Docker Compose configuration created")

def create_startup_scripts():
    """Create startup scripts for different components."""
    print("\n🚀 Creating startup scripts...")

    # Backend startup script
    backend_script = """#!/bin/bash
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
"""

    with open("backend/start.sh", 'w') as f:
        f.write(backend_script)
    os.chmod("backend/start.sh", 0o755)

    # Frontend startup script
    frontend_script = """#!/bin/bash
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
"""

    with open("frontend/start.sh", 'w') as f:
        f.write(frontend_script)
    os.chmod("frontend/start.sh", 0o755)

    # Volunteer client startup script
    volunteer_script = """#!/bin/bash
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
"""

    with open("distributed-computing/start_volunteer.sh", 'w') as f:
        f.write(volunteer_script)
    os.chmod("distributed-computing/start_volunteer.sh", 0o755)

    print("✅ Startup scripts created")

def print_success_message():
    """Print success message with next steps."""
    print("\n" + "="*60)
    print("🎉 SETI Cancer Research Universe Setup Complete!")
    print("="*60)
    print()
    print("Your SETI Cancer Research Universe is now ready!")
    print()
    print("🚀 Quick Start:")
    print("1. Start the backend:   cd backend && ./start.sh")
    print("2. Start the frontend:  cd frontend && ./start.sh")
    print("3. Start task server:   cd distributed-computing && python3 task_server.py")
    print("4. Join as volunteer:   cd distributed-computing && ./start_volunteer.sh")
    print()
    print("📱 Access your universe:")
    print("• Main Hub:     http://localhost:3000")
    print("• API Docs:     http://localhost:5000/api/health")
    print("• Task Server:  ws://localhost:8765")
    print()
    print("📚 Documentation:")
    print("• README:       Check the main README.md")
    print("• API Docs:     Visit /api/docs when backend is running")
    print("• Volunteer:    Read distributed-computing/README.md")
    print()
    print("🤝 Contribute to cancer research today!")
    print("   Every CPU cycle brings us closer to healing humanity.")
    print()
    print("="*60)

def main():
    parser = argparse.ArgumentParser(description='SETI Cancer Research Universe Setup')
    parser.add_argument('--skip-deps', action='store_true',
                       help='Skip dependency installation')
    parser.add_argument('--docker', action='store_true',
                       help='Create Docker configuration only')

    args = parser.parse_args()

    print("🌟 SETI Cancer Research Universe Setup")
    print("=====================================")
    print("Healing humanity through collaborative science")
    print()

    # Change to project root
    os.chdir(Path(__file__).parent)

    if not check_requirements():
        sys.exit(1)

    create_directories()
    create_environment_config()

    if not args.skip_deps:
        if not install_backend_dependencies():
            sys.exit(1)
        if not install_frontend_dependencies():
            sys.exit(1)

    if args.docker:
        create_docker_compose()
    else:
        generate_ssl_certificates()
        create_startup_scripts()

    print_success_message()

if __name__ == '__main__':
    main()
