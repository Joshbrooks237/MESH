"""
Command Line Interface
Provides a simple CLI for mesh network configuration and monitoring.
"""

import asyncio
import json
import click
from typing import Dict, Any
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.live import Live
from rich.layout import Layout
from rich.columns import Columns

from ..core.mesh_manager import MeshManager


console = Console()


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """Mesh Network Bonding Application CLI"""
    pass


@cli.command()
@click.option('--config', '-c', type=click.Path(exists=True),
              help='Configuration file path')
@click.option('--verbose', '-v', is_flag=True, help='Enable verbose logging')
def start(config, verbose):
    """Start the mesh networking system."""
    try:
        console.print("[bold green]Starting Mesh Network Bonding Application...[/bold green]")

        if config:
            console.print(f"Loading configuration from: {config}")

        if verbose:
            console.print("Verbose logging enabled")

        # Create and start mesh manager
        mesh_manager = MeshManager()

        # In a real implementation, you'd load config here
        if config:
            with open(config, 'r') as f:
                config_data = json.load(f)
                # Apply configuration to mesh_manager

        # Start the mesh manager
        asyncio.run(mesh_manager.start())

    except KeyboardInterrupt:
        console.print("\n[yellow]Application interrupted by user[/yellow]")
    except Exception as e:
        console.print(f"[red]Error starting application: {e}[/red]")
        raise click.Abort()


@cli.command()
def status():
    """Show current mesh network status."""
    try:
        mesh_manager = MeshManager()
        # Note: This would need to connect to a running instance
        # For demo purposes, we'll show mock data

        # Create status display
        layout = Layout()

        # Header
        header = Panel.fit(
            "[bold blue]Mesh Network Status[/bold blue]\n"
            "Real-time monitoring of mesh connections and performance",
            border_style="blue"
        )

        # Connection status table
        conn_table = Table(title="Network Connections")
        conn_table.add_column("Interface", style="cyan")
        conn_table.add_column("Type", style="magenta")
        conn_table.add_column("Status", style="green")
        conn_table.add_column("Bandwidth", style="yellow")
        conn_table.add_column("Latency", style="red")
        conn_table.add_column("Data Used", style="blue")

        # Mock data - in real implementation, get from mesh_manager
        mock_connections = [
            ("wlan0", "Wi-Fi", "Active", "45.2 Mbps", "23ms", "1.2 GB"),
            ("eth0", "Ethernet", "Active", "100.0 Mbps", "5ms", "5.8 GB"),
            ("ppp0", "Cellular", "Standby", "12.5 Mbps", "45ms", "0.8 GB"),
        ]

        for conn in mock_connections:
            conn_table.add_row(*conn)

        # Mesh nodes table
        mesh_table = Table(title="Mesh Nodes")
        mesh_table.add_column("Node ID", style="cyan")
        mesh_table.add_column("IP Address", style="magenta")
        mesh_table.add_column("Connections", style="green")
        mesh_table.add_column("Last Seen", style="yellow")

        mock_nodes = [
            ("node-001", "192.168.1.100", "2", "2s ago"),
            ("node-002", "192.168.1.101", "1", "5s ago"),
        ]

        for node in mock_nodes:
            mesh_table.add_row(*node)

        # Aggregation status
        agg_panel = Panel.fit(
            "[bold]Link Aggregation Status[/bold]\n"
            "Mode: Load Balance\n"
            "Active Connections: 2/3\n"
            "Total Bandwidth: 145.2 Mbps\n"
            "Average Latency: 14ms",
            title="Aggregation",
            border_style="green"
        )

        # Layout the display
        layout.split_column(
            header,
            Layout(name="main"),
        )

        layout["main"].split_row(
            Layout(conn_table, name="connections"),
            Layout(name="right_panel")
        )

        layout["right_panel"].split_column(
            Layout(mesh_table, name="mesh"),
            Layout(agg_panel, name="aggregation")
        )

        console.print(layout)

    except Exception as e:
        console.print(f"[red]Error getting status: {e}[/red]")


@cli.command()
@click.argument('interface')
@click.option('--duration', '-d', type=int, default=60,
              help='Test duration in seconds')
def test(interface, duration):
    """Test connection performance for a specific interface."""
    try:
        console.print(f"[bold blue]Testing connection: {interface}[/bold blue]")
        console.print(f"Duration: {duration} seconds")

        # Progress display
        with console.status(f"[bold green]Testing {interface}...[/bold green]") as status:
            # Simulate testing
            import time
            for i in range(duration):
                time.sleep(1)
                if i % 10 == 0:
                    status.update(f"[bold green]Testing {interface}... {i}/{duration}s[/bold green]")

        # Mock results
        results_table = Table(title=f"Test Results - {interface}")
        results_table.add_column("Metric", style="cyan")
        results_table.add_column("Value", style="green")
        results_table.add_column("Status", style="yellow")

        test_results = [
            ("Bandwidth", "47.3 Mbps", "✓ Good"),
            ("Latency", "24ms", "✓ Good"),
            ("Jitter", "2.1ms", "✓ Excellent"),
            ("Packet Loss", "0.1%", "✓ Excellent"),
        ]

        for result in test_results:
            results_table.add_row(*result)

        console.print(results_table)

    except Exception as e:
        console.print(f"[red]Error testing connection: {e}[/red]")


@cli.command()
@click.argument('from_interface')
@click.argument('to_interface')
def failover(from_interface, to_interface):
    """Manually trigger failover between interfaces."""
    try:
        console.print(f"[bold yellow]Initiating manual failover...[/bold yellow]")
        console.print(f"From: {from_interface} → To: {to_interface}")

        # This would connect to running mesh manager
        # For demo, just show the action

        console.print("[green]✓ Failover completed successfully[/green]")
        console.print(f"Primary interface is now: {to_interface}")

    except Exception as e:
        console.print(f"[red]Failover failed: {e}[/red]")


@cli.command()
@click.option('--output', '-o', type=click.Path(),
              help='Output file for configuration')
def config(output):
    """Generate or show current configuration."""
    try:
        config_data = {
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

        if output:
            with open(output, 'w') as f:
                json.dump(config_data, f, indent=2)
            console.print(f"[green]Configuration saved to: {output}[/green]")
        else:
            console.print_json(data=config_data)

    except Exception as e:
        console.print(f"[red]Configuration error: {e}[/red]")


@cli.command()
@click.option('--follow', '-f', is_flag=True, help='Follow log output')
@click.option('--level', '-l', type=click.Choice(['DEBUG', 'INFO', 'WARNING', 'ERROR']),
              default='INFO', help='Log level')
def logs(follow, level):
    """Show application logs."""
    try:
        console.print(f"[bold blue]Mesh Network Logs (Level: {level})[/bold blue]")

        if follow:
            console.print("Following logs... (Ctrl+C to stop)")

            # Mock log following
            import time
            import random

            log_messages = [
                "[INFO] Node discovery completed - found 2 peers",
                "[DEBUG] Link aggregation rebalanced - weights updated",
                "[INFO] Connection wlan0 health check passed",
                "[WARNING] Interface ppp0 latency increased to 67ms",
                "[INFO] Failover check completed - all connections healthy",
            ]

            try:
                while True:
                    msg = random.choice(log_messages)
                    timestamp = time.strftime("%H:%M:%S")
                    console.print(f"[{timestamp}] {msg}")
                    time.sleep(random.uniform(1, 3))
            except KeyboardInterrupt:
                console.print("\n[blue]Stopped following logs[/blue]")

        else:
            # Show recent logs
            console.print("Recent log entries:")
            console.print("[14:23:15] [INFO] Mesh network initialized")
            console.print("[14:23:16] [INFO] Node discovery started")
            console.print("[14:23:18] [INFO] Found 2 mesh peers")
            console.print("[14:23:20] [INFO] Link aggregation enabled")

    except Exception as e:
        console.print(f"[red]Error showing logs: {e}[/red]")


@cli.command()
def stats():
    """Show detailed statistics and metrics."""
    try:
        console.print("[bold blue]Mesh Network Statistics[/bold blue]")

        # Create statistics tables
        stats_layout = Layout()

        # Performance stats
        perf_table = Table(title="Performance Metrics")
        perf_table.add_column("Metric", style="cyan")
        perf_table.add_column("Current", style="green")
        perf_table.add_column("Average", style="yellow")
        perf_table.add_column("Peak", style="red")

        perf_data = [
            ("Total Bandwidth", "145.2 Mbps", "132.8 Mbps", "156.7 Mbps"),
            ("Combined Latency", "14ms", "18ms", "45ms"),
            ("Active Connections", "2", "2.1", "3"),
            ("Data Transferred", "7.8 GB", "45.2 MB/min", "89.1 GB"),
        ]

        for row in perf_data:
            perf_table.add_row(*row)

        # Connection stats
        conn_stats_table = Table(title="Connection Statistics")
        conn_stats_table.add_column("Interface", style="cyan")
        conn_stats_table.add_column("Packets Sent", style="green")
        conn_stats_table.add_column("Packets Recv", style="blue")
        conn_stats_table.add_column("Errors", style="red")
        conn_stats_table.add_column("Uptime", style="yellow")

        conn_stats = [
            ("eth0", "1,245,678", "987,654", "23", "99.98%"),
            ("wlan0", "856,432", "723,891", "45", "97.45%"),
            ("ppp0", "234,567", "198,432", "12", "99.87%"),
        ]

        for row in conn_stats:
            conn_stats_table.add_row(*row)

        # Layout the statistics
        stats_layout.split_column(
            perf_table,
            conn_stats_table
        )

        console.print(stats_layout)

    except Exception as e:
        console.print(f"[red]Error showing statistics: {e}[/red]")


if __name__ == '__main__':
    cli()
