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
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const Reports = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <InventoryIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Inventory Reports
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Generate detailed inventory reports and analysis
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <TrendingUpIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View warehouse performance and efficiency metrics
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <DownloadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Available Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate custom reports including:
            <br />• Inventory value analysis
            <br />• Stock movement reports
            <br />• Warehouse utilization
            <br />• Product turnover analysis
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Reports;
