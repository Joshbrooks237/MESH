"""
Node Discovery Module
Handles discovery and advertisement of mesh network nodes using Scapy.
"""

import asyncio
import json
import socket
import uuid
from typing import Dict, List, Optional
from scapy.all import (
    Ether, IP, UDP, Raw,
    sniff, sendp, get_if_hwaddr, get_if_addr,
    conf
)
from loguru import logger


class NodeDiscovery:
    """Handles mesh network node discovery and advertisement."""

    def __init__(self):
        self.node_id: Optional[str] = None
        self.local_ip: Optional[str] = None
        self.mac_address: Optional[str] = None
        self.discovery_port = 9999
        self.broadcast_address = "255.255.255.255"
        self.mesh_group = "MESH_NETWORK_GROUP"

        # Scapy configuration
        conf.verb = 0  # Reduce verbosity

    async def generate_node_id(self) -> str:
        """Generate a unique node ID."""
        if not self.node_id:
            # Use MAC address + hostname for uniqueness
            hostname = socket.gethostname()
            mac = await self.get_mac_address()
            self.node_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{hostname}-{mac}"))
        return self.node_id

    async def get_local_ip(self) -> str:
        """Get the local IP address."""
        if not self.local_ip:
            try:
                # Get local IP by connecting to a public DNS server
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                self.local_ip = s.getsockname()[0]
                s.close()
            except Exception as e:
                logger.error(f"Failed to get local IP: {e}")
                self.local_ip = "127.0.0.1"
        return self.local_ip

    async def get_mac_address(self) -> str:
        """Get the local MAC address."""
        if not self.mac_address:
            try:
                # Get MAC address of default interface
                interfaces = conf.ifaces
                for iface_name in interfaces:
                    iface = interfaces[iface_name]
                    if iface.ip and iface.ip != "127.0.0.1":
                        self.mac_address = iface.mac
                        break
                if not self.mac_address:
                    self.mac_address = get_if_hwaddr(conf.iface)
            except Exception as e:
                logger.error(f"Failed to get MAC address: {e}")
                self.mac_address = "00:00:00:00:00:00"
        return self.mac_address

    async def discover_nodes(self) -> List[Dict]:
        """Discover available mesh nodes on the network."""
        discovered_nodes = []

        try:
            # Send discovery broadcast
            await self._send_discovery_broadcast()

            # Listen for responses with timeout
            responses = await self._listen_for_discovery_responses(timeout=3.0)

            # Parse responses
            for response in responses:
                try:
                    node_data = json.loads(response)
                    if self._validate_node_data(node_data):
                        discovered_nodes.append(node_data)
                except json.JSONDecodeError:
                    logger.warning("Received invalid JSON in discovery response")

        except Exception as e:
            logger.error(f"Node discovery error: {e}")

        return discovered_nodes

    async def advertise_node(self, node):
        """Advertise this node to the mesh network."""
        try:
            advertisement_data = {
                'node_id': node.node_id,
                'ip_address': node.ip_address,
                'connections': node.connections,
                'bandwidth': node.bandwidth,
                'latency': node.latency,
                'data_caps': node.data_caps,
                'timestamp': asyncio.get_event_loop().time()
            }

            await self._send_advertisement(advertisement_data)

        except Exception as e:
            logger.error(f"Node advertisement error: {e}")

    async def _send_discovery_broadcast(self):
        """Send a discovery broadcast packet."""
        discovery_packet = {
            'type': 'DISCOVERY_REQUEST',
            'node_id': self.node_id,
            'group': self.mesh_group,
            'timestamp': asyncio.get_event_loop().time()
        }

        packet_data = json.dumps(discovery_packet).encode()

        # Create Ethernet + IP + UDP packet
        ether = Ether(dst="ff:ff:ff:ff:ff:ff")  # Broadcast MAC
        ip = IP(dst=self.broadcast_address)
        udp = UDP(sport=self.discovery_port, dport=self.discovery_port)
        raw = Raw(load=packet_data)

        packet = ether / ip / udp / raw

        # Send packet
        sendp(packet, verbose=0)

    async def _send_advertisement(self, node_data: Dict):
        """Send node advertisement."""
        advertisement_packet = {
            'type': 'NODE_ADVERTISEMENT',
            'node_data': node_data,
            'group': self.mesh_group,
            'timestamp': asyncio.get_event_loop().time()
        }

        packet_data = json.dumps(advertisement_packet).encode()

        # Create broadcast packet
        ether = Ether(dst="ff:ff:ff:ff:ff:ff")
        ip = IP(dst=self.broadcast_address)
        udp = UDP(sport=self.discovery_port, dport=self.discovery_port)
        raw = Raw(load=packet_data)

        packet = ether / ip / udp / raw

        # Send packet
        sendp(packet, verbose=0)

    async def _listen_for_discovery_responses(self, timeout: float = 3.0) -> List[str]:
        """Listen for discovery responses."""
        responses = []

        def packet_handler(pkt):
            if pkt.haslayer(Raw):
                try:
                    data = pkt[Raw].load.decode()
                    responses.append(data)
                except:
                    pass

        # Start sniffing in a separate thread
        loop = asyncio.get_event_loop()

        def sniff_wrapper():
            sniff(
                filter=f"udp port {self.discovery_port}",
                prn=packet_handler,
                timeout=timeout,
                store=0
            )

        await loop.run_in_executor(None, sniff_wrapper)

        return responses

    def _validate_node_data(self, node_data: Dict) -> bool:
        """Validate received node data."""
        required_fields = ['node_id', 'ip_address', 'connections', 'bandwidth', 'latency']

        # Check required fields
        if not all(field in node_data for field in required_fields):
            return False

        # Check node_id is not our own
        if node_data.get('node_id') == self.node_id:
            return False

        # Basic validation of data types
        try:
            assert isinstance(node_data['node_id'], str)
            assert isinstance(node_data['ip_address'], str)
            assert isinstance(node_data['connections'], list)
            assert isinstance(node_data['bandwidth'], dict)
            assert isinstance(node_data['latency'], dict)
        except (AssertionError, TypeError):
            return False

        return True

    async def get_network_interfaces(self) -> List[str]:
        """Get available network interfaces."""
        interfaces = []
        try:
            import netifaces
            for iface in netifaces.interfaces():
                addrs = netifaces.ifaddresses(iface)
                if netifaces.AF_INET in addrs:
                    interfaces.append(iface)
        except ImportError:
            # Fallback if netifaces not available
            import psutil
            interfaces = [iface.name for iface in psutil.net_if_addrs().keys()
                         if iface.name != 'lo']

        return interfaces
