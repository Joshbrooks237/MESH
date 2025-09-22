import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Autocomplete,
  Popper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Divider,
  Fade,
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const searchInputRef = useRef(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTenants();
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('tenantSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate search suggestions based on tenant data
  useEffect(() => {
    if (tenants.length > 0) {
      const suggestions = new Set();

      tenants.forEach(tenant => {
        // Add name combinations
        if (tenant.first_name) suggestions.add(tenant.first_name);
        if (tenant.last_name) suggestions.add(tenant.last_name);
        if (tenant.first_name && tenant.last_name) {
          suggestions.add(`${tenant.first_name} ${tenant.last_name}`);
        }

        // Add email parts
        if (tenant.email) {
          const emailParts = tenant.email.split('@');
          if (emailParts[0]) suggestions.add(emailParts[0]);
        }

        // Add phone
        if (tenant.phone) suggestions.add(tenant.phone);

        // Add city
        if (tenant.city) suggestions.add(tenant.city);

        // Add location codes (if available)
        if (tenant.location_code) suggestions.add(tenant.location_code);
      });

      setSearchSuggestions(Array.from(suggestions).slice(0, 10)); // Limit to 10 suggestions
    }
  }, [tenants]);

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
    setShowSuggestions(value.length > 0);

    // Clear search immediately if empty to show all tenants
    if (!value.trim()) {
      debouncedSearch.cancel(); // Cancel any pending debounced call
      fetchTenants(); // Immediately fetch all tenants
      setShowSuggestions(false);
    } else {
      debouncedSearch(value);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    debouncedSearch.cancel(); // Cancel any pending search
    fetchTenants(); // Immediately fetch all tenants
    setShowSuggestions(false);
  };

  // Handle search suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Save to history
    const newHistory = [suggestion, ...searchHistory.filter(h => h !== suggestion)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('tenantSearchHistory', JSON.stringify(newHistory));

    debouncedSearch(suggestion);
    searchInputRef.current?.focus();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClearSearch();
    } else if (event.key === 'Enter' && searchTerm.trim()) {
      // Save to history on enter
      const newHistory = [searchTerm.trim(), ...searchHistory.filter(h => h !== searchTerm.trim())].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('tenantSearchHistory', JSON.stringify(newHistory));
      setShowSuggestions(false);
    }
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
      <Box sx={{ mb: 3, position: 'relative' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tenants by name, email, phone, address, city, state..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          inputRef={searchInputRef}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-focused': {
                backgroundColor: 'background.paper',
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}25`,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searchLoading && <CircularProgress size={20} />}
                {searchTerm && !searchLoading && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    sx={{
                      ml: 1,
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'text.primary',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        {/* Search Suggestions Dropdown */}
        <Fade in={showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0)}>
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              maxHeight: 300,
              overflow: 'auto',
              boxShadow: (theme) => theme.shadows[8],
            }}
          >
            <List dense>
              {/* Search History */}
              {searchHistory.length > 0 && (
                <>
                  <ListItem sx={{ py: 1, px: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Recent Searches
                    </Typography>
                  </ListItem>
                  {searchHistory.slice(0, 3).map((history, index) => (
                    <ListItem
                      key={`history-${index}`}
                      button
                      onClick={() => handleSuggestionSelect(history)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <SearchIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <ListItemText
                        primary={history}
                        primaryTypographyProps={{
                          variant: 'body2',
                          sx: {
                            fontStyle: 'italic',
                            color: 'text.secondary',
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                  <Divider />
                </>
              )}

              {/* Suggestions */}
              {searchSuggestions.length > 0 && (
                <>
                  <ListItem sx={{ py: 1, px: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Suggestions
                    </Typography>
                  </ListItem>
                  {searchSuggestions
                    .filter(suggestion =>
                      suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      !searchHistory.includes(suggestion)
                    )
                    .slice(0, 5)
                    .map((suggestion, index) => (
                      <ListItem
                        key={`suggestion-${index}`}
                        button
                        onClick={() => handleSuggestionSelect(suggestion)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                      </ListItem>
                    ))}
                </>
              )}
            </List>
          </Paper>
        </Fade>

        {/* Click away listener to close suggestions */}
        {showSuggestions && (
          <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
            <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} />
          </ClickAwayListener>
        )}
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
