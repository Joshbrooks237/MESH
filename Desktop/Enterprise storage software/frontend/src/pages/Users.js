import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const Users = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <PeopleIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          User Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <PersonAddIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Add User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create new user accounts with appropriate permissions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <ManageAccountsIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Manage Roles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assign and modify user roles and permissions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <SecurityIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Access Control
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure security settings and access policies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No users configured yet. Start by creating administrator accounts.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Users;
