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
  Warehouse as WarehouseIcon,
  AddLocation as AddLocationIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const Warehouse = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <WarehouseIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Warehouse Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <AddLocationIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Add Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create new warehouse locations and zones
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <MapIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Layout View
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualize warehouse layout and optimize space
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <AssessmentIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Utilization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor warehouse utilization and capacity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Warehouse Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No warehouses configured yet. Start by setting up your warehouse layout.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Warehouse;
