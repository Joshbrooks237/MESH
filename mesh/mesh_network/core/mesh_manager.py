"""
Core Mesh Manager
Coordinates all mesh networking components including node discovery,
connection aggregation, and failover mechanisms.
"""

import asyncio
import time
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from loguru import logger

from ..networking.node_discovery import NodeDiscovery
from ..networking.connection_manager import ConnectionManager
from ..aggregation.link_aggregator import LinkAggregator
from ..failover.failover_manager import FailoverManager
from ..utils.metrics import MetricsCollector


@dataclass
class MeshNode:
    """Represents a node in the mesh network."""
    node_id: str
    ip_address: str
    connections: List[str]  # Available network interfaces
    bandwidth: Dict[str, float]  # Interface -> bandwidth mapping
    latency: Dict[str, float]  # Interface -> latency mapping
    last_seen: float
    data_caps: Dict[str, float]  # Interface -> remaining data cap


class MeshManager:
    """Main coordinator for mesh networking operations."""

    def __init__(self):
        self.node_discovery = NodeDiscovery()
        self.connection_manager = ConnectionManager()
        self.link_aggregator = LinkAggregator()
        self.failover_manager = FailoverManager()
        self.metrics_collector = MetricsCollector()

        self.local_node: Optional[MeshNode] = None
        self.mesh_nodes: Dict[str, MeshNode] = {}
        self.active_connections: Set[str] = set()

        self.running = False
        self.discovery_task: Optional[asyncio.Task] = None
        self.monitoring_task: Optional[asyncio.Task] = None
        self.optimization_task: Optional[asyncio.Task] = None

    async def start(self):
        """Start the mesh networking system."""
        logger.info("Starting Mesh Manager")
        self.running = True

        try:
            # Initialize local node
            await self._initialize_local_node()

            # Start core services
            await self._start_services()

            # Main operation loop
            while self.running:
                await self._main_loop()
                await asyncio.sleep(1)  # Main loop interval

        except Exception as e:
            logger.error(f"Mesh Manager error: {e}")
            raise
        finally:
            await self.stop()

    async def stop(self):
        """Stop the mesh networking system."""
        logger.info("Stopping Mesh Manager")
        self.running = False

        # Cancel all tasks
        tasks = [self.discovery_task, self.monitoring_task, self.optimization_task]
        for task in tasks:
            if task and not task.done():
                task.cancel()

        # Cleanup connections
        await self.connection_manager.cleanup()

    async def _initialize_local_node(self):
        """Initialize the local mesh node."""
        logger.info("Initializing local mesh node")

        # Get local network information
        node_id = await self.node_discovery.generate_node_id()
        ip_address = await self.node_discovery.get_local_ip()
        connections = await self.connection_manager.discover_interfaces()

        # Measure initial connection metrics
        bandwidth = {}
        latency = {}
        data_caps = {}

        for interface in connections:
            bandwidth[interface] = await self.metrics_collector.measure_bandwidth(interface)
            latency[interface] = await self.metrics_collector.measure_latency(interface)
            data_caps[interface] = await self.connection_manager.get_data_cap(interface)

        self.local_node = MeshNode(
            node_id=node_id,
            ip_address=ip_address,
            connections=connections,
            bandwidth=bandwidth,
            latency=latency,
            last_seen=time.time(),
            data_caps=data_caps
        )

        logger.info(f"Local node initialized: {self.local_node.node_id}")

    async def _start_services(self):
        """Start all mesh networking services."""
        logger.info("Starting mesh networking services")

        # Start node discovery
        self.discovery_task = asyncio.create_task(self._run_node_discovery())

        # Start monitoring
        self.monitoring_task = asyncio.create_task(self._run_monitoring())

        # Start optimization
        self.optimization_task = asyncio.create_task(self._run_optimization())

        # Initialize connection aggregation
        await self.link_aggregator.initialize(self.local_node)

    async def _run_node_discovery(self):
        """Run continuous node discovery."""
        while self.running:
            try:
                # Discover new nodes
                discovered_nodes = await self.node_discovery.discover_nodes()

                # Update mesh nodes
                for node_data in discovered_nodes:
                    node_id = node_data['node_id']
                    if node_id not in self.mesh_nodes:
                        # Create new mesh node
                        node = MeshNode(
                            node_id=node_id,
                            ip_address=node_data['ip_address'],
                            connections=node_data['connections'],
                            bandwidth=node_data['bandwidth'],
                            latency=node_data['latency'],
                            last_seen=time.time(),
                            data_caps=node_data.get('data_caps', {})
                        )
                        self.mesh_nodes[node_id] = node
                        logger.info(f"Discovered new mesh node: {node_id}")
                    else:
                        # Update existing node
                        self.mesh_nodes[node_id].last_seen = time.time()

                # Advertise local node
                await self.node_discovery.advertise_node(self.local_node)

                # Clean up stale nodes
                await self._cleanup_stale_nodes()

            except Exception as e:
                logger.error(f"Node discovery error: {e}")

            await asyncio.sleep(5)  # Discovery interval

    async def _run_monitoring(self):
        """Run continuous monitoring of connections and performance."""
        while self.running:
            try:
                # Update local node metrics
                if self.local_node:
                    for interface in self.local_node.connections:
                        self.local_node.bandwidth[interface] = await self.metrics_collector.measure_bandwidth(interface)
                        self.local_node.latency[interface] = await self.metrics_collector.measure_latency(interface)
                        self.local_node.data_caps[interface] = await self.connection_manager.get_data_cap(interface)

                # Monitor aggregated connections
                await self.link_aggregator.monitor_connections()

                # Check for failover conditions
                await self.failover_manager.check_failover_conditions(self.local_node, self.mesh_nodes)

            except Exception as e:
                logger.error(f"Monitoring error: {e}")

            await asyncio.sleep(10)  # Monitoring interval

    async def _run_optimization(self):
        """Run continuous optimization of connection aggregation."""
        while self.running:
            try:
                # Optimize link aggregation based on current conditions
                await self.link_aggregator.optimize_aggregation(
                    self.local_node,
                    list(self.mesh_nodes.values())
                )

                # Update routing based on data caps and latency
                await self._update_routing()

            except Exception as e:
                logger.error(f"Optimization error: {e}")

            await asyncio.sleep(30)  # Optimization interval

    async def _main_loop(self):
        """Main operation loop for mesh management."""
        # Process any pending operations
        await self._process_pending_operations()

        # Update metrics
        self.metrics_collector.update_global_metrics(self.local_node, self.mesh_nodes)

    async def _cleanup_stale_nodes(self):
        """Remove nodes that haven't been seen recently."""
        current_time = time.time()
        stale_threshold = 60  # 60 seconds

        stale_nodes = [
            node_id for node_id, node in self.mesh_nodes.items()
            if current_time - node.last_seen > stale_threshold
        ]

        for node_id in stale_nodes:
            del self.mesh_nodes[node_id]
            logger.info(f"Removed stale mesh node: {node_id}")

    async def _update_routing(self):
        """Update routing based on current network conditions."""
        # This would implement dynamic routing based on data caps, latency, etc.
        # For now, just log the current state
        if self.local_node:
            total_bandwidth = sum(self.local_node.bandwidth.values())
            avg_latency = sum(self.local_node.latency.values()) / len(self.local_node.latency) if self.local_node.latency else 0
            logger.debug(".2f")

    async def _process_pending_operations(self):
        """Process any pending mesh operations."""
        # Placeholder for processing pending operations like
        # connection handoffs, data redistribution, etc.
        pass

    def get_mesh_status(self) -> Dict:
        """Get current mesh network status."""
        return {
            'local_node': self.local_node.__dict__ if self.local_node else None,
            'mesh_nodes': {node_id: node.__dict__ for node_id, node in self.mesh_nodes.items()},
            'active_connections': list(self.active_connections),
            'total_nodes': len(self.mesh_nodes) + 1,  # +1 for local node
            'running': self.running
        }
