"""
Tests for Link Aggregator
"""

import pytest
import asyncio
from unittest.mock import Mock, patch
from mesh_network.aggregation.link_aggregator import LinkAggregator
from mesh_network.core.mesh_manager import MeshNode


class TestLinkAggregator:
    """Test cases for LinkAggregator class."""

    @pytest.fixture
    def link_aggregator(self):
        """Create a LinkAggregator instance for testing."""
        return LinkAggregator()

    @pytest.fixture
    def sample_node(self):
        """Create a sample mesh node for testing."""
        return MeshNode(
            node_id='test-node',
            ip_address='192.168.1.100',
            connections=['eth0', 'wlan0', 'ppp0'],
            bandwidth={'eth0': 100.0, 'wlan0': 50.0, 'ppp0': 15.0},
            latency={'eth0': 10.0, 'wlan0': 25.0, 'ppp0': 45.0},
            last_seen=1234567890.0,
            data_caps={'eth0': 0.0, 'wlan0': 0.0, 'ppp0': 100.0}  # 100MB cap on cellular
        )

    @pytest.mark.asyncio
    async def test_initialization(self, link_aggregator, sample_node):
        """Test link aggregator initialization."""
        await link_aggregator.initialize(sample_node)

        assert len(link_aggregator.active_connections) == 3
        assert 'eth0' in link_aggregator.active_connections
        assert 'wlan0' in link_aggregator.active_connections
        assert 'ppp0' in link_aggregator.active_connections

        # Check that all connections are marked as active
        for conn_info in link_aggregator.active_connections.values():
            assert conn_info['active'] == True

    @pytest.mark.asyncio
    async def test_weight_calculation(self, link_aggregator, sample_node):
        """Test connection weight calculation."""
        await link_aggregator.initialize(sample_node)

        await link_aggregator._calculate_weights()

        # Check that weights are calculated
        assert len(link_aggregator.connection_weights) == 3

        # eth0 should have highest weight (highest bandwidth, lowest latency)
        # ppp0 should have lowest weight (lowest bandwidth, highest latency)
        assert link_aggregator.connection_weights['eth0'] > link_aggregator.connection_weights['ppp0']

        # Weights should sum to approximately 1.0
        total_weight = sum(link_aggregator.connection_weights.values())
        assert abs(total_weight - 1.0) < 0.001

    @pytest.mark.asyncio
    async def test_aggregation_mode_selection(self, link_aggregator, sample_node):
        """Test aggregation mode selection."""
        await link_aggregator.initialize(sample_node)

        # With 3 active connections, should be load_balance
        await link_aggregator._adjust_aggregation_mode()
        assert link_aggregator.aggregation_mode == 'load_balance'

        # Disable 2 connections, leaving 1
        link_aggregator.active_connections['eth0']['active'] = False
        link_aggregator.active_connections['wlan0']['active'] = False

        await link_aggregator._adjust_aggregation_mode()
        assert link_aggregator.aggregation_mode == 'failover'

    def test_weighted_random_selection(self, link_aggregator, sample_node):
        """Test weighted random connection selection."""
        # Set up weights manually for testing
        link_aggregator.connection_weights = {
            'eth0': 0.5,
            'wlan0': 0.3,
            'ppp0': 0.2
        }
        link_aggregator.active_connections = {
            'eth0': {'active': True},
            'wlan0': {'active': True},
            'ppp0': {'active': True}
        }

        # Test multiple selections to check distribution
        selections = {}
        for _ in range(1000):
            selection = link_aggregator._weighted_random_selection()
            selections[selection] = selections.get(selection, 0) + 1

        # All interfaces should be selected at least once
        assert len(selections) == 3
        assert all(count > 0 for count in selections.values())

        # eth0 should be selected most often (highest weight)
        assert selections['eth0'] > selections['wlan0'] > selections['ppp0']

    def test_adaptive_selection(self, link_aggregator, sample_node):
        """Test adaptive connection selection."""
        link_aggregator.active_connections = {
            'eth0': {'active': True, 'bandwidth': 100.0, 'latency': 10.0},
            'wlan0': {'active': True, 'bandwidth': 50.0, 'latency': 25.0},
            'ppp0': {'active': True, 'bandwidth': 15.0, 'latency': 45.0}
        }

        # For large packets, should prefer high bandwidth
        large_packet_selection = link_aggregator._adaptive_selection(2000)
        assert large_packet_selection == 'eth0'

        # For small packets, should prefer low latency
        small_packet_selection = link_aggregator._adaptive_selection(100)
        assert small_packet_selection == 'eth0'  # eth0 has both high BW and low latency

    def test_packet_queueing(self, link_aggregator, sample_node):
        """Test packet queueing functionality."""
        # Initialize with sample node
        link_aggregator.active_connections = {
            'eth0': {'active': True, 'packet_count': 0, 'bytes_sent': 0},
            'wlan0': {'active': True, 'packet_count': 0, 'bytes_sent': 0}
        }
        link_aggregator.packet_queues = {
            'eth0': [],
            'wlan0': []
        }

        # Test queueing packet
        test_packet = b"test packet data"
        result = link_aggregator.queue_packet(test_packet, 'eth0')

        assert result == True
        assert len(link_aggregator.packet_queues['eth0']) == 1
        assert link_aggregator.active_connections['eth0']['packet_count'] == 1
        assert link_aggregator.active_connections['eth0']['bytes_sent'] == len(test_packet)

    def test_packet_dequeueing(self, link_aggregator):
        """Test packet dequeueing."""
        link_aggregator.packet_queues = {
            'eth0': [b"packet1", b"packet2"],
            'wlan0': []
        }

        # Dequeue from eth0
        packet = link_aggregator.get_packet_from_queue('eth0')
        assert packet == b"packet1"

        packet = link_aggregator.get_packet_from_queue('eth0')
        assert packet == b"packet2"

        # Queue should be empty now
        packet = link_aggregator.get_packet_from_queue('eth0')
        assert packet is None

        # Non-existent interface
        packet = link_aggregator.get_packet_from_queue('nonexistent')
        assert packet is None

    @pytest.mark.asyncio
    async def test_connection_selection(self, link_aggregator, sample_node):
        """Test connection selection for sending."""
        await link_aggregator.initialize(sample_node)

        # Test selection without specifying interface
        selected = link_aggregator.select_connection()
        assert selected in ['eth0', 'wlan0', 'ppp0']

        # Test selection with specific interface
        selected = link_aggregator.select_connection(100)  # 100 bytes
        assert selected in ['eth0', 'wlan0', 'ppp0']

    @pytest.mark.asyncio
    async def test_aggregation_status(self, link_aggregator, sample_node):
        """Test getting aggregation status."""
        await link_aggregator.initialize(sample_node)

        status = await link_aggregator.get_aggregation_status()

        assert status['mode'] == 'load_balance'
        assert status['active_connections'] == 3
        assert status['total_connections'] == 3
        assert status['total_bandwidth'] == 165.0  # 100 + 50 + 15
        assert 'connection_weights' in status
        assert 'queue_sizes' in status

    def test_connection_selection_with_no_active(self, link_aggregator):
        """Test connection selection when no connections are active."""
        link_aggregator.active_connections = {}
        link_aggregator.connection_weights = {}

        selected = link_aggregator.select_connection()
        assert selected is None

    def test_packet_queueing_with_full_queue(self, link_aggregator):
        """Test packet queueing when queue is full."""
        link_aggregator.max_queue_size = 2
        link_aggregator.active_connections = {'eth0': {'active': True}}
        link_aggregator.packet_queues = {'eth0': [b"packet1", b"packet2"]}

        # Try to queue another packet
        result = link_aggregator.queue_packet(b"packet3", 'eth0')
        assert result == False

        # Queue should still have 2 packets
        assert len(link_aggregator.packet_queues['eth0']) == 2
