"""
Failover Manager
Handles automatic failover mechanisms for connection redundancy and
network resilience.
"""

import asyncio
import time
from typing import Dict, List, Optional, Set
from enum import Enum
from dataclasses import dataclass
from loguru import logger

from ..core.mesh_manager import MeshNode


class FailoverState(Enum):
    """States for failover management."""
    NORMAL = "normal"
    MONITORING = "monitoring"
    FAILING_OVER = "failing_over"
    RECOVERING = "recovering"
    DEGRADED = "degraded"


@dataclass
class FailoverEvent:
    """Represents a failover event."""
    event_type: str  # 'connection_lost', 'connection_restored', 'degraded_performance'
    interface: str
    timestamp: float
    details: Dict


class FailoverManager:
    """Manages automatic failover and connection redundancy."""

    def __init__(self):
        self.state = FailoverState.NORMAL
        self.primary_interface: Optional[str] = None
        self.backup_interfaces: List[str] = []
        self.failed_interfaces: Set[str] = set()

        # Configuration
        self.failover_threshold = 3  # consecutive failures before failover
        self.recovery_threshold = 2  # consecutive successes before recovery
        self.monitoring_interval = 10  # seconds
        self.failover_timeout = 30  # seconds to wait for failover completion

        # Monitoring state
        self.failure_counts: Dict[str, int] = {}
        self.success_counts: Dict[str, int] = {}
        self.last_check: Dict[str, float] = {}
        self.failover_events: List[FailoverEvent] = []

        # Health check settings
        self.health_check_targets = ["8.8.8.8", "1.1.1.1"]  # DNS servers for connectivity checks
        self.health_check_timeout = 5  # seconds

    async def check_failover_conditions(self, local_node: MeshNode, mesh_nodes: List[MeshNode]):
        """Check if failover conditions are met and handle accordingly."""
        try:
            current_time = time.time()

            # Check each active connection
            for interface in local_node.connections:
                if interface not in self.last_check:
                    self.last_check[interface] = 0

                # Only check if enough time has passed
                if current_time - self.last_check[interface] >= self.monitoring_interval:
                    is_healthy = await self._check_connection_health(interface)
                    self.last_check[interface] = current_time

                    if is_healthy:
                        await self._handle_connection_success(interface)
                    else:
                        await self._handle_connection_failure(interface)

            # Determine overall system state
            await self._update_system_state(local_node)

            # Handle state transitions
            await self._handle_state_transitions(local_node)

        except Exception as e:
            logger.error(f"Failover condition check error: {e}")

    async def _check_connection_health(self, interface: str) -> bool:
        """Check if a connection is healthy."""
        try:
            # Multiple health checks for reliability
            success_count = 0

            for target in self.health_check_targets:
                if await self._ping_check(interface, target):
                    success_count += 1

            # Consider healthy if at least half the checks pass
            return success_count >= len(self.health_check_targets) // 2 + 1

        except Exception as e:
            logger.debug(f"Health check failed for {interface}: {e}")
            return False

    async def _ping_check(self, interface: str, target: str) -> bool:
        """Perform a ping health check."""
        try:
            # Create ping command for specific interface
            import subprocess
            import asyncio

            cmd = f"ping -c 1 -W {self.health_check_timeout} -I {interface} {target}"

            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            return process.returncode == 0

        except Exception:
            return False

    async def _handle_connection_success(self, interface: str):
        """Handle successful connection health check."""
        # Reset failure count
        self.failure_counts[interface] = 0

        # Increment success count
        self.success_counts[interface] = self.success_counts.get(interface, 0) + 1

        # Check if interface should be recovered
        if interface in self.failed_interfaces and self.success_counts[interface] >= self.recovery_threshold:
            await self._recover_interface(interface)

    async def _handle_connection_failure(self, interface: str):
        """Handle failed connection health check."""
        # Reset success count
        self.success_counts[interface] = 0

        # Increment failure count
        self.failure_counts[interface] = self.failure_counts.get(interface, 0) + 1

        # Check if interface should fail over
        if self.failure_counts[interface] >= self.failover_threshold:
            await self._failover_interface(interface)

    async def _failover_interface(self, interface: str):
        """Initiate failover for a failed interface."""
        if interface in self.failed_interfaces:
            return  # Already failed over

        logger.warning(f"Initiating failover for interface: {interface}")

        # Add to failed interfaces
        self.failed_interfaces.add(interface)

        # Record failover event
        event = FailoverEvent(
            event_type='connection_lost',
            interface=interface,
            timestamp=time.time(),
            details={
                'failure_count': self.failure_counts[interface],
                'state': self.state.value
            }
        )
        self.failover_events.append(event)

        # Update primary interface if this was it
        if self.primary_interface == interface:
            await self._select_new_primary()

        # Notify link aggregator of the change
        # This would trigger rebalancing

    async def _recover_interface(self, interface: str):
        """Recover a previously failed interface."""
        if interface not in self.failed_interfaces:
            return  # Not failed

        logger.info(f"Recovering interface: {interface}")

        # Remove from failed interfaces
        self.failed_interfaces.remove(interface)

        # Reset counters
        self.failure_counts[interface] = 0
        self.success_counts[interface] = 0

        # Record recovery event
        event = FailoverEvent(
            event_type='connection_restored',
            interface=interface,
            timestamp=time.time(),
            details={
                'success_count': self.success_counts[interface],
                'state': self.state.value
            }
        )
        self.failover_events.append(event)

        # Re-evaluate primary interface
        await self._select_new_primary()

    async def _select_new_primary(self):
        """Select a new primary interface based on available connections."""
        # This would implement logic to choose the best available interface
        # For now, just pick the first available non-failed interface

        available_interfaces = [
            iface for iface in self.backup_interfaces
            if iface not in self.failed_interfaces
        ]

        if available_interfaces:
            self.primary_interface = available_interfaces[0]
            logger.info(f"Selected new primary interface: {self.primary_interface}")
        else:
            self.primary_interface = None
            logger.warning("No available interfaces for primary selection")

    async def _update_system_state(self, local_node: MeshNode):
        """Update the overall system failover state."""
        total_connections = len(local_node.connections)
        failed_count = len(self.failed_interfaces)
        active_connections = total_connections - failed_count

        if active_connections == 0:
            new_state = FailoverState.DEGRADED
        elif failed_count == 0:
            new_state = FailoverState.NORMAL
        elif active_connections == 1:
            new_state = FailoverState.MONITORING
        else:
            new_state = FailoverState.NORMAL

        if new_state != self.state:
            logger.info(f"Failover state changed: {self.state.value} -> {new_state.value}")
            self.state = new_state

    async def _handle_state_transitions(self, local_node: MeshNode):
        """Handle actions based on state transitions."""
        if self.state == FailoverState.DEGRADED:
            # Critical situation - all connections failed
            logger.critical("All connections failed - entering degraded mode")
            # Could implement emergency measures here

        elif self.state == FailoverState.MONITORING:
            # Only one connection left - increase monitoring frequency
            logger.warning("Only one active connection remaining - increased monitoring")

    def set_primary_interface(self, interface: str):
        """Manually set the primary interface."""
        self.primary_interface = interface
        logger.info(f"Primary interface set to: {interface}")

    def set_backup_interfaces(self, interfaces: List[str]):
        """Set backup interfaces in priority order."""
        self.backup_interfaces = interfaces.copy()
        logger.info(f"Backup interfaces set: {interfaces}")

    def get_failover_status(self) -> Dict:
        """Get current failover status."""
        return {
            'state': self.state.value,
            'primary_interface': self.primary_interface,
            'backup_interfaces': self.backup_interfaces,
            'failed_interfaces': list(self.failed_interfaces),
            'failure_counts': self.failure_counts.copy(),
            'success_counts': self.success_counts.copy(),
            'recent_events': [
                {
                    'type': event.event_type,
                    'interface': event.interface,
                    'timestamp': event.timestamp,
                    'details': event.details
                }
                for event in self.failover_events[-10:]  # Last 10 events
            ]
        }

    async def manual_failover(self, from_interface: str, to_interface: str) -> bool:
        """Manually trigger failover from one interface to another."""
        try:
            logger.info(f"Manual failover: {from_interface} -> {to_interface}")

            # Force failure of source interface
            self.failed_interfaces.add(from_interface)

            # Force recovery of target interface
            if to_interface in self.failed_interfaces:
                self.failed_interfaces.remove(to_interface)

            # Update primary
            self.primary_interface = to_interface

            # Record manual failover event
            event = FailoverEvent(
                event_type='manual_failover',
                interface=from_interface,
                timestamp=time.time(),
                details={
                    'to_interface': to_interface,
                    'manual': True
                }
            )
            self.failover_events.append(event)

            return True

        except Exception as e:
            logger.error(f"Manual failover failed: {e}")
            return False

    def clear_failure_history(self):
        """Clear failure and success count history."""
        self.failure_counts.clear()
        self.success_counts.clear()
        logger.info("Failure history cleared")
