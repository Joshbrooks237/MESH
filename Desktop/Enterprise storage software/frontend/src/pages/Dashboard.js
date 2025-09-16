import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching dashboard metrics
    const fetchMetrics = async () => {
      try {
        // In a real app, this would be an API call
        const mockMetrics = {
          inventoryValue: 2456789.50,
          lowStockItems: 23,
          outOfStockItems: 5,
          recentTransactions: 145,
          warehouseUtilization: {
            totalLocations: 15420,
            occupiedLocations: 12850,
            utilizationRate: 83.4
          },
          timestamp: new Date().toISOString()
        };
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Set up real-time updates (would connect to WebSocket in real app)
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search tenants
      const tenantResponse = await axios.get(`http://localhost:5001/api/tenants?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Search units (by location code)
      const unitResponse = await axios.get(`http://localhost:5001/api/warehouse/1/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const matchingUnits = unitResponse.data.locations.filter(unit =>
        unit.location_code.toLowerCase().includes(query.toLowerCase()) ||
        (unit.is_occupied && unit.tenants?.some(tenant =>
          tenant.first_name.toLowerCase().includes(query.toLowerCase()) ||
          tenant.last_name.toLowerCase().includes(query.toLowerCase()) ||
          tenant.email.toLowerCase().includes(query.toLowerCase())
        ))
      );

      // Combine results
      const results = [
        ...tenantResponse.data.tenants.map(tenant => ({
          type: 'tenant',
          id: tenant.id,
          title: `${tenant.first_name} ${tenant.last_name}`,
          subtitle: tenant.email,
          detail: tenant.phone || 'No phone',
          icon: GroupIcon,
          onClick: () => navigate(`/tenants/${tenant.id}`)
        })),
        ...matchingUnits.slice(0, 5).map(unit => ({
          type: 'unit',
          id: unit.id,
          title: unit.location_code,
          subtitle: unit.is_occupied ? 'Occupied' : 'Available',
          detail: `Aisle ${unit.aisle}, Level ${unit.level}`,
          icon: LocationIcon,
          onClick: () => navigate('/walkthrough')
        }))
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Mock data for charts
  const inventoryTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: [2100000, 2200000, 2150000, 2300000, 2350000, 2456789],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const warehouseUtilizationData = {
    labels: ['Occupied', 'Available', 'Blocked'],
    datasets: [
      {
        data: [83.4, 14.2, 2.4],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const stockAlertsData = {
    labels: ['Normal', 'Low Stock', 'Out of Stock', 'Overstock'],
    datasets: [
      {
        label: 'Products',
        data: [1250, 23, 5, 12],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Enterprise Storage Dashboard
      </Typography>

      {/* Universal Search Bar */}
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
          🔍 Quick Search - Find Anything
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          Search tenants by name, email, phone • Search units by location code • Search across your entire facility
        </Typography>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tenants, units, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searchLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
              },
              '& .MuiInputBase-input': {
                color: 'rgba(0, 0, 0, 0.87)',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.6)' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={searchLoading || !searchQuery.trim()}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              minWidth: '120px'
            }}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </Button>
          <Button
            variant="outlined"
            onClick={clearSearch}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Clear
          </Button>
        </Box>

        {/* Quick Navigation */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ViewListIcon />}
            onClick={() => navigate('/walkthrough')}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Walkthrough
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => navigate('/tenants')}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Tenants
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<LocationIcon />}
            onClick={() => navigate('/warehouse')}
            sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' }}
          >
            Units
          </Button>
        </Box>
      </Paper>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Search Results ({searchResults.length})
          </Typography>
          <Grid container spacing={2}>
            {searchResults.map((result, index) => {
              const IconComponent = result.icon;
              return (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      }
                    }}
                    onClick={result.onClick}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconComponent color="primary" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {result.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.subtitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.detail}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="primary">
                        {result.type}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Inventory Value</Typography>
              </Box>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                ${(metrics?.inventoryValue || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total current value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarehouseIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Warehouse Utilization</Typography>
              </Box>
              <Typography variant="h4" color="secondary" sx={{ fontWeight: 'bold' }}>
                {metrics?.warehouseUtilization?.utilizationRate || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.warehouseUtilization?.occupiedLocations || 0} of {metrics?.warehouseUtilization?.totalLocations || 0} locations
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Stock Alerts</Typography>
              </Box>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {metrics?.lowStockItems || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Today's Transactions</Typography>
              </Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {metrics?.recentTransactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Movements processed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          System Alerts
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>{metrics?.outOfStockItems || 0} items are out of stock</strong> - Immediate action required
          </Typography>
        </Alert>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Warehouse utilization at {metrics?.warehouseUtilization?.utilizationRate || 0}%</strong> - Consider expansion planning
          </Typography>
        </Alert>
        <Alert severity="success">
          <Typography variant="body2">
            <strong>System operating normally</strong> - All critical systems online
          </Typography>
        </Alert>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inventory Value Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={inventoryTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Warehouse Utilization
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={warehouseUtilizationData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={stockAlertsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip
              icon={<CheckCircleIcon />}
              label="Generate Report"
              clickable
              color="primary"
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<InventoryIcon />}
              label="Add Product"
              clickable
              color="secondary"
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<WarehouseIcon />}
              label="Scan Inventory"
              clickable
              color="success"
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<ErrorIcon />}
              label="View Alerts"
              clickable
              color="warning"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
