import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock data for charts
  const monthlyGrowthData = [
    { month: 'Jan 2024', researchers: 890, volunteers: 12000, projects: 6 },
    { month: 'Feb 2024', researchers: 945, volunteers: 12800, projects: 6 },
    { month: 'Mar 2024', researchers: 1023, volunteers: 13200, projects: 7 },
    { month: 'Apr 2024', researchers: 1089, volunteers: 13800, projects: 7 },
    { month: 'May 2024', researchers: 1156, volunteers: 14200, projects: 8 },
    { month: 'Jun 2024', researchers: 1201, volunteers: 14800, projects: 8 },
    { month: 'Jul 2024', researchers: 1234, volunteers: 15200, projects: 8 },
    { month: 'Aug 2024', researchers: 1247, volunteers: 15600, projects: 8 },
  ];

  const researchAreasData = [
    { name: 'Genomics', value: 35, color: '#00bcd4' },
    { name: 'Drug Discovery', value: 25, color: '#ff9800' },
    { name: 'Medical Imaging', value: 20, color: '#9c27b0' },
    { name: 'Clinical Trials', value: 12, color: '#4caf50' },
    { name: 'Epidemiology', value: 8, color: '#ff5722' },
  ];

  const computingPowerData = [
    { time: '00:00', power: 1200 },
    { time: '04:00', power: 800 },
    { time: '08:00', power: 1800 },
    { time: '12:00', power: 2200 },
    { time: '16:00', power: 2500 },
    { time: '20:00', power: 2100 },
  ];

  const geographicData = [
    { country: 'United States', researchers: 423, volunteers: 5200 },
    { country: 'United Kingdom', researchers: 189, volunteers: 2800 },
    { country: 'Germany', researchers: 156, volunteers: 2100 },
    { country: 'Canada', researchers: 98, volunteers: 1800 },
    { country: 'Japan', researchers: 134, volunteers: 1600 },
  ];

  const performanceData = [
    { metric: 'System Uptime', value: 99.9, target: 99.5 },
    { metric: 'Response Time', value: 45, target: 100 },
    { metric: 'Efficiency', value: 94, target: 90 },
    { metric: 'Volunteer Retention', value: 78, target: 75 },
    { metric: 'Task Completion', value: 96, target: 95 },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #00bcd4 30%, #ff9800 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Research Analytics
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: '#b0b0b0' }}>
        Real-time insights into our global cancer research efforts and scientific progress.
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: '#b0b0b0',
            '&.Mui-selected': {
              color: '#00bcd4',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#00bcd4',
          },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Growth Trends" />
        <Tab label="Research Areas" />
        <Tab label="Performance" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Global Stats */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#00bcd4', fontWeight: 700 }}>
                  1,247
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Active Researchers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                  15,600
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Total Volunteers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                  1.2 PFLOPS
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Computing Power
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                  15.3 PB
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Data Processed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Computing Power Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Real-time Computing Power
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={computingPowerData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="time" stroke="#b0b0b0" />
                    <YAxis stroke="#b0b0b0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: 4,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="#00bcd4"
                      fill="#00bcd4"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Geographic Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Geographic Distribution
                </Typography>
                <Box sx={{ height: 300, overflowY: 'auto' }}>
                  {geographicData.map((country, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{country.country}</Typography>
                        <Typography variant="body2" sx={{ color: '#00bcd4' }}>
                          {country.researchers} researchers
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(country.researchers / 423) * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#333',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#00bcd4',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                        {country.volunteers} volunteers
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Growth Trends (2024)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#b0b0b0" />
                    <YAxis stroke="#b0b0b0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="researchers"
                      stroke="#00bcd4"
                      strokeWidth={3}
                      name="Researchers"
                    />
                    <Line
                      type="monotone"
                      dataKey="volunteers"
                      stroke="#ff9800"
                      strokeWidth={3}
                      name="Volunteers"
                    />
                    <Line
                      type="monotone"
                      dataKey="projects"
                      stroke="#9c27b0"
                      strokeWidth={3}
                      name="Projects"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Research Areas Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={researchAreasData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {researchAreasData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Research Areas Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={researchAreasData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#b0b0b0" />
                    <YAxis stroke="#b0b0b0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: 4,
                      }}
                    />
                    <Bar dataKey="value" fill="#00bcd4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  System Performance Metrics
                </Typography>
                {performanceData.map((metric, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{metric.metric}</Typography>
                      <Typography variant="body2" sx={{ color: '#00bcd4' }}>
                        {metric.value}{metric.metric.includes('Time') ? 'ms' : '%'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={metric.metric.includes('Time') ? (metric.target / metric.value) * 100 : metric.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#333',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: metric.value >= metric.target ? '#4caf50' : '#ff9800',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                      Target: {metric.target}{metric.metric.includes('Time') ? 'ms' : '%'}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics;
