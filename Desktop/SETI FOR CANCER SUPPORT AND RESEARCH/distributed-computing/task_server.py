#!/usr/bin/env python3
"""
SETI Cancer Research Universe - Task Distribution Server

This server manages the distribution of computing tasks to volunteer clients
and aggregates results from distributed computing efforts.
"""

import asyncio
import json
import logging
import threading
import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Set, Any, Optional

import websockets
from websockets.exceptions import ConnectionClosed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('task_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TaskDistributionServer:
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.connected_clients: Dict[str, Dict[str, Any]] = {}
        self.pending_tasks: List[Dict[str, Any]] = []
        self.completed_tasks: Dict[str, Dict[str, Any]] = {}
        self.active_tasks: Dict[str, str] = {}  # task_id -> client_id
        self.client_stats: Dict[str, Dict[str, Any]] = defaultdict(dict)
        self.task_queue = asyncio.Queue()

        # Task templates for different research projects
        self.task_templates = self._load_task_templates()

        # Start task generation thread
        self.task_generator_thread = threading.Thread(target=self._generate_tasks_loop)
        self.task_generator_thread.daemon = True

    def _load_task_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load predefined task templates."""
        return {
            'protein_folding': {
                'type': 'protein_folding',
                'priority': 'medium',
                'estimated_time': 300,  # 5 minutes
                'data_size': '50MB',
                'reward_points': 10,
                'description': 'Simulate protein folding dynamics'
            },
            'genetic_analysis': {
                'type': 'genetic_analysis',
                'priority': 'high',
                'estimated_time': 180,  # 3 minutes
                'data_size': '100MB',
                'reward_points': 15,
                'description': 'Analyze genetic variants for pathogenicity'
            },
            'drug_screening': {
                'type': 'drug_screening',
                'priority': 'medium',
                'estimated_time': 240,  # 4 minutes
                'data_size': '75MB',
                'reward_points': 12,
                'description': 'Virtual screening of drug compounds'
            },
            'image_analysis': {
                'type': 'image_analysis',
                'priority': 'high',
                'estimated_time': 120,  # 2 minutes
                'data_size': '25MB',
                'reward_points': 8,
                'description': 'AI analysis of medical images'
            }
        }

    def _generate_tasks_loop(self):
        """Continuously generate new tasks based on demand."""
        while True:
            try:
                self._generate_tasks()
                time.sleep(10)  # Generate tasks every 10 seconds
            except Exception as e:
                logger.error(f"Error in task generation: {e}")
                time.sleep(30)

    def _generate_tasks(self):
        """Generate new tasks based on connected clients and project needs."""
        active_clients = len([c for c in self.connected_clients.values() if c.get('status') == 'active'])

        if active_clients == 0:
            return

        # Generate tasks based on client capacity
        tasks_to_generate = min(active_clients * 2, 50)  # Max 50 pending tasks

        for _ in range(tasks_to_generate - len(self.pending_tasks)):
            task = self._create_random_task()
            if task:
                self.pending_tasks.append(task)
                logger.info(f"Generated new task: {task['id']} ({task['type']})")

    def _create_random_task(self) -> Optional[Dict[str, Any]]:
        """Create a random task based on available templates."""
        import random

        if not self.task_templates:
            return None

        # Select random task type
        task_type = random.choice(list(self.task_templates.keys()))
        template = self.task_templates[task_type]

        # Generate task-specific payload
        payload = self._generate_task_payload(task_type)

        task = {
            'id': str(uuid.uuid4()),
            'type': 'task',
            'task_id': str(uuid.uuid4()),
            'task_type': task_type,
            'payload': payload,
            'priority': template['priority'],
            'estimated_time': template['estimated_time'],
            'reward_points': template['reward_points'],
            'created_at': datetime.now().isoformat(),
            'status': 'pending'
        }

        return task

    def _generate_task_payload(self, task_type: str) -> Dict[str, Any]:
        """Generate task-specific payload data."""
        import random

        if task_type == 'protein_folding':
            return {
                'sequence': ''.join(random.choice('ACDEFGHIKLMNPQRSTVWY') for _ in range(100)),
                'simulation_time': random.randint(1000, 5000),
                'temperature': 300,
                'force_field': 'AMBER'
            }

        elif task_type == 'genetic_analysis':
            variants = []
            for _ in range(random.randint(10, 50)):
                variants.append({
                    'chromosome': random.randint(1, 22),
                    'position': random.randint(1000000, 200000000),
                    'reference': random.choice(['A', 'C', 'G', 'T']),
                    'alternate': random.choice(['A', 'C', 'G', 'T']),
                    'quality': random.uniform(20, 60)
                })
            return {
                'variants': variants,
                'reference_genome': 'hg38',
                'analysis_tools': ['SIFT', 'PolyPhen', 'CADD']
            }

        elif task_type == 'drug_screening':
            compounds = []
            for _ in range(random.randint(50, 200)):
                compounds.append(f"compound_{random.randint(1000, 9999)}")
            return {
                'compounds': compounds,
                'target_protein': f"protein_{random.randint(100, 999)}",
                'docking_parameters': {
                    'exhaustiveness': 8,
                    'num_modes': 9,
                    'energy_range': 3
                }
            }

        elif task_type == 'image_analysis':
            images = []
            for _ in range(random.randint(5, 20)):
                images.append(f"image_{random.randint(10000, 99999)}.dcm")
            return {
                'images': images,
                'analysis_type': 'tumor_detection',
                'model_version': 'v2.1',
                'confidence_threshold': 0.7
            }

        return {}

    async def handle_client(self, websocket):
        """Handle individual client connections."""
        client_id = None

        try:
            async for message in websocket:
                data = json.loads(message)

                if data['type'] == 'register':
                    client_id = data['client_id']
                    self.connected_clients[client_id] = {
                        'websocket': websocket,
                        'info': data,
                        'status': 'active',
                        'last_seen': datetime.now(),
                        'tasks_completed': 0
                    }
                    logger.info(f"Client {client_id} registered from {data.get('system_info', {}).get('hostname', 'unknown')}")

                    # Send welcome message
                    welcome = {
                        'type': 'welcome',
                        'message': 'Connected to SETI Cancer Research Universe',
                        'server_time': datetime.now().isoformat()
                    }
                    await websocket.send(json.dumps(welcome))

                elif data['type'] == 'task_result':
                    await self._handle_task_result(data)

                elif data['type'] == 'task_error':
                    await self._handle_task_error(data)

                elif data['type'] == 'status':
                    self._update_client_status(client_id, data)

                elif data['type'] == 'pong':
                    if client_id:
                        self.connected_clients[client_id]['last_seen'] = datetime.now()

                # Try to assign a task to this client
                if client_id and not self.active_tasks.get(client_id):
                    await self._assign_task_to_client(client_id)

        except ConnectionClosed:
            if client_id:
                logger.info(f"Client {client_id} disconnected")
                if client_id in self.connected_clients:
                    del self.connected_clients[client_id]

                # Re-queue any active tasks from this client
                active_task_ids = [tid for tid, cid in self.active_tasks.items() if cid == client_id]
                for task_id in active_task_ids:
                    if task_id in self.active_tasks:
                        del self.active_tasks[task_id]
                        # Re-queue the task
                        for task in self.completed_tasks.values():
                            if task.get('task_id') == task_id:
                                task['status'] = 'pending'
                                self.pending_tasks.append(task)
                                break

        except Exception as e:
            logger.error(f"Error handling client {client_id}: {e}")

    async def _assign_task_to_client(self, client_id: str):
        """Assign a pending task to a client."""
        if not self.pending_tasks:
            return

        client = self.connected_clients.get(client_id)
        if not client or client['status'] != 'active':
            return

        # Find suitable task for client
        suitable_task = None
        for task in self.pending_tasks:
            if self._is_task_suitable_for_client(task, client):
                suitable_task = task
                break

        if suitable_task:
            try:
                self.pending_tasks.remove(suitable_task)
                self.active_tasks[suitable_task['task_id']] = client_id
                suitable_task['assigned_at'] = datetime.now().isoformat()
                suitable_task['assigned_to'] = client_id

                await client['websocket'].send(json.dumps(suitable_task))
                logger.info(f"Assigned task {suitable_task['task_id']} to client {client_id}")

            except Exception as e:
                logger.error(f"Failed to assign task to client {client_id}: {e}")
                # Re-queue the task
                self.pending_tasks.append(suitable_task)

    def _is_task_suitable_for_client(self, task: Dict[str, Any], client: Dict[str, Any]) -> bool:
        """Check if a task is suitable for a client based on their capabilities."""
        client_info = client.get('info', {})
        system_info = client_info.get('system_info', {})

        # Check system requirements
        if task['task_type'] == 'image_analysis':
            # Image analysis requires decent GPU or CPU
            cpu_count = system_info.get('cpu_count', 1)
            return cpu_count >= 2

        elif task['task_type'] == 'protein_folding':
            # Protein folding is CPU intensive
            cpu_count = system_info.get('cpu_count', 1)
            return cpu_count >= 4

        # Default: task is suitable
        return True

    async def _handle_task_result(self, result_data: Dict[str, Any]):
        """Handle completed task results."""
        task_id = result_data['task_id']
        client_id = result_data['client_id']

        if task_id in self.active_tasks:
            del self.active_tasks[task_id]

        # Store completed task
        result_data['completed_at'] = datetime.now().isoformat()
        self.completed_tasks[task_id] = result_data

        # Update client stats
        if client_id in self.connected_clients:
            self.connected_clients[client_id]['tasks_completed'] += 1

        logger.info(f"Task {task_id} completed by client {client_id}")

        # Store result for aggregation
        await self._store_task_result(result_data)

    async def _handle_task_error(self, error_data: Dict[str, Any]):
        """Handle task errors."""
        task_id = error_data['task_id']
        client_id = error_data['client_id']

        if task_id in self.active_tasks:
            del self.active_tasks[task_id]

        logger.error(f"Task {task_id} failed for client {client_id}: {error_data.get('error', 'Unknown error')}")

        # Could implement retry logic here
        # For now, just mark as failed

    def _update_client_status(self, client_id: str, status_data: Dict[str, Any]):
        """Update client status information."""
        if client_id in self.connected_clients:
            self.connected_clients[client_id].update({
                'status': 'active',
                'last_seen': datetime.now(),
                'stats': status_data.get('stats', {}),
                'system_load': status_data.get('system_load', 0),
                'memory_usage': status_data.get('memory_usage', 0)
            })

    async def _store_task_result(self, result_data: Dict[str, Any]):
        """Store task result for aggregation and analysis."""
        # In a real implementation, this would store to database
        # For now, just log the result
        logger.info(f"Storing result for task {result_data['task_id']}: {result_data['result']}")

    def get_server_stats(self) -> Dict[str, Any]:
        """Get server statistics."""
        return {
            'connected_clients': len(self.connected_clients),
            'active_clients': len([c for c in self.connected_clients.values() if c.get('status') == 'active']),
            'pending_tasks': len(self.pending_tasks),
            'active_tasks': len(self.active_tasks),
            'completed_tasks': len(self.completed_tasks),
            'total_tasks_processed': len(self.completed_tasks),
            'uptime': str(datetime.now() - datetime.fromisoformat('2024-01-01T00:00:00'))
        }

    async def start(self):
        """Start the task distribution server."""
        logger.info(f"Starting Task Distribution Server on {self.host}:{self.port}")

        # Start task generation thread
        self.task_generator_thread.start()

        # Start WebSocket server
        server = await websockets.serve(
            self.handle_client,
            self.host,
            self.port,
            ping_interval=30,
            ping_timeout=10
        )

        logger.info("Task Distribution Server started successfully")

        # Keep server running
        try:
            await server.wait_closed()
        except KeyboardInterrupt:
            logger.info("Shutting down server...")
        finally:
            server.close()
            await server.wait_closed()

def main():
    import argparse

    parser = argparse.ArgumentParser(description='SETI Cancer Research Task Distribution Server')
    parser.add_argument('--host', default='localhost', help='Server host')
    parser.add_argument('--port', type=int, default=8765, help='Server port')

    args = parser.parse_args()

    server = TaskDistributionServer(args.host, args.port)

    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        logger.info("Server shutdown requested")
    except Exception as e:
        logger.error(f"Server error: {e}")

if __name__ == '__main__':
    main()
