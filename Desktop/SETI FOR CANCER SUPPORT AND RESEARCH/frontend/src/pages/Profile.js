import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Biotech as BiotechIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@cancer-research.org',
    institution: 'Memorial Sloan Kettering',
    specialization: 'Cancer Genomics',
    role: 'Researcher',
    bio: 'Leading researcher in cancer genomics with 15+ years of experience. Currently working on distributed computing approaches for genomic analysis.',
    joinedDate: 'January 2023',
    location: 'New York, USA'
  });

  const stats = {
    contributions: 1247,
    reputation: 95,
    projectsJoined: 8,
    dataUploaded: '2.3 TB',
    publications: 23,
    collaborations: 15
  };

  const achievements = [
    { title: 'Research Pioneer', description: 'First to implement distributed genomic analysis', icon: '🏆' },
    { title: 'Top Contributor', description: 'Contributed most computing power in 2024', icon: '⭐' },
    { title: 'Collaboration Champion', description: 'Led 5 successful international collaborations', icon: '🤝' },
    { title: 'Data Champion', description: 'Uploaded 2TB+ of research data', icon: '📊' },
  ];

  const recentActivity = [
    { action: 'Joined project', target: 'Cancer Genome Atlas Analysis', time: '2 days ago' },
    { action: 'Published paper', target: 'Distributed Genomic Computing', time: '1 week ago' },
    { action: 'Uploaded dataset', target: 'TCGA Variant Data', time: '2 weeks ago' },
    { action: 'Started collaboration', target: 'Global Genomics Consortium', time: '3 weeks ago' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // In real app, this would save to backend
    console.log('Saving profile:', profile);
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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
        Researcher Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#00bcd4',
                  fontSize: '3rem',
                  fontWeight: 700,
                }}
              >
                {profile.name.split(' ').map(n => n[0]).join('')}
              </Avatar>

              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {profile.name}
              </Typography>

              <Typography variant="body1" sx={{ color: '#00bcd4', mb: 2 }}>
                {profile.role} • {profile.specialization}
              </Typography>

              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
                {profile.institution}
              </Typography>

              <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 3 }}>
                {profile.location}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={`⭐ ${stats.reputation}`}
                  sx={{ backgroundColor: '#ff9800', color: '#000' }}
                />
                <Chip
                  label={`${stats.contributions} contributions`}
                  sx={{ backgroundColor: '#00bcd4', color: '#000' }}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                sx={{
                  borderColor: '#00bcd4',
                  color: '#00bcd4',
                  '&:hover': { borderColor: '#00acc1', color: '#00acc1' },
                }}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Profile Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Institution"
                    value={profile.institution}
                    onChange={(e) => handleChange('institution', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    value={profile.specialization}
                    onChange={(e) => handleChange('specialization', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Role"
                    value={profile.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Location"
                    value={profile.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BiotechIcon sx={{ fontSize: 40, color: '#00bcd4', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00bcd4', fontWeight: 600 }}>
                    {stats.contributions}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Contributions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StarIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>
                    {stats.reputation}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Reputation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                    {stats.projectsJoined}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Projects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StorageIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                    {stats.dataUploaded}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Data Uploaded
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#ff5722', fontWeight: 600, mb: 1 }}>
                    📄
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#ff5722', fontWeight: 600 }}>
                    {stats.publications}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Publications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 600, mb: 1 }}>
                    🤝
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 600 }}>
                    {stats.collaborations}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                    Collaborations
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Achievements and Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Achievements
              </Typography>

              <List>
                {achievements.map((achievement, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{achievement.icon}</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {achievement.title}
                          </Typography>
                        </Box>
                      }
                      secondary={achievement.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Activity
              </Typography>

              <List>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <strong>{activity.action}</strong> {activity.target}
                        </Typography>
                      }
                      secondary={activity.time}
                    />
                    {index < recentActivity.length - 1 && <Divider sx={{ mt: 1 }} />}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
