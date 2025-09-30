"""
Connection Manager
Manages multiple internet connections (Wi-Fi, cellular, etc.) and their properties.
"""

import asyncio
import subprocess
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import psutil
import netifaces
from loguru import logger


@dataclass
class NetworkInterface:
    """Represents a network interface with its properties."""
    name: str
    type: str  # 'wifi', 'cellular', 'ethernet', etc.
    ip_address: Optional[str]
    mac_address: Optional[str]
    is_up: bool
    bandwidth_up: float = 0.0  # Mbps
    bandwidth_down: float = 0.0  # Mbps
    latency: float = 0.0  # ms
    data_used: float = 0.0  # MB
    data_cap: float = 0.0  # MB (0 = unlimited)
    signal_strength: Optional[int] = None  # For cellular/wifi


class ConnectionManager:
    """Manages multiple network connections and their monitoring."""

    def __init__(self):
        self.interfaces: Dict[str, NetworkInterface] = {}
        self.active_interfaces: Set[str] = set()
        self.data_usage_tracker: Dict[str, float] = {}
        self.monitoring_task: Optional[asyncio.Task] = None
        self.running = False

    async def discover_interfaces(self) -> List[str]:
        """Discover available network interfaces."""
        logger.info("Discovering network interfaces")

        interfaces = []

        try:
            # Get all network interfaces
            all_interfaces = psutil.net_if_addrs()

            for iface_name, addrs in all_interfaces.items():
                if iface_name == 'lo':  # Skip loopback
                    continue

                # Determine interface type
                iface_type = await self._determine_interface_type(iface_name)

                # Get IP address
                ip_addr = None
                mac_addr = None
                for addr in addrs:
                    if addr.family == netifaces.AF_INET:
                        ip_addr = addr.address
                    elif addr.family == netifaces.AF_LINK:
                        mac_addr = addr.address

                # Check if interface is up
                is_up = await self._is_interface_up(iface_name)

                # Create interface object
                interface = NetworkInterface(
                    name=iface_name,
                    type=iface_type,
                    ip_address=ip_addr,
                    mac_address=mac_addr,
                    is_up=is_up
                )

                self.interfaces[iface_name] = interface
                interfaces.append(iface_name)

                logger.debug(f"Discovered interface: {iface_name} ({iface_type}) - {'UP' if is_up else 'DOWN'}")

        except Exception as e:
            logger.error(f"Error discovering interfaces: {e}")

        return interfaces

    async def _determine_interface_type(self, iface_name: str) -> str:
        """Determine the type of network interface."""
        try:
            # Check for wireless interfaces
            if iface_name.startswith(('wlan', 'wifi', 'wl')):
                return 'wifi'

            # Check for cellular interfaces
            if iface_name.startswith(('ppp', 'wwan', 'rmnet', 'cdc')):
                return 'cellular'

            # Check for ethernet
            if iface_name.startswith(('eth', 'en')):
                return 'ethernet'

            # Check using system commands
            result = await self._run_command(f"iwconfig {iface_name} 2>/dev/null | head -1")
            if result and 'IEEE 802.11' in result:
                return 'wifi'

            # Default to ethernet for unknown types
            return 'unknown'

        except Exception:
            return 'unknown'

    async def _is_interface_up(self, iface_name: str) -> bool:
        """Check if network interface is up."""
        try:
            result = await self._run_command(f"ip link show {iface_name}")
            return 'UP' in result if result else False
        except Exception:
            return False

    async def get_data_cap(self, interface: str) -> float:
        """Get data cap for an interface (0 = unlimited)."""
        # This is a simplified implementation
        # In a real system, this would query carrier APIs or configuration
        try:
            # For cellular interfaces, you might have data caps
            if self.interfaces[interface].type == 'cellular':
                # This would need to be configured per interface
                # For demo purposes, return unlimited
                return 0.0

            # WiFi and ethernet typically have no caps
            return 0.0

        except Exception:
            return 0.0

    async def measure_connection_quality(self, interface: str) -> Tuple[float, float]:
        """Measure bandwidth and latency for an interface."""
        bandwidth = await self._measure_bandwidth(interface)
        latency = await self._measure_latency(interface)

        return bandwidth, latency

    async def _measure_bandwidth(self, interface: str) -> float:
        """Measure bandwidth for an interface."""
        try:
            # Simple bandwidth test using ping with different packet sizes
            # This is a basic implementation - real systems use tools like iperf
            result = await self._run_command(f"ping -c 5 -i 0.2 8.8.8.8")

            if result:
                # Extract packet loss and timing
                # This is simplified - real implementation would use speedtest-cli or similar
                return 50.0  # Placeholder Mbps
            else:
                return 0.0

        except Exception:
            return 0.0

    async def _measure_latency(self, interface: str) -> float:
        """Measure latency for an interface."""
        try:
            # Use ping to measure latency
            result = await self._run_command(f"ping -c 5 8.8.8.8")

            if result:
                # Parse average latency from ping output
                match = re.search(r'(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)/(\d+\.\d+)', result)
                if match:
                    avg_latency = float(match.group(2))  # Average RTT
                    return avg_latency
                else:
                    return 1000.0  # High latency if parsing fails
            else:
                return 1000.0  # High latency if ping fails

        except Exception:
            return 1000.0

    async def get_signal_strength(self, interface: str) -> Optional[int]:
        """Get signal strength for wireless interfaces."""
        try:
            if self.interfaces[interface].type in ['wifi', 'cellular']:
                if self.interfaces[interface].type == 'wifi':
                    # Use iwconfig for WiFi signal
                    result = await self._run_command(f"iwconfig {interface}")
                    if result:
                        match = re.search(r'Signal level=(-?\d+)', result)
                        if match:
                            return int(match.group(1))

                elif self.interfaces[interface].type == 'cellular':
                    # For cellular, this would depend on the modem
                    # Placeholder implementation
                    return -50  # dBm

        except Exception:
            pass

        return None

    async def enable_interface(self, interface: str) -> bool:
        """Enable a network interface."""
        try:
            await self._run_command(f"ip link set {interface} up")
            self.active_interfaces.add(interface)
            logger.info(f"Enabled interface: {interface}")
            return True
        except Exception as e:
            logger.error(f"Failed to enable interface {interface}: {e}")
            return False

    async def disable_interface(self, interface: str) -> bool:
        """Disable a network interface."""
        try:
            await self._run_command(f"ip link set {interface} down")
            self.active_interfaces.discard(interface)
            logger.info(f"Disabled interface: {interface}")
            return True
        except Exception as e:
            logger.error(f"Failed to disable interface {interface}: {e}")
            return False

    async def monitor_data_usage(self):
        """Monitor data usage for all interfaces."""
        while self.running:
            try:
                for interface in self.interfaces:
                    # This would track actual data usage
                    # Simplified implementation
                    if interface in self.active_interfaces:
                        # Increment data usage (placeholder)
                        self.data_usage_tracker[interface] = self.data_usage_tracker.get(interface, 0) + 0.1

                # Check data caps
                await self._check_data_caps()

            except Exception as e:
                logger.error(f"Data usage monitoring error: {e}")

            await asyncio.sleep(60)  # Check every minute

    async def _check_data_caps(self):
        """Check if any interfaces have exceeded data caps."""
        for interface, usage in self.data_usage_tracker.items():
            data_cap = await self.get_data_cap(interface)
            if data_cap > 0 and usage >= data_cap:
                logger.warning(f"Interface {interface} has exceeded data cap ({usage:.2f}MB >= {data_cap}MB)")
                # Could trigger failover or warnings here

    async def cleanup(self):
        """Cleanup connection manager resources."""
        self.running = False
        if self.monitoring_task and not self.monitoring_task.done():
            self.monitoring_task.cancel()

    async def _run_command(self, command: str) -> Optional[str]:
        """Run a shell command and return output."""
        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode == 0:
                return stdout.decode().strip()
            else:
                logger.debug(f"Command failed: {command}, stderr: {stderr.decode()}")
                return None

        except Exception as e:
            logger.debug(f"Command execution error: {e}")
            return None

    def get_interface_status(self) -> Dict[str, Dict]:
        """Get status of all interfaces."""
        return {
            iface.name: {
                'type': iface.type,
                'ip_address': iface.ip_address,
                'is_up': iface.is_up,
                'bandwidth_up': iface.bandwidth_up,
                'bandwidth_down': iface.bandwidth_down,
                'latency': iface.latency,
                'data_used': iface.data_used,
                'data_cap': iface.data_cap,
                'signal_strength': iface.signal_strength,
                'active': iface.name in self.active_interfaces
            }
            for iface in self.interfaces.values()
        }
