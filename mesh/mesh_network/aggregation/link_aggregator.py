"""
Link Aggregator
Handles aggregation and bonding of multiple network connections for improved
speed and redundancy.
"""

import asyncio
import threading
from typing import Dict, List, Optional, Tuple
from collections import deque
import numpy as np
from loguru import logger

from ..core.mesh_manager import MeshNode


class LinkAggregator:
    """Manages link aggregation and load balancing across multiple connections."""

    def __init__(self):
        self.aggregation_mode = 'load_balance'  # 'load_balance', 'failover', 'adaptive'
        self.active_connections: Dict[str, Dict] = {}  # interface -> connection_info
        self.connection_weights: Dict[str, float] = {}  # interface -> weight for load balancing
        self.packet_queues: Dict[str, deque] = {}  # interface -> packet queue
        self.performance_history: Dict[str, List[Tuple[float, float]]] = {}  # interface -> [(bandwidth, latency), ...]

        self.monitoring_thread: Optional[threading.Thread] = None
        self.running = False

        # Aggregation settings
        self.max_queue_size = 1000
        self.rebalance_interval = 30  # seconds
        self.performance_window = 10  # number of measurements to keep

    async def initialize(self, local_node: MeshNode):
        """Initialize link aggregation with local node connections."""
        logger.info("Initializing link aggregator")

        for interface in local_node.connections:
            self.active_connections[interface] = {
                'bandwidth': local_node.bandwidth.get(interface, 0),
                'latency': local_node.latency.get(interface, 0),
                'data_cap': local_node.data_caps.get(interface, 0),
                'active': True,
                'packet_count': 0,
                'bytes_sent': 0
            }

            self.packet_queues[interface] = deque(maxlen=self.max_queue_size)
            self.performance_history[interface] = []

        # Calculate initial weights
        await self._calculate_weights()

        # Start monitoring thread
        self.running = True
        self.monitoring_thread = threading.Thread(target=self._monitoring_loop)
        self.monitoring_thread.daemon = True
        self.monitoring_thread.start()

        logger.info(f"Link aggregator initialized with {len(self.active_connections)} connections")

    async def monitor_connections(self):
        """Monitor connection performance and update metrics."""
        for interface, conn_info in self.active_connections.items():
            try:
                # Update performance metrics (simplified)
                # In real implementation, this would measure actual throughput
                bandwidth = conn_info['bandwidth']
                latency = conn_info['latency']

                # Store performance history
                self.performance_history[interface].append((bandwidth, latency))

                # Keep only recent measurements
                if len(self.performance_history[interface]) > self.performance_window:
                    self.performance_history[interface].pop(0)

                # Update connection info
                conn_info['bandwidth'] = bandwidth
                conn_info['latency'] = latency

            except Exception as e:
                logger.error(f"Error monitoring connection {interface}: {e}")

    async def optimize_aggregation(self, local_node: MeshNode, mesh_nodes: List[MeshNode]):
        """Optimize link aggregation based on current network conditions."""
        try:
            # Update connection status
            await self._update_connection_status(local_node)

            # Recalculate weights based on performance
            await self._calculate_weights()

            # Adjust aggregation mode if needed
            await self._adjust_aggregation_mode()

            # Rebalance connections if necessary
            await self._rebalance_connections()

            logger.debug("Link aggregation optimization completed")

        except Exception as e:
            logger.error(f"Link aggregation optimization error: {e}")

    async def _update_connection_status(self, local_node: MeshNode):
        """Update connection status from node metrics."""
        for interface in local_node.connections:
            if interface in self.active_connections:
                self.active_connections[interface].update({
                    'bandwidth': local_node.bandwidth.get(interface, 0),
                    'latency': local_node.latency.get(interface, 0),
                    'data_cap': local_node.data_caps.get(interface, 0)
                })

    async def _calculate_weights(self):
        """Calculate load balancing weights based on connection performance."""
        total_weight = 0
        weights = {}

        for interface, conn_info in self.active_connections.items():
            if not conn_info['active']:
                weights[interface] = 0
                continue

            bandwidth = conn_info['bandwidth']
            latency = conn_info['latency']

            # Skip connections with no bandwidth or very high latency
            if bandwidth <= 0 or latency >= 1000:
                weights[interface] = 0
                continue

            # Calculate weight based on bandwidth and inverse latency
            # Higher bandwidth and lower latency = higher weight
            bandwidth_weight = bandwidth / 100  # Normalize bandwidth
            latency_weight = max(0.1, 100 / latency)  # Inverse latency with minimum

            weight = bandwidth_weight * latency_weight
            weights[interface] = weight
            total_weight += weight

        # Normalize weights
        if total_weight > 0:
            for interface in weights:
                weights[interface] /= total_weight

        self.connection_weights = weights
        logger.debug(f"Updated connection weights: {self.connection_weights}")

    async def _adjust_aggregation_mode(self):
        """Adjust aggregation mode based on network conditions."""
        active_connections = [iface for iface, info in self.active_connections.items() if info['active']]

        if len(active_connections) == 0:
            self.aggregation_mode = 'failover'
        elif len(active_connections) == 1:
            self.aggregation_mode = 'failover'
        else:
            # Check if we have diverse connection types for load balancing
            connection_types = set()
            for iface in active_connections:
                # This would need to be determined from connection manager
                # For now, assume we can load balance if we have multiple connections
                pass

            self.aggregation_mode = 'load_balance'

        logger.debug(f"Aggregation mode: {self.aggregation_mode}")

    async def _rebalance_connections(self):
        """Rebalance load across connections."""
        # This would implement actual load rebalancing
        # For now, just ensure weights are up to date
        pass

    def select_connection(self, packet_size: int = 0) -> Optional[str]:
        """Select the best connection for sending data."""
        if not self.active_connections:
            return None

        if self.aggregation_mode == 'failover':
            # Use primary connection, fallback to others
            for interface, conn_info in self.active_connections.items():
                if conn_info['active']:
                    return interface

        elif self.aggregation_mode == 'load_balance':
            # Use weighted random selection
            return self._weighted_random_selection()

        elif self.aggregation_mode == 'adaptive':
            # Choose based on current conditions
            return self._adaptive_selection(packet_size)

        return None

    def _weighted_random_selection(self) -> Optional[str]:
        """Select connection using weighted random selection."""
        active_interfaces = [
            iface for iface, info in self.active_connections.items()
            if info['active'] and self.connection_weights.get(iface, 0) > 0
        ]

        if not active_interfaces:
            return None

        weights = [self.connection_weights.get(iface, 0) for iface in active_interfaces]

        # Normalize weights
        total_weight = sum(weights)
        if total_weight == 0:
            return active_interfaces[0]  # Fallback to first active

        normalized_weights = [w / total_weight for w in weights]

        # Weighted random selection
        r = np.random.random()
        cumulative = 0
        for i, weight in enumerate(normalized_weights):
            cumulative += weight
            if r <= cumulative:
                return active_interfaces[i]

        return active_interfaces[-1]  # Fallback

    def _adaptive_selection(self, packet_size: int) -> Optional[str]:
        """Select connection based on adaptive algorithm considering packet size."""
        if packet_size == 0:
            return self._weighted_random_selection()

        # For large packets, prefer high-bandwidth connections
        # For small packets, consider latency more heavily
        active_interfaces = [
            iface for iface, info in self.active_connections.items()
            if info['active']
        ]

        if not active_interfaces:
            return None

        if packet_size > 1000:  # Large packet
            # Prefer highest bandwidth
            return max(active_interfaces,
                      key=lambda x: self.active_connections[x]['bandwidth'])
        else:
            # Prefer lowest latency
            return min(active_interfaces,
                      key=lambda x: self.active_connections[x]['latency'])

    def queue_packet(self, packet_data: bytes, interface: Optional[str] = None) -> bool:
        """Queue a packet for sending on specified or auto-selected interface."""
        if interface is None:
            interface = self.select_connection(len(packet_data))

        if not interface or interface not in self.packet_queues:
            return False

        # Check queue size limit
        if len(self.packet_queues[interface]) >= self.max_queue_size:
            logger.warning(f"Packet queue full for interface {interface}")
            return False

        self.packet_queues[interface].append(packet_data)

        # Update statistics
        if interface in self.active_connections:
            self.active_connections[interface]['packet_count'] += 1
            self.active_connections[interface]['bytes_sent'] += len(packet_data)

        return True

    def get_packet_from_queue(self, interface: str) -> Optional[bytes]:
        """Get next packet from interface queue."""
        if interface not in self.packet_queues:
            return None

        try:
            return self.packet_queues[interface].popleft()
        except IndexError:
            return None

    def _monitoring_loop(self):
        """Background monitoring loop for connection health."""
        while self.running:
            try:
                # This would perform continuous monitoring
                # For now, just sleep
                pass
            except Exception as e:
                logger.error(f"Monitoring loop error: {e}")

            # Sleep for rebalance interval
            import time
            time.sleep(self.rebalance_interval)

    async def get_aggregation_status(self) -> Dict:
        """Get current aggregation status."""
        total_bandwidth = sum(
            info['bandwidth'] for info in self.active_connections.values()
            if info['active']
        )

        avg_latency = 0
        active_count = sum(1 for info in self.active_connections.values() if info['active'])
        if active_count > 0:
            avg_latency = sum(
                info['latency'] for info in self.active_connections.values()
                if info['active']
            ) / active_count

        return {
            'mode': self.aggregation_mode,
            'active_connections': len([info for info in self.active_connections.values() if info['active']]),
            'total_connections': len(self.active_connections),
            'total_bandwidth': total_bandwidth,
            'average_latency': avg_latency,
            'connection_weights': self.connection_weights.copy(),
            'queue_sizes': {iface: len(queue) for iface, queue in self.packet_queues.items()}
        }

    async def cleanup(self):
        """Cleanup link aggregator resources."""
        self.running = False
        if self.monitoring_thread and self.monitoring_thread.is_alive():
            self.monitoring_thread.join(timeout=5)
