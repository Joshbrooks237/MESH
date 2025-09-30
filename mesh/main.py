#!/usr/bin/env python3
"""
Mesh Network Bonding Application
A Python-based mesh networking application with connection bonding features.
"""

import asyncio
import sys
from loguru import logger
from mesh_network.cli.cli import cli
from mesh_network.core.mesh_manager import MeshManager


def main():
    """Main entry point for the mesh networking application."""
    try:
        # Configure logging
        logger.remove()
        logger.add(sys.stdout, level="INFO", format="{time} {level} {message}")
        logger.add("mesh_network.log", level="DEBUG", rotation="10 MB")

        logger.info("Starting Mesh Network Bonding Application")

        # Start the CLI if no arguments provided, otherwise run mesh manager
        if len(sys.argv) == 1:
            # Run CLI interface
            cli()
        else:
            # Parse command line arguments and run mesh manager
            asyncio.run(run_mesh_manager())

    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.error(f"Application error: {e}")
        sys.exit(1)


async def run_mesh_manager():
    """Run the mesh manager with provided configuration."""
    mesh_manager = MeshManager()
    await mesh_manager.start()


if __name__ == "__main__":
    main()
