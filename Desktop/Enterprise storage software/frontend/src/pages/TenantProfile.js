import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Assignment as TaskIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Warehouse as WarehouseIcon,
  MonetizationOn as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const TenantProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTenantProfile();
  }, [id]);

  const fetchTenantProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5001/api/tenants/${id}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenantData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tenant profile:', err);
      setError(err.response?.data?.error || 'Failed to load tenant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      case 'overlocked': return 'error';
      default: return 'default';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mt: 2 }}
        >
          Back to Tenants
        </Button>
      </Container>
    );
  }

  if (!tenantData) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Tenant not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mt: 2 }}
        >
          Back to Tenants
        </Button>
      </Container>
    );
  }

  const { tenant, units, billingCycles, tasks, stats } = tenantData;

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/tenants')} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
          <PersonIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            {tenant.first_name} {tenant.last_name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Tenant ID: {tenant.id} • Status: {tenant.is_active ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarehouseIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary">
                {stats.totalUnits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.activeUnits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.totalPaid)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon color={stats.overdueCycles > 0 ? "error" : "success"} sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color={stats.overdueCycles > 0 ? "error.main" : "success.main"}>
                {stats.overdueCycles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue Cycles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label={`Units (${units.length})`} />
          <Tab label={`Billing (${billingCycles.length})`} />
          <Tab label={`Tasks (${tasks.length})`} />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography>{tenant.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography>{tenant.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationIcon sx={{ mr: 2, color: 'text.secondary' }} />
                      <Typography>
                        {tenant.address}, {tenant.city}, {tenant.state} {tenant.zip_code}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Financial Summary */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Amount Paid (All Time)
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(stats.totalPaid)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Amount Owed
                      </Typography>
                      <Typography variant="h5" color={stats.totalOwed > 0 ? "error.main" : "text.primary"}>
                        {formatCurrency(stats.totalOwed)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active Tasks
                      </Typography>
                      <Typography variant="h5" color={stats.activeTasks > 0 ? "warning.main" : "text.primary"}>
                        {stats.activeTasks}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {tasks.slice(0, 3).map((task) => (
                      <Box key={task.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">{task.title}</Typography>
                          <Chip
                            label={task.status.replace('_', ' ')}
                            color={getTaskStatusColor(task.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {formatDate(task.created_at)}
                        </Typography>
                      </Box>
                    ))}
                    {tasks.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No recent activity
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Units Tab */}
          {activeTab === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Unit Code</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell>{unit.location_code}</TableCell>
                      <TableCell>{unit.warehouse_name}</TableCell>
                      <TableCell>
                        Aisle {unit.aisle}, Level {unit.level}, Position {unit.position}
                      </TableCell>
                      <TableCell>{formatDate(unit.start_date)}</TableCell>
                      <TableCell>{formatDate(unit.end_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={unit.end_date && new Date(unit.end_date) < new Date() ? 'Expired' : 'Active'}
                          color={unit.end_date && new Date(unit.end_date) < new Date() ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {units.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary">No units assigned</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Billing Tab */}
          {activeTab === 2 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Billing Date</TableCell>
                    <TableCell>Amount Due</TableCell>
                    <TableCell>Amount Paid</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billingCycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell>{formatDate(cycle.billing_date)}</TableCell>
                      <TableCell>{formatCurrency(cycle.amount_due)}</TableCell>
                      <TableCell>{formatCurrency(cycle.amount_paid)}</TableCell>
                      <TableCell>
                        <Chip
                          label={cycle.status}
                          color={getStatusColor(cycle.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(cycle.paid_date)}</TableCell>
                    </TableRow>
                  ))}
                  {billingCycles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary">No billing history</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tasks Tab */}
          {activeTab === 3 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          color={getTaskStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          color={task.priority === 'urgent' ? 'error' : task.priority === 'high' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {task.creator_first_name} {task.creator_last_name}
                      </TableCell>
                      <TableCell>{formatDate(task.due_date)}</TableCell>
                      <TableCell>{formatDate(task.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {tasks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary">No tasks found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>

      {/* Edit Dialog Placeholder */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Tenant Profile</DialogTitle>
        <DialogContent>
          <Typography>Edit functionality coming soon...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TenantProfile;
