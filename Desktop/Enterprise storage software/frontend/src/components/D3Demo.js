import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import D3Chart from './D3Chart';

// Demo component showcasing D3.js capabilities
const D3Demo = () => {
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('bar');

  // Generate sample data
  useEffect(() => {
    const generateData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, i) => ({
        label: month,
        value: Math.floor(Math.random() * 100) + 20
      }));
    };

    setData(generateData());
  }, []);

  const refreshData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    setData(months.map((month, i) => ({
      label: month,
      value: Math.floor(Math.random() * 100) + 20
    })));
  };

  const demoFeatures = [
    {
      title: 'Interactive Tooltips',
      description: 'Hover over bars/lines to see detailed information'
    },
    {
      title: 'Smooth Animations',
      description: 'Watch data transition smoothly when updated'
    },
    {
      title: 'Multiple Chart Types',
      description: 'Switch between bar, line, and pie charts'
    },
    {
      title: 'Responsive Design',
      description: 'Charts adapt to different screen sizes'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🎨 D3.js Interactive Visualizations
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        D3.js is a powerful JavaScript library for creating dynamic, interactive data visualizations
        directly in the browser. Unlike Chart.js, D3 gives you complete control over the SVG elements
        and animations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Live D3 Chart Demo</Typography>
              <Button variant="contained" onClick={refreshData}>
                🔄 Refresh Data
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Button
                variant={chartType === 'bar' ? 'contained' : 'outlined'}
                onClick={() => setChartType('bar')}
                sx={{ mr: 1 }}
              >
                📊 Bar Chart
              </Button>
              <Button
                variant={chartType === 'line' ? 'contained' : 'outlined'}
                onClick={() => setChartType('line')}
                sx={{ mr: 1 }}
              >
                📈 Line Chart
              </Button>
              <Button
                variant={chartType === 'pie' ? 'contained' : 'outlined'}
                onClick={() => setChartType('pie')}
              >
                🥧 Pie Chart
              </Button>
            </Box>

            <D3Chart
              data={chartType === 'pie' ? [
                { label: 'A', value: 30 },
                { label: 'B', value: 25 },
                { label: 'C', value: 20 },
                { label: 'D', value: 15 },
                { label: 'E', value: 10 }
              ] : data}
              type={chartType}
              width={700}
              height={400}
              title={`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Demo`}
              xLabel="Categories"
              yLabel="Values"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ✨ D3.js Features
            </Typography>

            {demoFeatures.map((feature, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            ))}

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🚀 Why D3.js?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Complete SVG control<br/>
                • Smooth animations<br/>
                • Interactive elements<br/>
                • Custom styling<br/>
                • Data-driven documents
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          💡 D3.js vs Chart.js
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary">Chart.js (Current)</Typography>
            <Typography variant="body2">
              • Quick setup<br/>
              • Pre-built chart types<br/>
              • Easy configuration<br/>
              • Canvas-based<br/>
              • Limited customization
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="secondary">D3.js (New)</Typography>
            <Typography variant="body2">
              • Full control<br/>
              • Custom visualizations<br/>
              • SVG manipulation<br/>
              • Advanced animations<br/>
              • Infinite customization
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default D3Demo;
