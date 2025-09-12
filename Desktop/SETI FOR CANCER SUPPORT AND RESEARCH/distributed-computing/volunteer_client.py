#!/usr/bin/env python3
"""
SETI Cancer Research Universe - Volunteer Computing Client

This client allows volunteers to contribute their computer's processing power
to cancer research projects, similar to SETI@home but focused on cancer research.

Usage:
    python volunteer_client.py --project cancer-genome-2024
    python volunteer_client.py --detach  # Run in background
"""

import argparse
import asyncio
import json
import logging
import multiprocessing
import os
import platform
import psutil
import socket
import sys
import time
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

import requests
import websockets
from cryptography.fernet import Fernet

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('volunteer_client.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class VolunteerClient:
    def __init__(self, server_url: str = "ws://localhost:5000", project: str = "default"):
        self.server_url = server_url
        self.project = project
        self.client_id = str(uuid.uuid4())
        self.system_info = self._get_system_info()
        self.is_running = False
        self.current_task = None
        self.encryption_key = self._generate_key()

        # Performance tracking
        self.stats = {
            'tasks_completed': 0,
            'cpu_time_used': 0,
            'data_processed': 0,
            'uptime': 0,
            'start_time': datetime.now()
        }

    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information for profiling."""
        return {
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'processor': platform.processor(),
            'cpu_count': multiprocessing.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'hostname': socket.gethostname(),
            'ip_address': self._get_ip_address()
        }

    def _get_ip_address(self) -> str:
        """Get the local IP address."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"

    def _generate_key(self) -> bytes:
        """Generate encryption key for secure communication."""
        return Fernet.generate_key()

    def _encrypt_data(self, data: str) -> str:
        """Encrypt data before sending."""
        f = Fernet(self.encryption_key)
        return f.encrypt(data.encode()).decode()

    def _decrypt_data(self, encrypted_data: str) -> str:
        """Decrypt received data."""
        f = Fernet(self.encryption_key)
        return f.decrypt(encrypted_data.encode()).decode()

    async def connect(self):
        """Connect to the research server."""
        logger.info(f"Connecting to {self.server_url} as volunteer {self.client_id}")

        try:
            async with websockets.connect(f"{self.server_url}/volunteer") as websocket:
                # Send registration message
                registration = {
                    'type': 'register',
                    'client_id': self.client_id,
                    'project': self.project,
                    'system_info': self.system_info,
                    'timestamp': datetime.now().isoformat()
                }

                await websocket.send(json.dumps(registration))
                logger.info("Registration sent to server")

                # Main communication loop
                self.is_running = True
                while self.is_running:
                    try:
                        message = await websocket.recv()
                        await self._handle_message(websocket, json.loads(message))
                    except websockets.exceptions.ConnectionClosed:
                        logger.warning("Connection lost, attempting to reconnect...")
                        break
                    except json.JSONDecodeError as e:
                        logger.error(f"Invalid message received: {e}")
                        continue

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            await asyncio.sleep(5)  # Wait before retrying

    async def _handle_message(self, websocket, message: Dict[str, Any]):
        """Handle incoming messages from the server."""
        msg_type = message.get('type')

        if msg_type == 'task':
            await self._handle_task(websocket, message)
        elif msg_type == 'status_request':
            await self._send_status(websocket)
        elif msg_type == 'stop':
            logger.info("Received stop command from server")
            self.is_running = False
        elif msg_type == 'ping':
            await websocket.send(json.dumps({'type': 'pong', 'client_id': self.client_id}))
        else:
            logger.warning(f"Unknown message type: {msg_type}")

    async def _handle_task(self, websocket, task_data: Dict[str, Any]):
        """Handle a computing task from the server."""
        task_id = task_data.get('task_id')
        task_type = task_data.get('task_type')
        task_payload = task_data.get('payload')

        logger.info(f"Received task {task_id} of type {task_type}")
        self.current_task = task_id

        try:
            # Process the task based on type
            if task_type == 'protein_folding':
                result = await self._process_protein_folding(task_payload)
            elif task_type == 'genetic_analysis':
                result = await self._process_genetic_analysis(task_payload)
            elif task_type == 'drug_screening':
                result = await self._process_drug_screening(task_payload)
            elif task_type == 'image_analysis':
                result = await self._process_image_analysis(task_payload)
            else:
                raise ValueError(f"Unknown task type: {task_type}")

            # Send result back to server
            response = {
                'type': 'task_result',
                'client_id': self.client_id,
                'task_id': task_id,
                'result': result,
                'processing_time': time.time(),
                'timestamp': datetime.now().isoformat()
            }

            await websocket.send(json.dumps(response))

            # Update stats
            self.stats['tasks_completed'] += 1
            logger.info(f"Task {task_id} completed successfully")

        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")

            # Send error report
            error_response = {
                'type': 'task_error',
                'client_id': self.client_id,
                'task_id': task_id,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

            await websocket.send(json.dumps(error_response))

        finally:
            self.current_task = None

    async def _process_protein_folding(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process protein folding simulation task."""
        logger.info("Processing protein folding simulation...")

        # Simulate protein folding computation
        sequence = payload.get('sequence', '')
        simulation_time = payload.get('simulation_time', 1000)

        # In a real implementation, this would run molecular dynamics simulation
        # For demo purposes, we'll simulate computation time
        await asyncio.sleep(min(simulation_time / 1000, 10))  # Simulate processing

        # Mock result
        result = {
            'folded_structure': f"simulated_structure_for_{sequence[:10]}",
            'energy_score': -1250.5,
            'stability_index': 0.85,
            'computation_time': simulation_time
        }

        self.stats['cpu_time_used'] += simulation_time / 1000
        return result

    async def _process_genetic_analysis(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process genetic variant analysis task."""
        logger.info("Processing genetic analysis...")

        variants = payload.get('variants', [])
        reference_genome = payload.get('reference_genome', 'hg38')

        # Simulate genetic analysis
        await asyncio.sleep(len(variants) * 0.01)  # Simulate processing based on variant count

        # Mock analysis results
        result = {
            'variants_analyzed': len(variants),
            'pathogenic_variants': len([v for v in variants if 'pathogenic' in str(v).lower()]),
            'novel_mutations': len(variants) // 10,
            'conservation_scores': [0.95, 0.87, 0.92, 0.78],
            'functional_predictions': ['damaging', 'tolerated', 'damaging', 'tolerated']
        }

        self.stats['data_processed'] += len(variants)
        return result

    async def _process_drug_screening(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process drug screening simulation task."""
        logger.info("Processing drug screening...")

        compounds = payload.get('compounds', [])
        target_protein = payload.get('target_protein', '')

        # Simulate drug screening
        await asyncio.sleep(len(compounds) * 0.005)  # Simulate processing

        # Mock screening results
        result = {
            'compounds_screened': len(compounds),
            'hits_found': len(compounds) // 50,  # 2% hit rate
            'binding_affinities': [-8.5, -7.2, -9.1, -6.8],
            'top_compounds': compounds[:5] if compounds else [],
            'docking_scores': [85.2, 78.9, 92.1, 71.5]
        }

        return result

    async def _process_image_analysis(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Process medical image analysis task."""
        logger.info("Processing medical image analysis...")

        images = payload.get('images', [])
        analysis_type = payload.get('analysis_type', 'tumor_detection')

        # Simulate image analysis
        await asyncio.sleep(len(images) * 0.1)  # Simulate processing

        # Mock analysis results
        result = {
            'images_processed': len(images),
            'tumors_detected': len(images) // 3,
            'confidence_scores': [0.92, 0.87, 0.95, 0.78],
            'regions_of_interest': [
                {'x': 100, 'y': 150, 'width': 50, 'height': 50},
                {'x': 200, 'y': 100, 'width': 40, 'height': 60}
            ],
            'classification_results': ['malignant', 'benign', 'malignant', 'suspicious']
        }

        self.stats['data_processed'] += len(images)
        return result

    async def _send_status(self, websocket):
        """Send current status to server."""
        status = {
            'type': 'status',
            'client_id': self.client_id,
            'is_active': True,
            'current_task': self.current_task,
            'system_load': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory().percent,
            'stats': self.stats,
            'timestamp': datetime.now().isoformat()
        }

        await websocket.send(json.dumps(status))

    def run(self):
        """Main run method."""
        logger.info("Starting SETI Cancer Research Volunteer Client")
        logger.info(f"Client ID: {self.client_id}")
        logger.info(f"Project: {self.project}")
        logger.info(f"System: {self.system_info['platform']} {self.system_info['architecture']}")

        # Run the async event loop
        asyncio.run(self.connect())

def main():
    parser = argparse.ArgumentParser(description='SETI Cancer Research Volunteer Client')
    parser.add_argument('--server', default='ws://localhost:5000',
                       help='Server WebSocket URL')
    parser.add_argument('--project', default='default',
                       help='Research project to contribute to')
    parser.add_argument('--detach', action='store_true',
                       help='Run in background (detach from terminal)')

    args = parser.parse_args()

    client = VolunteerClient(args.server, args.project)

    if args.detach:
        # Daemonize the process
        try:
            pid = os.fork()
            if pid > 0:
                print(f"Volunteer client started in background (PID: {pid})")
                sys.exit(0)
        except OSError as e:
            logger.error(f"Fork failed: {e}")
            sys.exit(1)

    try:
        client.run()
    except KeyboardInterrupt:
        logger.info("Shutting down volunteer client...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == '__main__':
    main()
