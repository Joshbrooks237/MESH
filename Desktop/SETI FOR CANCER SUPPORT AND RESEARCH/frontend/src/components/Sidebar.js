import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Science as ScienceIcon,
  DataObject as DataIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  Biotech as BiotechIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Research Projects',
      icon: <ScienceIcon />,
      path: '/projects',
    },
    {
      text: 'Data Portal',
      icon: <DataIcon />,
      path: '/data',
    },
    {
      text: 'Collaboration Hub',
      icon: <PeopleIcon />,
      path: '/collaboration',
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0a0a0a',
          borderRight: '1px solid #333',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#00bcd4',
            fontWeight: 700,
            mb: 1,
          }}
        >
          Research Universe
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
          Healing humanity through collaborative science
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 0.5 }}>
            Global Progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={78}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#333',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00bcd4',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#b0b0b0', mt: 0.5 }}>
            78% Complete
          </Typography>
        </Box>
      </Box>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: '#00bcd4',
                  '&:hover': {
                    backgroundColor: '#00acc1',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#000',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#000',
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? '#000' : '#b0b0b0',
                  minWidth: 40,
                }}
              >
                {item.icon}
            </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, backgroundColor: '#333' }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
          Active Computing
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BiotechIcon sx={{ color: '#00bcd4', fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ color: '#00bcd4' }}>
            890 TFLOPS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <StorageIcon sx={{ color: '#ff9800', fontSize: '1rem' }} />
          <Typography variant="caption" sx={{ color: '#ff9800' }}>
            45.2 TB Today
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
