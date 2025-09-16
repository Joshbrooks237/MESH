import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  Warehouse,
  ViewList,
  Group,
  Assessment,
  People,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'Walkthrough',
      icon: <ViewList />,
      path: '/walkthrough',
    },
    {
      text: 'Tenants',
      icon: <Group />,
      path: '/tenants',
    },
    {
      text: 'Inventory',
      icon: <Inventory />,
      path: '/inventory',
    },
    {
      text: 'Warehouse',
      icon: <Warehouse />,
      path: '/warehouse',
    },
    {
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/users',
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <img
          src="/logo192.png"
          alt="Logo"
          style={{ width: '100%', maxWidth: '120px', margin: '0 auto', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
