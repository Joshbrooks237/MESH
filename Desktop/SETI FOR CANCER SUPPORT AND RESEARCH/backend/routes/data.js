const express = require('express');
const router = express.Router();

// Mock data management
const datasets = [
  {
    id: 'dataset-1',
    name: 'Cancer Genome Atlas',
    description: 'Comprehensive genomic dataset from TCGA project',
    type: 'genomics',
    size: '2.3 PB',
    records: 2500000,
    format: 'VCF',
    accessLevel: 'public',
    contributors: 45,
    downloads: 1234,
    lastUpdated: '2024-09-01',
    tags: ['genomics', 'mutations', 'cancer']
  },
  {
    id: 'dataset-2',
    name: 'Medical Imaging Collection',
    description: 'Curated collection of cancer medical images',
    type: 'medical-imaging',
    size: '1.8 PB',
    records: 500000,
    format: 'DICOM',
    accessLevel: 'restricted',
    contributors: 28,
    downloads: 856,
    lastUpdated: '2024-08-15',
    tags: ['imaging', 'diagnosis', 'tumors']
  }
];

// GET /api/data/datasets - Get available datasets
router.get('/datasets', (req, res) => {
  try {
    const { type, accessLevel, limit = 10, offset = 0 } = req.query;
    let filteredDatasets = [...datasets];

    if (type) {
      filteredDatasets = filteredDatasets.filter(dataset => dataset.type === type);
    }

    if (accessLevel) {
      filteredDatasets = filteredDatasets.filter(dataset => dataset.accessLevel === accessLevel);
    }

    const paginatedDatasets = filteredDatasets.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        datasets: paginatedDatasets,
        total: filteredDatasets.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch datasets'
    });
  }
});

// GET /api/data/datasets/:id - Get specific dataset
router.get('/datasets/:id', (req, res) => {
  try {
    const dataset = datasets.find(d => d.id === req.params.id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }

    res.json({
      success: true,
      data: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dataset'
    });
  }
});

// POST /api/data/datasets - Upload new dataset
router.post('/datasets', (req, res) => {
  try {
    const newDataset = {
      id: `dataset-${Date.now()}`,
      ...req.body,
      contributors: 1,
      downloads: 0,
      uploadedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    datasets.push(newDataset);

    res.status(201).json({
      success: true,
      data: newDataset,
      message: 'Dataset uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload dataset'
    });
  }
});

// POST /api/data/datasets/:id/download - Request dataset download
router.post('/datasets/:id/download', (req, res) => {
  try {
    const dataset = datasets.find(d => d.id === req.params.id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        error: 'Dataset not found'
      });
    }

    if (dataset.accessLevel === 'restricted') {
      // In a real implementation, check user permissions
      return res.status(403).json({
        success: false,
        error: 'Access denied. Dataset requires approval.'
      });
    }

    dataset.downloads += 1;

    res.json({
      success: true,
      message: 'Download request processed',
      downloadUrl: `/api/data/download/${dataset.id}`,
      dataset: dataset
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process download request'
    });
  }
});

// GET /api/data/stats - Get data statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalDatasets: datasets.length,
      totalSize: datasets.reduce((sum, d) => {
        const size = parseFloat(d.size.replace(' PB', ''));
        return sum + size;
      }, 0),
      totalRecords: datasets.reduce((sum, d) => sum + d.records, 0),
      totalDownloads: datasets.reduce((sum, d) => sum + d.downloads, 0),
      dataTypes: {
        genomics: datasets.filter(d => d.type === 'genomics').length,
        'medical-imaging': datasets.filter(d => d.type === 'medical-imaging').length,
        'clinical-data': datasets.filter(d => d.type === 'clinical-data').length,
        proteomics: datasets.filter(d => d.type === 'proteomics').length
      },
      accessLevels: {
        public: datasets.filter(d => d.accessLevel === 'public').length,
        restricted: datasets.filter(d => d.accessLevel === 'restricted').length,
        private: datasets.filter(d => d.accessLevel === 'private').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data statistics'
    });
  }
});

module.exports = router;
