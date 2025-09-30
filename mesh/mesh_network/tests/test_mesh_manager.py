"""
Tests for Mesh Manager
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from mesh_network.core.mesh_manager import MeshManager, MeshNode


class TestMeshManager:
    """Test cases for MeshManager class."""

    @pytest.fixture
    def mesh_manager(self):
        """Create a MeshManager instance for testing."""
        return MeshManager()

    @pytest.mark.asyncio
    async def test_initialization(self, mesh_manager):
        """Test mesh manager initialization."""
        # Mock the initialization methods
        with patch.object(mesh_manager.node_discovery, 'generate_node_id', return_value='test-node-123') as mock_gen_id, \
             patch.object(mesh_manager.node_discovery, 'get_local_ip', return_value='192.168.1.100') as mock_get_ip, \
             patch.object(mesh_manager.connection_manager, 'discover_interfaces', return_value=['eth0', 'wlan0']) as mock_discover, \
             patch.object(mesh_manager.metrics_collector, 'measure_bandwidth', return_value=100.0) as mock_bw, \
             patch.object(mesh_manager.metrics_collector, 'measure_latency', return_value=10.0) as mock_lat, \
             patch.object(mesh_manager.connection_manager, 'get_data_cap', return_value=0.0) as mock_cap:

            await mesh_manager._initialize_local_node()

            assert mesh_manager.local_node is not None
            assert mesh_manager.local_node.node_id == 'test-node-123'
            assert mesh_manager.local_node.ip_address == '192.168.1.100'
            assert 'eth0' in mesh_manager.local_node.connections
            assert 'wlan0' in mesh_manager.local_node.connections

    @pytest.mark.asyncio
    async def test_node_discovery(self, mesh_manager):
        """Test node discovery functionality."""
        mock_nodes = [
            {
                'node_id': 'peer-001',
                'ip_address': '192.168.1.101',
                'connections': ['eth0'],
                'bandwidth': {'eth0': 50.0},
                'latency': {'eth0': 20.0}
            }
        ]

        with patch.object(mesh_manager.node_discovery, 'discover_nodes', return_value=mock_nodes) as mock_discover, \
             patch.object(mesh_manager.node_discovery, 'advertise_node') as mock_advertise, \
             patch.object(mesh_manager, '_cleanup_stale_nodes') as mock_cleanup:

            await mesh_manager._run_node_discovery()

            assert 'peer-001' in mesh_manager.mesh_nodes
            assert mesh_manager.mesh_nodes['peer-001'].ip_address == '192.168.1.101'

    def test_get_mesh_status(self, mesh_manager):
        """Test getting mesh status."""
        # Set up mock local node
        mesh_manager.local_node = MeshNode(
            node_id='local-001',
            ip_address='192.168.1.100',
            connections=['eth0', 'wlan0'],
            bandwidth={'eth0': 100.0, 'wlan0': 50.0},
            latency={'eth0': 10.0, 'wlan0': 25.0},
            last_seen=1234567890.0,
            data_caps={'eth0': 0.0, 'wlan0': 0.0}
        )

        # Add mock mesh nodes
        mesh_manager.mesh_nodes = {
            'peer-001': MeshNode(
                node_id='peer-001',
                ip_address='192.168.1.101',
                connections=['eth0'],
                bandwidth={'eth0': 75.0},
                latency={'eth0': 15.0},
                last_seen=1234567890.0,
                data_caps={'eth0': 0.0}
            )
        }

        status = mesh_manager.get_mesh_status()

        assert status['local_node']['node_id'] == 'local-001'
        assert len(status['mesh_nodes']) == 1
        assert status['total_nodes'] == 2
        assert status['running'] == False

    @pytest.mark.asyncio
    async def test_cleanup_stale_nodes(self, mesh_manager):
        """Test cleanup of stale mesh nodes."""
        import time

        # Add a stale node (more than 60 seconds old)
        stale_time = time.time() - 120
        mesh_manager.mesh_nodes['stale-node'] = MeshNode(
            node_id='stale-node',
            ip_address='192.168.1.102',
            connections=['eth0'],
            bandwidth={'eth0': 25.0},
            latency={'eth0': 50.0},
            last_seen=stale_time,
            data_caps={'eth0': 0.0}
        )

        # Add a fresh node
        fresh_time = time.time() - 10
        mesh_manager.mesh_nodes['fresh-node'] = MeshNode(
            node_id='fresh-node',
            ip_address='192.168.1.103',
            connections=['eth0'],
            bandwidth={'eth0': 80.0},
            latency={'eth0': 12.0},
            last_seen=fresh_time,
            data_caps={'eth0': 0.0}
        )

        await mesh_manager._cleanup_stale_nodes()

        assert 'stale-node' not in mesh_manager.mesh_nodes
        assert 'fresh-node' in mesh_manager.mesh_nodes
