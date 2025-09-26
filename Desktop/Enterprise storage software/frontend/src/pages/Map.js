import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Warehouse as WarehouseIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom warehouse marker icon
const createWarehouseIcon = (utilizationRate) => {
  let color = '#4caf50'; // green for low utilization
  if (utilizationRate > 80) color = '#f44336'; // red for high utilization
  else if (utilizationRate > 60) color = '#ff9800'; // orange for medium utilization

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">
          📦
        </div>
      </div>
    `,
    className: 'custom-warehouse-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Component to fit map bounds to markers
const FitBoundsToMarkers = ({ warehouses }) => {
  const map = useMap();

  useEffect(() => {
    if (warehouses.length > 0) {
      const bounds = L.latLngBounds(
        warehouses.map(warehouse => [warehouse.latitude, warehouse.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, warehouses]);

  return null;
};

const Map = () => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [mapView, setMapView] = useState('all'); // 'all', 'utilization', 'tenants'

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/warehouse/map-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMapData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError(err.response?.data?.error || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (rate) => {
    if (rate > 80) return 'error';
    if (rate > 60) return 'warning';
    return 'success';
  };

  const getUtilizationLabel = (rate) => {
    if (rate > 80) return 'High';
    if (rate > 60) return 'Medium';
    return 'Low';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading warehouse locations...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchMapData}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (!mapData || !mapData.warehouses.length) {
    return (
      <Container maxWidth="xl">
        <Alert severity="info" sx={{ mt: 2 }}>
          No warehouse locations found. Please add coordinates to your warehouses.
        </Alert>
      </Container>
    );
  }

  const { warehouses, statistics } = mapData;

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🗺️ Warehouse Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Interactive map showing all warehouse locations and utilization data
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary.main">
                    {statistics.total_warehouses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Warehouses
                  </Typography>
                </Box>
                <WarehouseIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main">
                    {statistics.overall_utilization}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Utilization
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="info.main">
                    {statistics.total_tenants}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Tenants
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    {formatCurrency(statistics.total_capacity)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Capacity
                  </Typography>
                </Box>
                <LocationIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map View Controls */}
      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="outlined" aria-label="map view controls">
          <Button
            variant={mapView === 'all' ? 'contained' : 'outlined'}
            onClick={() => setMapView('all')}
          >
            All Warehouses
          </Button>
          <Button
            variant={mapView === 'utilization' ? 'contained' : 'outlined'}
            onClick={() => setMapView('utilization')}
          >
            By Utilization
          </Button>
          <Button
            variant={mapView === 'tenants' ? 'contained' : 'outlined'}
            onClick={() => setMapView('tenants')}
          >
            By Tenant Count
          </Button>
        </ButtonGroup>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchMapData} sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Map Container */}
      <Paper elevation={3} sx={{ height: '600px', mb: 3 }}>
        <MapContainer
          center={[31.9686, -99.9018]} // Center of Texas
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBoundsToMarkers warehouses={warehouses} />

          {warehouses.map((warehouse) => (
            <Marker
              key={warehouse.id}
              position={[warehouse.latitude, warehouse.longitude]}
              icon={createWarehouseIcon(warehouse.utilization_rate)}
              eventHandlers={{
                click: () => setSelectedWarehouse(warehouse),
              }}
            >
              <Popup>
                <Box sx={{ minWidth: 250 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {warehouse.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {warehouse.address}, {warehouse.city}, {warehouse.state}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={`${warehouse.utilization_rate}% utilized`}
                      color={getUtilizationColor(warehouse.utilization_rate)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${warehouse.tenant_count} tenants`}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Capacity
                      </Typography>
                      <Typography variant="body2">
                        {warehouse.total_capacity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Used
                      </Typography>
                      <Typography variant="body2">
                        {warehouse.used_capacity}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Locations
                      </Typography>
                      <Typography variant="body2">
                        {warehouse.location_stats.total_locations}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Available
                      </Typography>
                      <Typography variant="body2">
                        {warehouse.location_stats.available_locations}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      // TODO: Navigate to warehouse details
                      console.log('Navigate to warehouse:', warehouse.id);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Paper>

      {/* Selected Warehouse Details */}
      {selectedWarehouse && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📍 {selectedWarehouse.name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {selectedWarehouse.address}, {selectedWarehouse.city}, {selectedWarehouse.state} {selectedWarehouse.postal_code}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Coordinates
                </Typography>
                <Typography variant="body1">
                  {selectedWarehouse.latitude.toFixed(4)}, {selectedWarehouse.longitude.toFixed(4)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Utilization
                </Typography>
                <Typography variant="h6" color={`${getUtilizationColor(selectedWarehouse.utilization_rate)}.main`}>
                  {selectedWarehouse.utilization_rate}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Tenants
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {selectedWarehouse.tenant_count}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Capacity
                </Typography>
                <Typography variant="h6">
                  {selectedWarehouse.total_capacity}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Available Locations
                </Typography>
                <Typography variant="h6" color="success.main">
                  {selectedWarehouse.location_stats.available_locations}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Map;
