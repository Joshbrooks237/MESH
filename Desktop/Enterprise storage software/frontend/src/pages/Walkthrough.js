import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Walkthrough = () => {
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [tenantUnits, setTenantUnits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorageUnits();
    fetchTenants();
    fetchTenantUnits();
    fetchPayments();
  }, []);

  useEffect(() => {
    filterUnits();
  }, [units, tenants, tenantUnits, searchTerm, statusFilter]);

  const fetchStorageUnits = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/warehouse/1/locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnits(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching storage units:', error);
      setError('Failed to load storage units');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchTenantUnits = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allTenantUnits = [];
      for (const tenant of response.data.tenants || []) {
        try {
          const unitResponse = await axios.get(`http://localhost:5001/api/tenants/${tenant.id}/units`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          allTenantUnits.push(...(unitResponse.data.units || []));
        } catch (error) {
          console.error(`Error fetching units for tenant ${tenant.id}:`, error);
        }
      }
      setTenantUnits(allTenantUnits);
    } catch (error) {
      console.error('Error fetching tenant units:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allPayments = [];
      for (const tenant of response.data.tenants || []) {
        try {
          const paymentResponse = await axios.get(`http://localhost:5001/api/tenants/${tenant.id}/payments`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          allPayments.push(...(paymentResponse.data.payments || []));
        } catch (error) {
          console.error(`Error fetching payments for tenant ${tenant.id}:`, error);
        }
      }
      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleUnitClick = (unit) => {
    if (unit.is_occupied) {
      // Find the tenant for this unit
      const tenant = tenants.find(t =>
        t.units && t.units.some(u => u.location_id === unit.id)
      );
      setSelectedUnit(unit);
      setSelectedTenant(tenant);
    } else {
      setSelectedUnit(unit);
      setSelectedTenant(null);
    }
  };

  const handleAssignUnit = (unit) => {
    setSelectedUnit(unit);
    setAvailableTenants(tenants.filter(t => !t.units || t.units.length === 0));
    setAssignDialogOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedUnit || !selectedTenant) return;

    try {
      const assignData = {
        tenantId: selectedTenant.id,
        locationId: selectedUnit.id,
        startDate: new Date().toISOString().split('T')[0],
        monthlyRate: 50.00, // Default rate
        depositAmount: 25.00,
        notes: 'Assigned via walkthrough'
      };

      await axios.post(`http://localhost:5001/api/tenants/${selectedTenant.id}/units`, assignData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAssignDialogOpen(false);
      setSelectedUnit(null);
      setSelectedTenant(null);
      fetchStorageUnits(); // Refresh the units
      fetchTenants(); // Refresh the tenants

    } catch (error) {
      console.error('Error assigning unit:', error);
      setError('Failed to assign unit');
    }
  };

  // Filter units based on search term and status filter
  const [filteredUnits, setFilteredUnits] = useState([]);

  const filterUnits = () => {
    let filtered = units;

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(unit => {
        // Search by location code
        if (unit.location_code.toLowerCase().includes(searchLower)) return true;

        // Search by tenant if unit is occupied
        if (unit.is_occupied) {
          const tenant = tenants.find(t =>
            t.units && t.units.some(u => u.location_id === unit.id)
          );
          if (tenant) {
            return tenant.first_name.toLowerCase().includes(searchLower) ||
                   tenant.last_name.toLowerCase().includes(searchLower) ||
                   tenant.email.toLowerCase().includes(searchLower) ||
                   tenant.phone?.toLowerCase().includes(searchLower);
          }
        }

        return false;
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => {
        switch (statusFilter) {
          case 'current':
            return unit.is_occupied;
          case 'vacant':
            return !unit.is_occupied && !unit.is_blocked;
          case 'late':
            // For now, we'll mark some units as "late" for demo purposes
            // In a real system, this would check payment status
            return unit.is_occupied && unit.aisle % 3 === 0; // Every 3rd aisle is "late"
          default:
            return true;
        }
      });
    }

    setFilteredUnits(filtered);
  };

  // Group units by aisle for better visualization
  const unitsByAisle = filteredUnits.reduce((acc, unit) => {
    if (!acc[unit.aisle]) {
      acc[unit.aisle] = [];
    }
    acc[unit.aisle].push(unit);
    return acc;
  }, {});

  const getUnitColor = (unit) => {
    if (unit.is_blocked) {
      return '#f44336'; // Red for blocked
    }
    if (unit.is_occupied) {
      // Check if payment is late (for demo: every 3rd aisle)
      if (unit.aisle % 3 === 0) {
        return '#ff9800'; // Orange for late payments
      }
      return '#4caf50'; // Green for occupied and current
    }
    return '#2196f3'; // Blue for available
  };

  const getUnitStatus = (unit) => {
    if (unit.is_blocked) return 'Blocked';
    if (unit.is_occupied) {
      // Check if payment is late (for demo: every 3rd aisle)
      if (unit.aisle % 3 === 0) {
        return 'Late Payment';
      }
      return 'Current';
    }
    return 'Available';
  };

  const getTenantBillingInfo = (unit) => {
    if (!unit.is_occupied) return null;

    const tenant = tenants.find(t =>
      t.units && t.units.some(u => u.location_id === unit.id)
    );

    if (!tenant) return null;

    // Find the tenant unit relationship
    const tenantUnit = tenantUnits.find(tu => tu.location_id === unit.id);

    if (!tenantUnit) return null;

    // Calculate next billing date (anniversary billing)
    const startDate = new Date(tenantUnit.start_date);
    const now = new Date();
    const nextBillingDate = new Date(startDate);
    nextBillingDate.setFullYear(now.getFullYear());
    if (nextBillingDate < now) {
      nextBillingDate.setFullYear(now.getFullYear() + 1);
    }

    // Calculate days until next billing
    const daysUntilBilling = Math.ceil((nextBillingDate - now) / (1000 * 60 * 60 * 24));

    // Check payment status
    const isLate = unit.aisle % 3 === 0; // Demo logic

    return {
      tenant,
      tenantUnit,
      nextBillingDate,
      daysUntilBilling,
      isLate,
      amountDue: tenantUnit.monthly_rate,
      lastPayment: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    };
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Storage Facility Walkthrough
        </Typography>
        <Typography>Loading storage units...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
        Storage Facility Walkthrough
      </Typography>

      {/* Enhanced Search Bar */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search tenants by name, email, phone, or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Units</MenuItem>
                <MenuItem value="current">Current Tenants</MenuItem>
                <MenuItem value="late">Late Payments</MenuItem>
                <MenuItem value="vacant">Vacant Units</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                sx={{ minWidth: 'auto' }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/tenants')}
                sx={{ minWidth: 'auto' }}
              >
                Manage Tenants
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Search Results Summary */}
        {searchTerm && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Found {filteredUnits.length} units matching "{searchTerm}"
              {statusFilter !== 'all' && ` (${statusFilter} status)`}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {filteredUnits.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtered Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {filteredUnits.filter(u => u.is_occupied).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {filteredUnits.filter(u => !u.is_occupied && !u.is_blocked).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {filteredUnits.filter(u => u.is_occupied && u.aisle % 3 === 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late Payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Storage Units Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Storage Units Layout
        </Typography>

        {Object.keys(unitsByAisle).sort((a, b) => parseInt(a) - parseInt(b)).map(aisle => (
          <Box key={aisle} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Aisle {aisle}
            </Typography>

            <Grid container spacing={1}>
              {unitsByAisle[aisle]
                .sort((a, b) => a.position - b.position)
                .map(unit => {
                  const tenant = tenants.find(t =>
                    t.units && t.units.some(u => u.location_id === unit.id)
                  );

                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={unit.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: getUnitColor(unit),
                          color: 'white',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            transition: 'transform 0.2s'
                          }
                        }}
                        onClick={() => handleUnitClick(unit)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {unit.location_code}
                          </Typography>

                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={getUnitStatus(unit)}
                              size="small"
                              sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>

                          {tenant && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {tenant.first_name} {tenant.last_name}
                              </Typography>
                              {unit.aisle % 3 === 0 && (() => {
                                const tenant = tenants.find(t =>
                                  t.units && t.units.some(u => u.location_id === unit.id)
                                );
                                const tenantUnit = tenant?.units?.find(u => u.location_id === unit.id);
                                return (
                                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                                    <MoneyIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                    ${tenantUnit ? tenantUnit.monthly_rate : '50.00'}/mo - LATE
                                  </Typography>
                                );
                              })()}
                            </Box>
                          )}

                          {unit.is_occupied && (
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  color: 'white',
                                  borderColor: 'white',
                                  fontSize: '0.7rem',
                                  minWidth: 'auto',
                                  p: '2px 8px'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tenants/${tenant.id}`);
                                }}
                              >
                                View
                              </Button>
                            </Box>
                          )}

                          {!unit.is_occupied && !unit.is_blocked && (
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                sx={{
                                  color: 'white',
                                  borderColor: 'white',
                                  fontSize: '0.7rem',
                                  minWidth: 'auto',
                                  p: '2px 8px'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignUnit(unit);
                                }}
                              >
                                Assign
                              </Button>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        ))}
      </Box>

      {/* Unit Details Dialog */}
      <Dialog open={!!selectedUnit && !assignDialogOpen} onClose={() => setSelectedUnit(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Unit {selectedUnit?.location_code}
        </DialogTitle>
        <DialogContent>
          {selectedUnit && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {getUnitStatus(selectedUnit)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Location:</strong> Aisle {selectedUnit.aisle}, Position {selectedUnit.position}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Capacity:</strong> {selectedUnit.max_weight_kg}kg max
              </Typography>

              {selectedTenant && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Tenant
                  </Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedTenant.first_name} {selectedTenant.last_name}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedTenant.email}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedTenant.phone || 'Not provided'}
                  </Typography>

                  {/* Billing Information */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Billing Information
                    </Typography>
                    {(() => {
                      const billingInfo = getTenantBillingInfo(selectedUnit);
                      if (!billingInfo) return null;

                      return (
                        <>
                          <Typography variant="body1">
                            <strong>Monthly Rate:</strong> ${billingInfo.amountDue}/month
                          </Typography>
                          <Typography variant="body1">
                            <strong>Next Billing:</strong> {billingInfo.nextBillingDate.toLocaleDateString()} ({billingInfo.daysUntilBilling} days)
                          </Typography>
                          <Typography variant="body1">
                            <strong>Last Payment:</strong> {billingInfo.lastPayment.toLocaleDateString()}
                          </Typography>
                          <Typography variant="body1" sx={{ color: billingInfo.isLate ? 'error.main' : 'success.main' }}>
                            <strong>Payment Status:</strong> {billingInfo.isLate ? 'LATE' : 'CURRENT'}
                          </Typography>
                          {billingInfo.isLate && (
                            <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                              <strong>Amount Due:</strong> ${billingInfo.amountDue}
                            </Typography>
                          )}
                        </>
                      );
                    })()}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUnit(null)}>Close</Button>
          {selectedTenant && (
            <Button onClick={() => navigate(`/tenants/${selectedTenant.id}`)} color="primary">
              View Tenant Details
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assign Unit Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Unit {selectedUnit?.location_code}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Tenant</InputLabel>
            <Select
              value={selectedTenant?.id || ''}
              onChange={(e) => {
                const tenant = availableTenants.find(t => t.id === e.target.value);
                setSelectedTenant(tenant);
              }}
            >
              {availableTenants.map(tenant => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.first_name} {tenant.last_name} - {tenant.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit} disabled={!selectedTenant} color="primary">
            Assign Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Walkthrough;
