"""
Tests for Node Discovery
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, MagicMock
from mesh_network.networking.node_discovery import NodeDiscovery


class TestNodeDiscovery:
    """Test cases for NodeDiscovery class."""

    @pytest.fixture
    def node_discovery(self):
        """Create a NodeDiscovery instance for testing."""
        return NodeDiscovery()

    def test_initialization(self, node_discovery):
        """Test node discovery initialization."""
        assert node_discovery.node_id is None
        assert node_discovery.local_ip is None
        assert node_discovery.discovery_port == 9999
        assert node_discovery.mesh_group == "MESH_NETWORK_GROUP"

    @pytest.mark.asyncio
    async def test_generate_node_id(self, node_discovery):
        """Test node ID generation."""
        with patch('socket.gethostname', return_value='test-host'), \
             patch.object(node_discovery, 'get_mac_address', return_value='aa:bb:cc:dd:ee:ff'):

            node_id = await node_discovery.generate_node_id()

            assert node_id is not None
            assert isinstance(node_id, str)
            assert len(node_id) > 0

            # Second call should return the same ID
            node_id2 = await node_discovery.generate_node_id()
            assert node_id == node_id2

    @pytest.mark.asyncio
    async def test_get_local_ip(self, node_discovery):
        """Test local IP address retrieval."""
        with patch('socket.socket') as mock_socket:
            mock_sock = MagicMock()
            mock_sock.getsockname.return_value = ('192.168.1.100', 12345)
            mock_socket.return_value.__enter__.return_value = mock_sock

            ip = await node_discovery.get_local_ip()

            assert ip == '192.168.1.100'

    @pytest.mark.asyncio
    async def test_get_mac_address(self, node_discovery):
        """Test MAC address retrieval."""
        with patch('scapy.all.conf') as mock_conf:
            mock_conf.ifaces = {
                'eth0': MagicMock(ip='192.168.1.100', mac='aa:bb:cc:dd:ee:ff')
            }

            mac = await node_discovery.get_mac_address()

            assert mac == 'aa:bb:cc:dd:ee:ff'

    @pytest.mark.asyncio
    async def test_discover_nodes(self, node_discovery):
        """Test node discovery."""
        mock_response = {
            'node_id': 'peer-001',
            'ip_address': '192.168.1.101',
            'connections': ['eth0', 'wlan0'],
            'bandwidth': {'eth0': 100.0, 'wlan0': 50.0},
            'latency': {'eth0': 10.0, 'wlan0': 25.0}
        }

        with patch.object(node_discovery, '_send_discovery_broadcast') as mock_send, \
             patch.object(node_discovery, '_listen_for_discovery_responses', return_value=[str(mock_response)]) as mock_listen:

            nodes = await node_discovery.discover_nodes()

            assert len(nodes) == 1
            assert nodes[0]['node_id'] == 'peer-001'
            assert nodes[0]['ip_address'] == '192.168.1.101'

    @pytest.mark.asyncio
    async def test_advertise_node(self, node_discovery):
        """Test node advertisement."""
        from mesh_network.core.mesh_manager import MeshNode

        node = MeshNode(
            node_id='test-node',
            ip_address='192.168.1.100',
            connections=['eth0'],
            bandwidth={'eth0': 100.0},
            latency={'eth0': 10.0},
            last_seen=1234567890.0,
            data_caps={'eth0': 0.0}
        )

        with patch.object(node_discovery, '_send_advertisement') as mock_send:
            await node_discovery.advertise_node(node)

            mock_send.assert_called_once()

    def test_validate_node_data_valid(self, node_discovery):
        """Test validation of valid node data."""
        valid_data = {
            'node_id': 'peer-001',
            'ip_address': '192.168.1.101',
            'connections': ['eth0'],
            'bandwidth': {'eth0': 100.0},
            'latency': {'eth0': 10.0}
        }

        assert node_discovery._validate_node_data(valid_data) == True

    def test_validate_node_data_invalid(self, node_discovery):
        """Test validation of invalid node data."""
        # Missing required field
        invalid_data1 = {
            'node_id': 'peer-001',
            'ip_address': '192.168.1.101',
            'connections': ['eth0'],
            'bandwidth': {'eth0': 100.0}
            # missing latency
        }

        # Wrong data type
        invalid_data2 = {
            'node_id': 'peer-001',
            'ip_address': '192.168.1.101',
            'connections': 'eth0',  # should be list
            'bandwidth': {'eth0': 100.0},
            'latency': {'eth0': 10.0}
        }

        # Own node ID
        node_discovery.node_id = 'peer-001'
        invalid_data3 = {
            'node_id': 'peer-001',  # same as own ID
            'ip_address': '192.168.1.101',
            'connections': ['eth0'],
            'bandwidth': {'eth0': 100.0},
            'latency': {'eth0': 10.0}
        }

        assert node_discovery._validate_node_data(invalid_data1) == False
        assert node_discovery._validate_node_data(invalid_data2) == False
        assert node_discovery._validate_node_data(invalid_data3) == False

    @pytest.mark.asyncio
    async def test_get_network_interfaces(self, node_discovery):
        """Test network interface discovery."""
        with patch('netifaces.interfaces', return_value=['lo', 'eth0', 'wlan0']), \
             patch('netifaces.ifaddresses') as mock_ifaddr:

            mock_ifaddr.return_value = {2: [{'addr': '192.168.1.100'}]}  # AF_INET

            interfaces = await node_discovery.get_network_interfaces()

            assert 'eth0' in interfaces
            assert 'wlan0' in interfaces
            assert 'lo' not in interfaces  # loopback should be excluded
