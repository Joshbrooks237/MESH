"""
Metrics Collector
Collects and analyzes performance metrics for mesh networking components.
"""

import asyncio
import time
import psutil
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from collections import deque
import statistics
from loguru import logger


@dataclass
class PerformanceMetrics:
    """Container for performance metrics."""
    bandwidth_up: float = 0.0  # Mbps
    bandwidth_down: float = 0.0  # Mbps
    latency: float = 0.0  # ms
    jitter: float = 0.0  # ms
    packet_loss: float = 0.0  # percentage
    timestamp: float = 0.0


@dataclass
class InterfaceMetrics:
    """Metrics for a specific network interface."""
    interface: str
    current: PerformanceMetrics
    history: deque  # Rolling history of metrics
    averages: PerformanceMetrics
    peaks: PerformanceMetrics


class MetricsCollector:
    """Collects and analyzes network performance metrics."""

    def __init__(self):
        self.interfaces: Dict[str, InterfaceMetrics] = {}
        self.global_metrics: Dict[str, float] = {}
        self.history_size = 100  # Number of measurements to keep in history
        self.measurement_interval = 5  # seconds

        # Test targets for measurements
        self.bandwidth_targets = ["speed.cloudflare.com", "proof.ovh.net"]
        self.latency_targets = ["8.8.8.8", "1.1.1.1", "208.67.222.222"]

    async def measure_bandwidth(self, interface: str) -> float:
        """Measure bandwidth for a specific interface."""
        try:
            # Use a simple bandwidth test
            # In production, you might use iperf or speedtest-cli
            bandwidth = await self._simple_bandwidth_test(interface)
            return bandwidth
        except Exception as e:
            logger.debug(f"Bandwidth measurement failed for {interface}: {e}")
            return 0.0

    async def measure_latency(self, interface: str) -> float:
        """Measure latency for a specific interface."""
        try:
            latencies = []

            # Test multiple targets
            for target in self.latency_targets[:2]:  # Test first 2 targets
                latency = await self._ping_latency(interface, target)
                if latency > 0:
                    latencies.append(latency)

            if latencies:
                return statistics.mean(latencies)
            else:
                return 1000.0  # High latency if no measurements

        except Exception as e:
            logger.debug(f"Latency measurement failed for {interface}: {e}")
            return 1000.0

    async def _simple_bandwidth_test(self, interface: str) -> float:
        """Perform a simple bandwidth test."""
        # This is a placeholder - real implementation would use proper bandwidth testing
        # For demo purposes, return a mock value based on interface type

        if interface.startswith('eth'):
            return 100.0  # Ethernet
        elif interface.startswith('wlan') or interface.startswith('wifi'):
            return 50.0   # Wi-Fi
        elif interface.startswith('ppp') or interface.startswith('wwan'):
            return 15.0   # Cellular
        else:
            return 10.0   # Unknown

    async def _ping_latency(self, interface: str, target: str) -> float:
        """Measure latency using ping."""
        try:
            import subprocess

            # Ping with specific interface binding
            cmd = f"ping -c 3 -W 2 -I {interface} {target}"

            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                # Parse ping output for average latency
                output = stdout.decode()
                lines = output.split('\n')

                for line in lines:
                    if 'rtt min/avg/max/mdev' in line:
                        # Extract average from: rtt min/avg/max/mdev = 10.123/12.456/15.789/2.345 ms
                        parts = line.split('=')
                        if len(parts) > 1:
                            values = parts[1].strip().split('/')[1]  # Get average
                            return float(values)

            return -1.0  # Failed to measure

        except Exception as e:
            logger.debug(f"Ping latency measurement failed: {e}")
            return -1.0

    async def measure_packet_loss(self, interface: str) -> float:
        """Measure packet loss percentage."""
        try:
            # Use ping to measure packet loss
            target = self.latency_targets[0]

            cmd = f"ping -c 10 -W 1 -I {interface} {target}"

            process = await asyncio.create_subprocess_shell(
                cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                output = stdout.decode()

                # Look for packet loss percentage
                for line in output.split('\n'):
                    if 'packet loss' in line:
                        # Extract percentage from: X% packet loss
                        parts = line.split('%')
                        if parts:
                            loss_str = parts[0].split()[-1]
                            return float(loss_str)

            return 100.0  # Assume 100% loss if ping fails

        except Exception:
            return 100.0

    async def measure_jitter(self, interface: str) -> float:
        """Measure jitter (latency variation)."""
        try:
            latencies = []

            # Take multiple latency measurements
            for _ in range(5):
                latency = await self._ping_latency(interface, self.latency_targets[0])
                if latency > 0:
                    latencies.append(latency)
                await asyncio.sleep(0.1)

            if len(latencies) >= 2:
                # Calculate standard deviation as jitter measure
                return statistics.stdev(latencies)
            else:
                return 0.0

        except Exception:
            return 0.0

    async def collect_interface_metrics(self, interface: str) -> InterfaceMetrics:
        """Collect comprehensive metrics for an interface."""
        try:
            # Measure all metrics
            bandwidth = await self.measure_bandwidth(interface)
            latency = await self.measure_latency(interface)
            jitter = await self.measure_jitter(interface)
            packet_loss = await self.measure_packet_loss(interface)

            current_metrics = PerformanceMetrics(
                bandwidth_up=bandwidth,
                bandwidth_down=bandwidth,  # Simplified - assume symmetric
                latency=latency,
                jitter=jitter,
                packet_loss=packet_loss,
                timestamp=time.time()
            )

            # Initialize or update interface metrics
            if interface not in self.interfaces:
                self.interfaces[interface] = InterfaceMetrics(
                    interface=interface,
                    current=current_metrics,
                    history=deque(maxlen=self.history_size),
                    averages=PerformanceMetrics(),
                    peaks=PerformanceMetrics()
                )

            iface_metrics = self.interfaces[interface]

            # Add to history
            iface_metrics.history.append(current_metrics)
            iface_metrics.current = current_metrics

            # Update averages and peaks
            await self._update_averages_and_peaks(iface_metrics)

            return iface_metrics

        except Exception as e:
            logger.error(f"Failed to collect metrics for {interface}: {e}")
            return None

    async def _update_averages_and_peaks(self, iface_metrics: InterfaceMetrics):
        """Update average and peak metrics from history."""
        if not iface_metrics.history:
            return

        # Calculate averages
        bandwidths = [m.bandwidth_up for m in iface_metrics.history]
        latencies = [m.latency for m in iface_metrics.history]
        jitters = [m.jitter for m in iface_metrics.history]
        losses = [m.packet_loss for m in iface_metrics.history]

        iface_metrics.averages = PerformanceMetrics(
            bandwidth_up=statistics.mean(bandwidths) if bandwidths else 0,
            bandwidth_down=statistics.mean(bandwidths) if bandwidths else 0,
            latency=statistics.mean(latencies) if latencies else 0,
            jitter=statistics.mean(jitters) if jitters else 0,
            packet_loss=statistics.mean(losses) if losses else 0,
            timestamp=time.time()
        )

        # Update peaks
        iface_metrics.peaks = PerformanceMetrics(
            bandwidth_up=max(bandwidths) if bandwidths else 0,
            bandwidth_down=max(bandwidths) if bandwidths else 0,
            latency=max(latencies) if latencies else 0,
            jitter=max(jitters) if jitters else 0,
            packet_loss=max(losses) if losses else 0,
            timestamp=time.time()
        )

    def update_global_metrics(self, local_node, mesh_nodes: List):
        """Update global mesh network metrics."""
        try:
            if not local_node:
                return

            # Calculate total bandwidth across all interfaces
            total_bandwidth = sum(local_node.bandwidth.values())

            # Calculate average latency
            latencies = [lat for lat in local_node.latency.values() if lat > 0]
            avg_latency = statistics.mean(latencies) if latencies else 0

            # Count total nodes in mesh
            total_nodes = 1 + len(mesh_nodes)  # +1 for local node

            # Update global metrics
            self.global_metrics.update({
                'total_bandwidth': total_bandwidth,
                'average_latency': avg_latency,
                'total_nodes': total_nodes,
                'active_connections': len(local_node.connections),
                'last_updated': time.time()
            })

        except Exception as e:
            logger.error(f"Failed to update global metrics: {e}")

    def get_interface_metrics(self, interface: str) -> Optional[InterfaceMetrics]:
        """Get metrics for a specific interface."""
        return self.interfaces.get(interface)

    def get_all_interface_metrics(self) -> Dict[str, InterfaceMetrics]:
        """Get metrics for all interfaces."""
        return self.interfaces.copy()

    def get_global_metrics(self) -> Dict[str, float]:
        """Get global mesh network metrics."""
        return self.global_metrics.copy()

    def get_performance_report(self) -> Dict:
        """Generate a comprehensive performance report."""
        report = {
            'timestamp': time.time(),
            'global_metrics': self.get_global_metrics(),
            'interface_metrics': {},
            'recommendations': []
        }

        # Add interface-specific metrics
        for iface, metrics in self.interfaces.items():
            report['interface_metrics'][iface] = {
                'current': {
                    'bandwidth_up': metrics.current.bandwidth_up,
                    'bandwidth_down': metrics.current.bandwidth_down,
                    'latency': metrics.current.latency,
                    'jitter': metrics.current.jitter,
                    'packet_loss': metrics.current.packet_loss
                },
                'averages': {
                    'bandwidth_up': metrics.averages.bandwidth_up,
                    'bandwidth_down': metrics.averages.bandwidth_down,
                    'latency': metrics.averages.latency,
                    'jitter': metrics.averages.jitter,
                    'packet_loss': metrics.averages.packet_loss
                },
                'peaks': {
                    'bandwidth_up': metrics.peaks.bandwidth_up,
                    'bandwidth_down': metrics.peaks.bandwidth_down,
                    'latency': metrics.peaks.latency,
                    'jitter': metrics.peaks.jitter,
                    'packet_loss': metrics.peaks.peaks
                }
            }

        # Generate recommendations
        report['recommendations'] = self._generate_recommendations()

        return report

    def _generate_recommendations(self) -> List[str]:
        """Generate performance optimization recommendations."""
        recommendations = []

        try:
            # Check for high latency interfaces
            for iface, metrics in self.interfaces.items():
                if metrics.current.latency > 100:
                    recommendations.append(f"Consider failover away from {iface} due to high latency ({metrics.current.latency:.1f}ms)")

                if metrics.current.packet_loss > 5:
                    recommendations.append(f"High packet loss on {iface} ({metrics.current.packet_loss:.1f}%) - investigate connection quality")

            # Check global metrics
            if self.global_metrics.get('total_nodes', 0) < 2:
                recommendations.append("Limited mesh network size - consider adding more nodes for better redundancy")

            avg_latency = self.global_metrics.get('average_latency', 0)
            if avg_latency > 50:
                recommendations.append(f"High average latency ({avg_latency:.1f}ms) - optimize routing or connections")

        except Exception as e:
            logger.debug(f"Error generating recommendations: {e}")

        return recommendations

    async def export_metrics(self, filepath: str):
        """Export metrics to a file."""
        try:
            import json
            report = self.get_performance_report()

            with open(filepath, 'w') as f:
                json.dump(report, f, indent=2, default=str)

            logger.info(f"Metrics exported to {filepath}")

        except Exception as e:
            logger.error(f"Failed to export metrics: {e}")
