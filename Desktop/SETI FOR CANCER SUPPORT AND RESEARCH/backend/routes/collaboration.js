const express = require('express');
const router = express.Router();

// Mock collaboration data
const collaborations = [
  {
    id: 'collab-1',
    title: 'Global Cancer Genomics Consortium',
    description: 'International collaboration for sharing genomic data and research findings',
    type: 'consortium',
    status: 'active',
    members: 45,
    institutions: 12,
    countries: ['USA', 'UK', 'Germany', 'Japan', 'Canada'],
    projects: ['cancer-genome-2024', 'drug-discovery-2024'],
    founded: '2023-01-15',
    publications: 23,
    funding: '$2.5M'
  }
];

const messages = [
  {
    id: 'msg-1',
    projectId: 'cancer-genome-2024',
    userId: 'user-1',
    userName: 'Dr. Sarah Johnson',
    message: 'Great progress on the variant calling pipeline! The new algorithm is showing 15% improvement in accuracy.',
    timestamp: '2024-09-12T10:30:00Z',
    type: 'update'
  }
];

// GET /api/collaboration/network - Get collaboration network
router.get('/network', (req, res) => {
  try {
    const network = {
      nodes: [
        { id: 'usa', name: 'United States', type: 'country', connections: 15 },
        { id: 'uk', name: 'United Kingdom', type: 'country', connections: 8 },
        { id: 'germany', name: 'Germany', type: 'country', connections: 6 },
        { id: 'japan', name: 'Japan', type: 'country', connections: 4 },
        { id: 'canada', name: 'Canada', type: 'country', connections: 5 },
        { id: 'mskcc', name: 'Memorial Sloan Kettering', type: 'institution', connections: 12 },
        { id: 'stanford', name: 'Stanford University', type: 'institution', connections: 10 }
      ],
      links: [
        { source: 'usa', target: 'mskcc', strength: 0.9 },
        { source: 'usa', target: 'stanford', strength: 0.8 },
        { source: 'uk', target: 'mskcc', strength: 0.6 },
        { source: 'germany', target: 'stanford', strength: 0.7 }
      ]
    };

    res.json({
      success: true,
      data: network
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration network'
    });
  }
});

// GET /api/collaboration/messages - Get project messages
router.get('/messages', (req, res) => {
  try {
    const { projectId, limit = 20, offset = 0 } = req.query;
    let filteredMessages = [...messages];

    if (projectId) {
      filteredMessages = filteredMessages.filter(msg => msg.projectId === projectId);
    }

    const paginatedMessages = filteredMessages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: paginatedMessages,
        total: filteredMessages.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

// POST /api/collaboration/messages - Send message
router.post('/messages', (req, res) => {
  try {
    const newMessage = {
      id: `msg-${Date.now()}`,
      ...req.body,
      timestamp: new Date().toISOString(),
      type: req.body.type || 'message'
    };

    messages.push(newMessage);

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// GET /api/collaboration/collaborations - Get collaborations
router.get('/collaborations', (req, res) => {
  try {
    res.json({
      success: true,
      data: collaborations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaborations'
    });
  }
});

// POST /api/collaboration/collaborations - Create collaboration
router.post('/collaborations', (req, res) => {
  try {
    const newCollaboration = {
      id: `collab-${Date.now()}`,
      ...req.body,
      status: 'pending',
      members: 1,
      institutions: 1,
      countries: [req.body.country],
      projects: [],
      publications: 0,
      funding: '$0',
      founded: new Date().toISOString().split('T')[0]
    };

    collaborations.push(newCollaboration);

    res.status(201).json({
      success: true,
      data: newCollaboration,
      message: 'Collaboration created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create collaboration'
    });
  }
});

// POST /api/collaboration/join - Join collaboration
router.post('/join', (req, res) => {
  try {
    const { collaborationId, userInfo } = req.body;
    const collaboration = collaborations.find(c => c.id === collaborationId);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found'
      });
    }

    collaboration.members += 1;

    // Add country if not already present
    if (userInfo.country && !collaboration.countries.includes(userInfo.country)) {
      collaboration.countries.push(userInfo.country);
    }

    res.json({
      success: true,
      message: 'Successfully joined collaboration',
      collaboration: collaboration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to join collaboration'
    });
  }
});

module.exports = router;
