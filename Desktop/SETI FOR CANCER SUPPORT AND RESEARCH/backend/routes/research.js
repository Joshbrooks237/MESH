const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock research data - in production, this would come from a database
const researchProjects = [
  {
    id: 'cancer-genome-2024',
    title: 'Cancer Genome Atlas Analysis',
    description: 'Distributed analysis of cancer genomic data to identify novel mutations and therapeutic targets',
    type: 'genomics',
    status: 'active',
    participants: 1247,
    computingPower: '500 TFLOPS',
    progress: 78,
    leadResearcher: 'Dr. Sarah Johnson',
    institution: 'Memorial Sloan Kettering',
    startDate: '2024-01-15',
    estimatedCompletion: '2024-12-31',
    dataProcessed: '2.3 PB',
    keyFindings: [
      'Novel BRCA2 mutation identified',
      'Potential new therapeutic target in TP53 pathway',
      'Machine learning model achieves 94% accuracy in mutation prediction'
    ]
  },
  {
    id: 'drug-discovery-2024',
    title: 'AI-Driven Drug Discovery Pipeline',
    description: 'Virtual screening of millions of compounds against cancer targets using distributed computing',
    type: 'drug-discovery',
    status: 'active',
    participants: 892,
    computingPower: '320 TFLOPS',
    progress: 65,
    leadResearcher: 'Dr. Michael Chen',
    institution: 'Stanford University',
    startDate: '2024-02-01',
    estimatedCompletion: '2025-06-30',
    dataProcessed: '1.8 PB',
    keyFindings: [
      'Identified 15 high-affinity compounds',
      'Novel kinase inhibitor discovered',
      'AI model predicts drug efficacy with 87% accuracy'
    ]
  },
  {
    id: 'medical-imaging-2024',
    title: 'Medical Image Classification Network',
    description: 'Training neural networks to detect and classify tumors in medical imaging data',
    type: 'medical-imaging',
    status: 'active',
    participants: 2156,
    computingPower: '750 TFLOPS',
    progress: 82,
    leadResearcher: 'Dr. Emily Rodriguez',
    institution: 'Mayo Clinic',
    startDate: '2024-03-01',
    estimatedCompletion: '2024-11-15',
    dataProcessed: '3.1 PB',
    keyFindings: [
      'Model achieves 96% accuracy in tumor detection',
      'Early stage detection improved by 40%',
      'Reduced false positives by 60%'
    ]
  }
];

// GET /api/research/projects - Get all research projects
router.get('/projects', (req, res) => {
  try {
    const { type, status, limit = 10, offset = 0 } = req.query;

    let filteredProjects = [...researchProjects];

    if (type) {
      filteredProjects = filteredProjects.filter(project => project.type === type);
    }

    if (status) {
      filteredProjects = filteredProjects.filter(project => project.status === status);
    }

    const paginatedProjects = filteredProjects.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        projects: paginatedProjects,
        total: filteredProjects.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch research projects'
    });
  }
});

// GET /api/research/projects/:id - Get specific research project
router.get('/projects/:id', (req, res) => {
  try {
    const project = researchProjects.find(p => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Research project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch research project'
    });
  }
});

// POST /api/research/projects - Create new research project
router.post('/projects', [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 20, max: 1000 }),
  body('type').isIn(['genomics', 'drug-discovery', 'medical-imaging', 'clinical-trials', 'epidemiology']),
  body('leadResearcher').trim().isLength({ min: 2, max: 100 }),
  body('institution').trim().isLength({ min: 2, max: 200 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const newProject = {
      id: `project-${Date.now()}`,
      ...req.body,
      status: 'pending',
      participants: 0,
      computingPower: '0 TFLOPS',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      estimatedCompletion: null,
      dataProcessed: '0 B',
      keyFindings: []
    };

    researchProjects.push(newProject);

    res.status(201).json({
      success: true,
      data: newProject,
      message: 'Research project created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create research project'
    });
  }
});

// PUT /api/research/projects/:id - Update research project
router.put('/projects/:id', (req, res) => {
  try {
    const projectIndex = researchProjects.findIndex(p => p.id === req.params.id);

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Research project not found'
      });
    }

    const updatedProject = {
      ...researchProjects[projectIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    researchProjects[projectIndex] = updatedProject;

    res.json({
      success: true,
      data: updatedProject,
      message: 'Research project updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update research project'
    });
  }
});

// POST /api/research/projects/:id/join - Join a research project
router.post('/projects/:id/join', (req, res) => {
  try {
    const project = researchProjects.find(p => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Research project not found'
      });
    }

    if (project.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Project is not currently accepting participants'
      });
    }

    // In a real implementation, you'd check user authentication and prevent duplicate joins
    project.participants += 1;

    res.json({
      success: true,
      message: 'Successfully joined research project',
      projectId: project.id,
      participants: project.participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to join research project'
    });
  }
});

// GET /api/research/stats - Get research statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalProjects: researchProjects.length,
      activeProjects: researchProjects.filter(p => p.status === 'active').length,
      totalParticipants: researchProjects.reduce((sum, p) => sum + p.participants, 0),
      totalComputingPower: researchProjects.reduce((sum, p) => {
        const power = parseFloat(p.computingPower.replace(' TFLOPS', ''));
        return sum + power;
      }, 0),
      totalDataProcessed: researchProjects.reduce((sum, p) => {
        const size = parseFloat(p.dataProcessed.replace(' PB', ''));
        return sum + size;
      }, 0),
      averageProgress: Math.round(
        researchProjects.reduce((sum, p) => sum + p.progress, 0) / researchProjects.length
      ),
      researchTypes: {
        genomics: researchProjects.filter(p => p.type === 'genomics').length,
        'drug-discovery': researchProjects.filter(p => p.type === 'drug-discovery').length,
        'medical-imaging': researchProjects.filter(p => p.type === 'medical-imaging').length,
        'clinical-trials': researchProjects.filter(p => p.type === 'clinical-trials').length,
        epidemiology: researchProjects.filter(p => p.type === 'epidemiology').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch research statistics'
    });
  }
});

module.exports = router;
