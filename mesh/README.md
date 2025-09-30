# Mesh Network Bonding Application

A Python-based mesh networking application that integrates connection bonding features similar to Speedify. It aggregates multiple internet sources (Wi-Fi, cellular hotspots) across mesh nodes for improved speed and redundancy.

## Features

### 🔗 Mesh Networking
- **Node Discovery**: Automatic peer detection using Scapy-based network scanning
- **Dynamic Topology**: Self-organizing mesh network with automatic node management
- **Scalable Architecture**: Support for multiple nodes in the same network segment

### ⚡ Connection Bonding
- **Multi-Interface Support**: Wi-Fi, Ethernet, Cellular, and other network interfaces
- **Link Aggregation**: Intelligent load balancing across multiple connections
- **Speed Optimization**: Combined bandwidth from all available connections
- **Adaptive Routing**: Dynamic path selection based on performance metrics

### 🛡️ Failover & Redundancy
- **Automatic Failover**: Seamless switching between connections when issues detected
- **Health Monitoring**: Continuous connection quality assessment
- **Redundancy Management**: Multiple backup paths for critical communications

### 📊 Monitoring & Management
- **Real-time Metrics**: Bandwidth, latency, packet loss, and jitter monitoring
- **Data Cap Management**: Track and manage data usage limits
- **Performance Analytics**: Historical performance data and trend analysis
- **Rich CLI Interface**: Comprehensive command-line tools for monitoring and configuration

## Architecture

```
mesh_network/
├── core/
│   └── mesh_manager.py          # Main coordinator
├── networking/
│   ├── node_discovery.py        # Peer discovery using Scapy
│   └── connection_manager.py    # Interface management
├── aggregation/
│   └── link_aggregator.py       # Load balancing & bonding
├── failover/
│   └── failover_manager.py      # Redundancy & failover
├── utils/
│   └── metrics.py              # Performance monitoring
├── cli/
│   └── cli.py                  # Command-line interface
└── tests/                      # Comprehensive test suite
```

## Installation

### Prerequisites
- Python 3.8+
- Root/administrator privileges (for network interface management)
- Linux/macOS/Windows (Linux recommended for full feature support)

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Key Dependencies
- **Scapy**: Network packet manipulation and analysis
- **psutil**: System and network interface monitoring
- **netifaces**: Network interface information
- **Click**: Command-line interface framework
- **Rich**: Beautiful terminal output
- **NumPy**: Performance calculations
- **Pandas**: Data analysis and metrics

## Usage

### Basic Usage

```bash
# Start the mesh network application
python main.py

# Or use the CLI interface
python -m mesh_network.cli.cli --help
```

### CLI Commands

```bash
# Start the mesh networking system
python main.py start

# Show current status
python main.py status

# Test connection performance
python main.py test wlan0 --duration 60

# Manual failover
python main.py failover eth0 wlan0

# Show logs
python main.py logs --follow

# Show detailed statistics
python main.py stats

# Generate configuration
python main.py config --output config.json
```

### Configuration

Create a configuration file (`config.json`):

```json
{
  "mesh_network": {
    "node_discovery": {
      "port": 9999,
      "broadcast_interval": 5,
      "node_timeout": 60
    },
    "link_aggregation": {
      "mode": "load_balance",
      "max_queue_size": 1000,
      "rebalance_interval": 30
    },
    "failover": {
      "threshold": 3,
      "recovery_threshold": 2,
      "monitoring_interval": 10
    },
    "interfaces": {
      "primary": "eth0",
      "backups": ["wlan0", "ppp0"]
    }
  }
}
```

## Core Components

### Mesh Manager
The central coordinator that manages all mesh networking operations:
- Initializes local node and discovers peers
- Coordinates connection aggregation and failover
- Monitors system health and performance

### Node Discovery
Uses Scapy for network scanning and peer advertisement:
- Broadcast-based discovery on local network
- Node advertisement with capability information
- Automatic cleanup of stale nodes

### Connection Manager
Manages multiple network interfaces:
- Interface detection and type classification
- Connection health monitoring
- Data cap tracking and enforcement

### Link Aggregator
Implements connection bonding and load balancing:
- Weighted load distribution
- Adaptive connection selection
- Queue management for packet distribution

### Failover Manager
Handles automatic redundancy and recovery:
- Health checking with configurable thresholds
- Automatic failover with minimal disruption
- Recovery monitoring and self-healing

### Metrics Collector
Comprehensive performance monitoring:
- Real-time bandwidth and latency measurement
- Historical data collection and analysis
- Performance recommendations and alerts

## Performance Optimization

### Latency Optimization
- **Path Selection**: Choose lowest latency paths for time-sensitive traffic
- **Connection Prioritization**: Prefer fast connections for small packets
- **Adaptive Routing**: Dynamic routing based on real-time conditions

### Bandwidth Management
- **Load Balancing**: Distribute traffic across all available connections
- **Data Cap Awareness**: Respect data limits on metered connections
- **Quality of Service**: Prioritize critical traffic when needed

### Resource Efficiency
- **Minimal Overhead**: Efficient packet processing and routing
- **Background Monitoring**: Non-intrusive performance tracking
- **Smart Queuing**: Intelligent packet queuing and reordering

## Security Considerations

### Network Security
- **Local Network Only**: Designed for trusted local network environments
- **No Internet Exposure**: Mesh communication stays within local segment
- **Input Validation**: Comprehensive validation of network messages

### Best Practices
- Run with minimal privileges required
- Monitor system logs for anomalies
- Keep dependencies updated
- Test in isolated network environments first

## Testing

Run the comprehensive test suite:

```bash
python -m pytest mesh_network/tests/
```

### Test Coverage
- Unit tests for all core components
- Integration tests for system interactions
- Mock-based testing for network operations
- Performance and stress testing

## Troubleshooting

### Common Issues

**Node Discovery Fails**
- Check network permissions and firewall settings
- Ensure Scapy can access network interfaces
- Verify local network allows broadcast traffic

**Connection Aggregation Not Working**
- Check interface permissions
- Verify interfaces are up and have IP addresses
- Review system routing table conflicts

**High Latency or Packet Loss**
- Test individual connections first
- Check for network congestion or interference
- Review interface signal strength (Wi-Fi/cellular)

### Debug Mode
Enable verbose logging for troubleshooting:

```bash
python main.py start --verbose
```

### Logs Location
- Application logs: `mesh_network.log`
- System logs: Check system journal/dmesg for network issues

## Development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Style
- Follow PEP 8 guidelines
- Use type hints for function parameters
- Add comprehensive docstrings
- Keep functions focused and modular

### Testing Guidelines
- Write tests for all new functionality
- Use mocks for external dependencies
- Test both success and failure scenarios
- Include performance tests where applicable

## License

This project is open source. See LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review application logs
- Test with minimal configuration
- Report bugs with detailed information

## Future Enhancements

- **Cross-Platform Support**: Enhanced Windows and macOS compatibility
- **VPN Integration**: Secure mesh communication over internet
- **Cloud Coordination**: Central coordination for distributed meshes
- **Advanced QoS**: Traffic shaping and priority queuing
- **Web Interface**: Browser-based monitoring and configuration
- **Container Support**: Docker and Kubernetes integration
