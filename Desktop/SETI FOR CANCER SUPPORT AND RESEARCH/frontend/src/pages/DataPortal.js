import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Storage as StorageIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';

const DataPortal = () => {
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockDatasets = [
      {
        id: 'dataset-1',
        name: 'Cancer Genome Atlas',
        description: 'Comprehensive genomic dataset from TCGA project',
        type: 'Genomics',
        size: '2.3 PB',
        records: 2500000,
        format: 'VCF',
        accessLevel: 'Public',
        contributors: 45,
        downloads: 1234,
        lastUpdated: '2024-09-01',
        tags: ['genomics', 'mutations', 'cancer']
      },
      {
        id: 'dataset-2',
        name: 'Medical Imaging Collection',
        description: 'Curated collection of cancer medical images',
        type: 'Medical Imaging',
        size: '1.8 PB',
        records: 500000,
        format: 'DICOM',
        accessLevel: 'Restricted',
        contributors: 28,
        downloads: 856,
        lastUpdated: '2024-08-15',
        tags: ['imaging', 'diagnosis', 'tumors']
      },
      {
        id: 'dataset-3',
        name: 'Drug Response Database',
        description: 'Database of drug responses in cancer cell lines',
        type: 'Drug Discovery',
        size: '450 GB',
        records: 85000,
        format: 'CSV',
        accessLevel: 'Public',
        contributors: 67,
        downloads: 2156,
        lastUpdated: '2024-09-10',
        tags: ['drug-discovery', 'response', 'cell-lines']
      },
    ];

    setDatasets(mockDatasets);
    setFilteredDatasets(mockDatasets);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = datasets.filter(dataset =>
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredDatasets(filtered);
    } else {
      setFilteredDatasets(datasets);
    }
  }, [datasets, searchQuery]);

  const handleDownload = (datasetId) => {
    // In real app, this would trigger download
    console.log('Downloading dataset:', datasetId);
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'Public':
        return '#4caf50';
      case 'Restricted':
        return '#ff9800';
      case 'Private':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const stats = {
    totalDatasets: datasets.length,
    totalSize: datasets.reduce((sum, d) => {
      const size = parseFloat(d.size.replace(' PB', '').replace(' GB', ''));
      const multiplier = d.size.includes('PB') ? 1000 : 1;
      return sum + (size * multiplier);
    }, 0),
    totalDownloads: datasets.reduce((sum, d) => sum + d.downloads, 0),
    dataTypes: [...new Set(datasets.map(d => d.type))].length
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
        Data Portal
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: '#b0b0b0' }}>
        Access and contribute research data to accelerate cancer discoveries.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon sx={{ mr: 1, color: '#00bcd4' }} />
                <Typography variant="h6" sx={{ color: '#00bcd4' }}>
                  {stats.totalDatasets}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Total Datasets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FileDownloadIcon sx={{ mr: 1, color: '#ff9800' }} />
                <Typography variant="h6" sx={{ color: '#ff9800' }}>
                  {stats.totalSize.toFixed(1)} TB
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Total Size
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DownloadIcon sx={{ mr: 1, color: '#9c27b0' }} />
                <Typography variant="h6" sx={{ color: '#9c27b0' }}>
                  {stats.totalDownloads.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Total Downloads
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <UploadIcon sx={{ mr: 1, color: '#4caf50' }} />
                <Typography variant="h6" sx={{ color: '#4caf50' }}>
                  {stats.dataTypes}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                Data Types
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Upload */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search datasets..."
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
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{
            backgroundColor: '#00bcd4',
            '&:hover': { backgroundColor: '#00acc1' },
          }}
        >
          Upload Data
        </Button>
      </Box>

      {/* Datasets Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#0a0a0a' }}>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Dataset</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Records</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Access</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Downloads</TableCell>
                  <TableCell sx={{ color: '#b0b0b0', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDatasets.map((dataset) => (
                  <TableRow key={dataset.id} sx={{ '&:hover': { backgroundColor: '#0a0a0a' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {dataset.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1 }}>
                          {dataset.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {dataset.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                backgroundColor: '#333',
                                color: '#b0b0b0',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dataset.type}
                        size="small"
                        sx={{ backgroundColor: '#00bcd4', color: '#000' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#b0b0b0' }}>{dataset.size}</TableCell>
                    <TableCell sx={{ color: '#b0b0b0' }}>{dataset.records.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={dataset.accessLevel}
                        size="small"
                        sx={{
                          backgroundColor: getAccessLevelColor(dataset.accessLevel),
                          color: '#000',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#b0b0b0' }}>{dataset.downloads.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(dataset.id)}
                        sx={{
                          borderColor: '#00bcd4',
                          color: '#00bcd4',
                          '&:hover': { borderColor: '#00acc1', color: '#00acc1' },
                        }}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Research Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: '#b0b0b0' }}>
            Share your research data with the global cancer research community. All uploads are reviewed for quality and relevance.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dataset Name"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data Type"
                select
                variant="outlined"
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                <option value="genomics">Genomics</option>
                <option value="medical-imaging">Medical Imaging</option>
                <option value="drug-discovery">Drug Discovery</option>
                <option value="clinical-data">Clinical Data</option>
              </TextField>
              <TextField
                fullWidth
                label="Access Level"
                select
                variant="outlined"
                sx={{ mb: 2 }}
                SelectProps={{ native: true }}
              >
                <option value="public">Public</option>
                <option value="restricted">Restricted</option>
                <option value="private">Private</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#00bcd4', '&:hover': { backgroundColor: '#00acc1' } }}
          >
            Upload Dataset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataPortal;
