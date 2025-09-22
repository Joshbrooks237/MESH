import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import D3Chart from '../components/D3Chart';

const Reports = () => {
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState(0);

  // Sample data for D3 charts
  const sampleData = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 78 },
    { label: 'Mar', value: 90 },
    { label: 'Apr', value: 81 },
    { label: 'May', value: 95 },
    { label: 'Jun', value: 102 },
    { label: 'Jul', value: 98 },
    { label: 'Aug', value: 87 },
  ];

  const pieData = [
    { label: 'Electronics', value: 35 },
    { label: 'Furniture', value: 25 },
    { label: 'Clothing', value: 20 },
    { label: 'Books', value: 15 },
    { label: 'Other', value: 5 },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>

        {/* D3.js Demo Section */}
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            <ShowChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            D3.js Advanced Visualizations
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Powered by D3.js - Interactive, animated data visualizations
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Bar Chart" />
              <Tab label="Line Chart" />
              <Tab label="Pie Chart" />
            </Tabs>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    label="Chart Type"
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <D3Chart
              data={activeTab === 2 ? pieData : sampleData}
              type={chartType}
              width={800}
              height={400}
              title={activeTab === 2 ? "Inventory Categories Distribution" : "Monthly Performance Trends"}
              xLabel={activeTab === 2 ? "Categories" : "Months"}
              yLabel={activeTab === 2 ? "Percentage" : "Performance Score"}
            />
          </Box>
        </Paper>

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
