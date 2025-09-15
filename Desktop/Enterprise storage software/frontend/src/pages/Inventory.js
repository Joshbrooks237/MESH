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
  Inventory as InventoryIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const Inventory = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <InventoryIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Inventory Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <AddIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Add Product
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add new products to your inventory system
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <SearchIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Search Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find products by SKU, name, or category
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <AssessmentIcon color="success" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Stock Levels
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor stock levels and reorder points
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Inventory Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No recent activity to display. Start by adding products to your inventory.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Inventory;
