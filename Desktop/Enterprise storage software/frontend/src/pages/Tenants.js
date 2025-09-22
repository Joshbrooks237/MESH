import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { debounce } from '../utils/debounce';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [newTenantDialogOpen, setNewTenantDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async (search = '') => {
    try {
      // Always show loading state during fetch
      if (!search) {
        setLoading(true);
        setSearchLoading(false);
      } else {
        setLoading(false);
        setSearchLoading(true);
      }

      const params = new URLSearchParams();
      if (search && search.trim()) {
        params.append('search', search.trim());
      }

      const response = await axios.get(`http://localhost:5001/api/tenants?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(response.data.tenants || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setError('Failed to load tenants');
      setTenants([]); // Clear tenants on error
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      fetchTenants(searchTerm);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Clear search immediately if empty to show all tenants
    if (!value.trim()) {
      debouncedSearch.cancel(); // Cancel any pending debounced call
      fetchTenants(); // Immediately fetch all tenants
    } else {
      debouncedSearch(value);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    debouncedSearch.cancel(); // Cancel any pending search
    fetchTenants(); // Immediately fetch all tenants
  };

  const handleTenantClick = (tenant) => {
    setSelectedTenant(tenant);
    setTenantDialogOpen(true);
  };

  const handleCreateTenant = async (tenantData) => {
    try {
      await axios.post('http://localhost:5001/api/tenants', tenantData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTenantDialogOpen(false);
      fetchTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
      setError('Failed to create tenant');
    }
  };

  const handleUpdateTenant = async (tenantId, tenantData) => {
    try {
      await axios.put(`http://localhost:5001/api/tenants/${tenantId}`, tenantData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenantDialogOpen(false);
      fetchTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      setError('Failed to update tenant');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await axios.delete(`http://localhost:5001/api/tenants/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setError('Failed to delete tenant');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Tenant Management
        </Typography>
        <Typography>Loading tenants...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tenant Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setNewTenantDialogOpen(true)}
        >
          Add Tenant
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tenants by name, email, phone, address, unit number..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchLoading && <CircularProgress size={20} />}
                {searchTerm && !searchLoading && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{ ml: 1 }}
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {tenants.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tenants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {tenants.filter(t => t.is_active).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tenants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {tenants.reduce((sum, t) => sum + (t.unit_count || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Units Leased
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {tenants.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search Results
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

      {/* Tenants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow
                key={tenant.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleTenantClick(tenant)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    {tenant.first_name} {tenant.last_name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    {tenant.email}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1, color: 'success.main' }} />
                    {tenant.phone || 'Not provided'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'warning.main' }} />
                    {tenant.city && tenant.state ? `${tenant.city}, ${tenant.state}` : 'Not provided'}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${tenant.unit_count || 0} units`}
                    color={tenant.unit_count > 0 ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={tenant.is_active ? 'Active' : 'Inactive'}
                    color={tenant.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTenantClick(tenant);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTenant(tenant.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {tenants.length === 0 && !loading && !searchLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No tenants found matching your search.' : 'No tenants found.'}
          </Typography>
        </Box>
      )}

      {/* Tenant Details Dialog */}
      <TenantDialog
        open={tenantDialogOpen}
        onClose={() => setTenantDialogOpen(false)}
        tenant={selectedTenant}
        onSave={handleUpdateTenant}
      />

      {/* New Tenant Dialog */}
      <TenantDialog
        open={newTenantDialogOpen}
        onClose={() => setNewTenantDialogOpen(false)}
        onSave={handleCreateTenant}
        isNew
      />
    </Container>
  );
};

// Tenant Dialog Component
const TenantDialog = ({ open, onClose, tenant, onSave, isNew = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    driverLicense: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  useEffect(() => {
    if (tenant && !isNew) {
      setFormData({
        firstName: tenant.first_name || '',
        lastName: tenant.last_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        city: tenant.city || '',
        state: tenant.state || '',
        zipCode: tenant.zip_code || '',
        driverLicense: tenant.driver_license || '',
        dateOfBirth: tenant.date_of_birth || '',
        emergencyContactName: tenant.emergency_contact_name || '',
        emergencyContactPhone: tenant.emergency_contact_phone || ''
      });
    } else if (isNew) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        driverLicense: '',
        dateOfBirth: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
      });
    }
  }, [tenant, isNew]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    onSave(isNew ? null : tenant?.id, formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isNew ? 'Add New Tenant' : `Edit ${tenant?.first_name} ${tenant?.last_name}`}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={handleChange('address')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={handleChange('state')}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              label="ZIP"
              value={formData.zipCode}
              onChange={handleChange('zipCode')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Driver License"
              value={formData.driverLicense}
              onChange={handleChange('driverLicense')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange('dateOfBirth')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={handleChange('emergencyContactName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Emergency Contact Phone"
              value={formData.emergencyContactPhone}
              onChange={handleChange('emergencyContactPhone')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          {isNew ? 'Create Tenant' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Tenants;
