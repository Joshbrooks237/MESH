import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
} from '@mui/material';
import {
  Science as ScienceIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon,
  Biotech as BiotechIcon,
  Notifications as NotificationsIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResearchers: 1247,
    totalVolunteers: 15600,
    activeProjects: 8,
    computingPower: '1.2 PFLOPS',
    dataProcessed: '15.3 PB',
  });

  const [projects, setProjects] = useState([
    {
      id: 'cancer-genome-2024',
      title: 'Cancer Genome Atlas Analysis',
      progress: 78,
      participants: 1247,
      status: 'active',
      description: 'Distributed analysis of cancer genomic data',
    },
    {
      id: 'drug-discovery-2024',
      title: 'AI-Driven Drug Discovery',
      progress: 65,
      participants: 892,
      status: 'active',
      description: 'Virtual screening of compounds against cancer targets',
    },
    {
      id: 'medical-imaging-2024',
      title: 'Medical Image Classification',
      progress: 82,
      participants: 2156,
      status: 'active',
      description: 'AI-powered tumor detection in medical images',
    },
  ]);

  const statCards = [
    {
      title: 'Active Researchers',
      value: stats.totalResearchers.toLocaleString(),
      icon: <ScienceIcon sx={{ fontSize: 40, color: '#00bcd4' }} />,
      change: '+12%',
      changeColor: '#4caf50',
    },
    {
      title: 'Total Volunteers',
      value: stats.totalVolunteers.toLocaleString(),
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      change: '+8%',
      changeColor: '#4caf50',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: <BiotechIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      change: '+2',
      changeColor: '#4caf50',
    },
    {
      title: 'Computing Power',
      value: stats.computingPower,
      icon: <StorageIcon sx={{ fontSize: 40, color: '#ff5722' }} />,
      change: '+15%',
      changeColor: '#4caf50',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'discovery',
      title: 'New genetic variant discovered',
      project: 'Cancer Genome Atlas Analysis',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'collaboration',
      title: 'Dr. Chen joined drug discovery project',
      project: 'AI-Driven Drug Discovery',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Medical imaging model reached 96% accuracy',
      project: 'Medical Image Classification',
      time: '6 hours ago',
    },
  ];

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
        Research Universe Dashboard
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: '#b0b0b0' }}>
        Welcome to the SETI Cancer Research Universe. Together, we're accelerating cancer research through global collaboration and distributed computing.
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  sx={{
                    backgroundColor: stat.changeColor,
                    color: '#000',
                    fontWeight: 600,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Active Projects */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active Research Projects
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                >
                  View All
                </Button>
              </Box>

              {projects.map((project) => (
                <Box key={project.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {project.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${project.participants} participants`}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: '#00bcd4', color: '#00bcd4' }}
                      />
                      <Chip
                        label={project.status}
                        size="small"
                        sx={{ backgroundColor: '#4caf50', color: '#000' }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                    {project.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#333',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#00bcd4',
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#b0b0b0', minWidth: 35 }}>
                      {project.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>

                {recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #333' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                      {activity.project} • {activity.time}
                    </Typography>
                  </Box>
                ))}

                <Button
                  variant="text"
                  size="small"
                  sx={{ color: '#00bcd4', mt: 1 }}
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Actions
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayIcon />}
                    sx={{
                      backgroundColor: '#00bcd4',
                      '&:hover': { backgroundColor: '#00acc1' },
                      justifyContent: 'flex-start',
                    }}
                  >
                    Start Computing
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#00bcd4',
                      color: '#00bcd4',
                      '&:hover': { borderColor: '#00acc1', color: '#00acc1' },
                      justifyContent: 'flex-start',
                    }}
                  >
                    Join Project
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': { borderColor: '#e68900', color: '#e68900' },
                      justifyContent: 'flex-start',
                    }}
                  >
                    Upload Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
