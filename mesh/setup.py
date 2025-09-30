"""
Setup script for Mesh Network Bonding Application
"""

from setuptools import setup, find_packages
import os

# Read the contents of README file
this_directory = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(this_directory, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name="mesh-network-bonding",
    version="1.0.0",
    author="Mesh Network Team",
    description="A Python-based mesh networking application with connection bonding features",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-repo/mesh-network-bonding",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: MIT License",
        "Operating System :: POSIX :: Linux",
        "Operating System :: MacOS :: MacOS X",
        "Operating System :: Microsoft :: Windows",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: System :: Networking",
        "Topic :: Internet",
    ],
    python_requires=">=3.8",
    install_requires=[
        "scapy>=2.5.0",
        "psutil>=5.9.0",
        "netifaces>=0.11.0",
        "click>=8.1.0",
        "rich>=13.0.0",
        "asyncio-mqtt>=0.13.0",
        "pydantic>=2.0.0",
        "loguru>=0.6.0",
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "matplotlib>=3.7.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-mock>=3.10.0",
            "black>=22.0.0",
            "flake8>=5.0.0",
            "mypy>=1.0.0",
        ],
        "docs": [
            "sphinx>=5.0.0",
            "sphinx-rtd-theme>=1.2.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "mesh-network=main:main",
            "mesh-cli=mesh_network.cli.cli:cli",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords="mesh networking bonding connection aggregation failover",
    project_urls={
        "Bug Reports": "https://github.com/your-repo/mesh-network-bonding/issues",
        "Source": "https://github.com/your-repo/mesh-network-bonding",
        "Documentation": "https://mesh-network-bonding.readthedocs.io/",
    },
)
