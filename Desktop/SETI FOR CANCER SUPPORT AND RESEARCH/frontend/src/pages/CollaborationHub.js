import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Paper,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Message as MessageIcon,
  Send as SendIcon,
  GroupAdd as GroupAddIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const CollaborationHub = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeCollaboration, setActiveCollaboration] = useState('global');

  useEffect(() => {
    // Mock messages data
    const mockMessages = [
      {
        id: 1,
        user: 'Dr. Sarah Johnson',
        avatar: 'SJ',
        message: 'Great progress on the variant calling pipeline! The new algorithm is showing 15% improvement in accuracy.',
        timestamp: '2 hours ago',
        project: 'Cancer Genome Atlas Analysis',
        type: 'update'
      },
      {
        id: 2,
        user: 'Dr. Michael Chen',
        avatar: 'MC',
        message: 'Just published our latest findings on drug-target interactions. Check out the new paper in Nature Biotechnology!',
        timestamp: '4 hours ago',
        project: 'AI-Driven Drug Discovery',
        type: 'publication'
      },
      {
        id: 3,
        user: 'Dr. Emily Rodriguez',
        avatar: 'ER',
        message: 'Our medical imaging model just achieved 96% accuracy in tumor detection. Volunteers - your contributions are making this possible!',
        timestamp: '6 hours ago',
        project: 'Medical Image Classification',
        type: 'milestone'
      },
      {
        id: 4,
        user: 'Dr. David Kim',
        avatar: 'DK',
        message: 'Looking for collaborators on a new proteomics study. Anyone interested in joining?',
        timestamp: '8 hours ago',
        project: 'General',
        type: 'collaboration'
      },
    ];

    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        avatar: 'YO',
        message: newMessage,
        timestamp: 'Just now',
        project: activeCollaboration,
        type: 'message'
      };

      setMessages([message, ...messages]);
      setNewMessage('');
    }
  };

  const collaborations = [
    {
      id: 'global',
      name: 'Global Research Network',
      members: 1247,
      description: 'Main discussion forum for all cancer research topics',
      active: true
    },
    {
      id: 'genomics',
      name: 'Genomics Consortium',
      members: 423,
      description: 'Discussion on genomic research and sequencing technologies',
      active: false
    },
    {
      id: 'drug-discovery',
      name: 'Drug Discovery Alliance',
      members: 289,
      description: 'Collaboration on drug development and pharmacology',
      active: false
    },
    {
      id: 'imaging',
      name: 'Medical Imaging Group',
      members: 156,
      description: 'Advances in medical imaging and AI diagnostics',
      active: false
    }
  ];

  const onlineUsers = [
    { name: 'Dr. Sarah Johnson', avatar: 'SJ', status: 'online' },
    { name: 'Dr. Michael Chen', avatar: 'MC', status: 'online' },
    { name: 'Dr. Emily Rodriguez', avatar: 'ER', status: 'away' },
    { name: 'Dr. David Kim', avatar: 'DK', status: 'online' },
    { name: 'Dr. Lisa Wang', avatar: 'LW', status: 'offline' },
  ];

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'update':
        return '#00bcd4';
      case 'publication':
        return '#4caf50';
      case 'milestone':
        return '#ff9800';
      case 'collaboration':
        return '#9c27b0';
      default:
        return '#b0b0b0';
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
        Collaboration Hub
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: '#b0b0b0' }}>
        Connect with researchers worldwide and collaborate on cancer research initiatives.
      </Typography>

      <Grid container spacing={3}>
        {/* Collaborations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Research Communities
              </Typography>

              {collaborations.map((collab) => (
                <Box
                  key={collab.id}
                  onClick={() => setActiveCollaboration(collab.id)}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: activeCollaboration === collab.id ? '#00bcd4' : 'transparent',
                    '&:hover': {
                      backgroundColor: activeCollaboration === collab.id ? '#00bcd4' : '#0a0a0a',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {collab.name}
                    </Typography>
                    <Chip
                      label={`${collab.members}`}
                      size="small"
                      sx={{
                        backgroundColor: activeCollaboration === collab.id ? '#000' : '#333',
                        color: activeCollaboration === collab.id ? '#00bcd4' : '#b0b0b0',
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
                    {collab.description}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Online Users */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Online Researchers
              </Typography>

              <List dense>
                {onlineUsers.map((user, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: user.status === 'online' ? '#4caf50' :
                                   user.status === 'away' ? '#ff9800' : '#757575',
                          fontSize: '0.8rem',
                        }}
                      >
                        {user.avatar}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.status}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: user.status === 'online' ? '#4caf50' :
                               user.status === 'away' ? '#ff9800' : '#757575'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Messages Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PublicIcon sx={{ mr: 1, color: '#00bcd4' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {collaborations.find(c => c.id === activeCollaboration)?.name || 'Global Discussion'}
                </Typography>
              </Box>

              {/* Messages List */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                <List>
                  {messages.map((message) => (
                    <ListItem key={message.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: getMessageTypeColor(message.type),
                            color: '#000',
                          }}
                        >
                          {message.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {message.user}
                            </Typography>
                            <Chip
                              label={message.type}
                              size="small"
                              sx={{
                                backgroundColor: getMessageTypeColor(message.type),
                                color: '#000',
                                fontSize: '0.7rem',
                                height: 18,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                              {message.timestamp}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>
                              {message.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                              {message.project}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Message Input */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Share your research updates, ask questions, or collaborate..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#0a0a0a',
                      color: '#fff',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  sx={{
                    backgroundColor: '#00bcd4',
                    '&:hover': { backgroundColor: '#00acc1' },
                    minWidth: 50,
                  }}
                >
                  <SendIcon />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CollaborationHub;
