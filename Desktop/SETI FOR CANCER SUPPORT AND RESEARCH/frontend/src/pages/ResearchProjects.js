import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  PlayArrow as PlayIcon,
  People as PeopleIcon,
  Biotech as BiotechIcon,
  Science as ScienceIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const ResearchProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockProjects = [
      {
        id: 'cancer-genome-2024',
        title: 'Cancer Genome Atlas Analysis',
        description: 'Distributed analysis of cancer genomic data to identify novel mutations and therapeutic targets. This project uses advanced machine learning algorithms to process vast amounts of genomic data from cancer patients worldwide.',
        type: 'genomics',
        status: 'active',
        progress: 78,
        participants: 1247,
        computingPower: '500 TFLOPS',
        leadResearcher: 'Dr. Sarah Johnson',
        institution: 'Memorial Sloan Kettering',
        startDate: '2024-01-15',
        estimatedCompletion: '2024-12-31',
        keyFindings: [
          'Novel BRCA2 mutation identified',
          'Potential new therapeutic target in TP53 pathway',
          'Machine learning model achieves 94% accuracy in mutation prediction'
        ],
        tags: ['genomics', 'mutations', 'machine-learning']
      },
      {
        id: 'drug-discovery-2024',
        title: 'AI-Driven Drug Discovery Pipeline',
        description: 'Virtual screening of millions of compounds against cancer targets using distributed computing. Our AI models predict drug efficacy and identify promising candidates for further testing.',
        type: 'drug-discovery',
        status: 'active',
        progress: 65,
        participants: 892,
        computingPower: '320 TFLOPS',
        leadResearcher: 'Dr. Michael Chen',
        institution: 'Stanford University',
        startDate: '2024-02-01',
        estimatedCompletion: '2025-06-30',
        keyFindings: [
          'Identified 15 high-affinity compounds',
          'Novel kinase inhibitor discovered',
          'AI model predicts drug efficacy with 87% accuracy'
        ],
        tags: ['drug-discovery', 'ai', 'virtual-screening']
      },
      {
        id: 'medical-imaging-2024',
        title: 'Medical Image Classification Network',
        description: 'Training neural networks to detect and classify tumors in medical imaging data. This project aims to improve early cancer detection through automated image analysis.',
        type: 'medical-imaging',
        status: 'active',
        progress: 82,
        participants: 2156,
        computingPower: '750 TFLOPS',
        leadResearcher: 'Dr. Emily Rodriguez',
        institution: 'Mayo Clinic',
        startDate: '2024-03-01',
        estimatedCompletion: '2024-11-15',
        keyFindings: [
          'Model achieves 96% accuracy in tumor detection',
          'Early stage detection improved by 40%',
          'Reduced false positives by 60%'
        ],
        tags: ['medical-imaging', 'neural-networks', 'diagnosis']
      },
    ];

    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(p => p.status === 'active');
    } else if (activeTab === 2) {
      filtered = filtered.filter(p => p.type === 'genomics');
    } else if (activeTab === 3) {
      filtered = filtered.filter(p => p.type === 'drug-discovery');
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, activeTab, searchQuery]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleJoinProject = (project) => {
    setSelectedProject(project);
    setJoinDialogOpen(true);
  };

  const handleConfirmJoin = () => {
    // In real app, this would make API call
    console.log('Joining project:', selectedProject.id);
    setJoinDialogOpen(false);
    setSelectedProject(null);
  };

  const getProjectIcon = (type) => {
    switch (type) {
      case 'genomics':
        return <ScienceIcon sx={{ color: '#00bcd4' }} />;
      case 'drug-discovery':
        return <BiotechIcon sx={{ color: '#ff9800' }} />;
      case 'medical-imaging':
        return <TimelineIcon sx={{ color: '#9c27b0' }} />;
      default:
        return <ScienceIcon sx={{ color: '#00bcd4' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'completed':
        return '#2196f3';
      case 'paused':
        return '#ff9800';
      default:
        return '#757575';
    }
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
        Research Projects
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: '#b0b0b0' }}>
        Join global research initiatives and contribute your computing power to accelerate cancer research.
      </Typography>

      {/* Search and Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#b0b0b0' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1a1a1a',
              color: '#fff',
            },
          }}
        />
        <IconButton sx={{ color: '#b0b0b0' }}>
          <FilterIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
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
        <Tab label="All Projects" />
        <Tab label="Active" />
        <Tab label="Genomics" />
        <Tab label="Drug Discovery" />
      </Tabs>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getProjectIcon(project.type)}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                    {project.title}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2, flexGrow: 1 }}>
                  {project.description.length > 150
                    ? `${project.description.substring(0, 150)}...`
                    : project.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#333',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#00bcd4',
                      },
                      mb: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                    {project.progress}% Complete
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    label={project.type}
                    size="small"
                    sx={{ backgroundColor: '#00bcd4', color: '#000' }}
                  />
                  <Chip
                    label={project.status}
                    size="small"
                    sx={{ backgroundColor: getStatusColor(project.status), color: '#000' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 1, color: '#b0b0b0', fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ color: '#b0b0b0', mr: 2 }}>
                    {project.participants} participants
                  </Typography>
                  <BiotechIcon sx={{ mr: 1, color: '#b0b0b0', fontSize: '1rem' }} />
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    {project.computingPower}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Lead: {project.leadResearcher}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                    {project.institution}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {project.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: '#555', color: '#b0b0b0', fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayIcon />}
                  onClick={() => handleJoinProject(project)}
                  sx={{
                    backgroundColor: '#00bcd4',
                    '&:hover': { backgroundColor: '#00acc1' },
                  }}
                >
                  Join Project
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Join Project Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Join Research Project</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedProject.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#b0b0b0' }}>
                {selectedProject.description}
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                By joining this project, you'll contribute your computer's processing power to help analyze cancer research data.
                Your participation will help accelerate scientific discoveries that could lead to new treatments and cures.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmJoin}
            variant="contained"
            sx={{ backgroundColor: '#00bcd4', '&:hover': { backgroundColor: '#00acc1' } }}
          >
            Join Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResearchProjects;
