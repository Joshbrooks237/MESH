const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const barcodeScanSchema = Joi.object({
  barcode: Joi.string().required(),
  locationId: Joi.number().integer().optional(),
  warehouseId: Joi.number().integer().optional(),
  action: Joi.string().valid('scan', 'pick', 'putaway', 'count', 'verify').default('scan')
});

const rfidScanSchema = Joi.object({
  rfidTag: Joi.string().required(),
  readerId: Joi.string().required(),
  locationId: Joi.number().integer().optional(),
  warehouseId: Joi.number().integer().optional(),
  signalStrength: Joi.number().precision(2).optional()
});

// Barcode scanning endpoint
router.post('/barcode/scan', authenticateToken, async (req, res) => {
  try {
    const { error, value } = barcodeScanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { barcode, locationId, warehouseId, action } = value;

    // Find product by barcode
    const product = await pgConnection('products')
      .select('id', 'sku', 'name', 'barcode', 'rfid_tag')
      .where('barcode', barcode)
      .where('is_active', true)
      .first();

    if (!product) {
      return res.status(404).json({
        error: 'Product not found for this barcode',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Find inventory items for this product
    let inventoryQuery = pgConnection('inventory_items')
      .select(
        'inventory_items.*',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code'
      )
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'inventory_items.location_id', 'warehouse_locations.id')
      .where('inventory_items.product_id', product.id)
      .where('inventory_items.is_active', true);

    if (warehouseId) {
      inventoryQuery = inventoryQuery.where('inventory_items.warehouse_id', warehouseId);
    }

    const inventoryItems = await inventoryQuery;

    // Record the scan event
    await pgConnection('scan_events').insert({
      user_id: req.user.id,
      product_id: product.id,
      inventory_item_id: inventoryItems.length > 0 ? inventoryItems[0].id : null,
      location_id: locationId,
      warehouse_id: warehouseId || (inventoryItems.length > 0 ? inventoryItems[0].warehouse_id : null),
      scan_type: 'barcode',
      identifier: barcode,
      action,
      scanned_at: new Date(),
      created_at: new Date()
    });

    res.json({
      message: 'Barcode scanned successfully',
      product,
      inventoryItems,
      action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Barcode scan error:', error);
    res.status(500).json({
      error: 'Failed to process barcode scan',
      code: 'BARCODE_SCAN_ERROR'
    });
  }
});

// RFID scanning endpoint
router.post('/rfid/scan', authenticateToken, async (req, res) => {
  try {
    const { error, value } = rfidScanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { rfidTag, readerId, locationId, warehouseId, signalStrength } = value;

    // Find product by RFID tag
    const product = await pgConnection('products')
      .select('id', 'sku', 'name', 'barcode', 'rfid_tag')
      .where('rfid_tag', rfidTag)
      .where('is_active', true)
      .first();

    if (!product) {
      return res.status(404).json({
        error: 'Product not found for this RFID tag',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Find inventory items for this product
    let inventoryQuery = pgConnection('inventory_items')
      .select(
        'inventory_items.*',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code'
      )
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'inventory_items.location_id', 'warehouse_locations.id')
      .where('inventory_items.product_id', product.id)
      .where('inventory_items.is_active', true);

    if (warehouseId) {
      inventoryQuery = inventoryQuery.where('inventory_items.warehouse_id', warehouseId);
    }

    const inventoryItems = await inventoryQuery;

    // Record the RFID scan event
    await pgConnection('rfid_events').insert({
      user_id: req.user.id,
      product_id: product.id,
      inventory_item_id: inventoryItems.length > 0 ? inventoryItems[0].id : null,
      location_id: locationId,
      warehouse_id: warehouseId || (inventoryItems.length > 0 ? inventoryItems[0].warehouse_id : null),
      reader_id: readerId,
      rfid_tag: rfidTag,
      signal_strength: signalStrength,
      scanned_at: new Date(),
      created_at: new Date()
    });

    res.json({
      message: 'RFID tag scanned successfully',
      product,
      inventoryItems,
      readerId,
      signalStrength,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RFID scan error:', error);
    res.status(500).json({
      error: 'Failed to process RFID scan',
      code: 'RFID_SCAN_ERROR'
    });
  }
});

// Get real-time inventory status
router.get('/inventory/status', authenticateToken, async (req, res) => {
  try {
    const { warehouseId, productId, locationId } = req.query;

    let query = pgConnection('inventory_items')
      .select(
        'inventory_items.id',
        'inventory_items.quantity',
        'inventory_items.reserved_quantity',
        'inventory_items.last_counted_at',
        'products.sku',
        'products.name as product_name',
        'products.min_stock_level',
        'products.max_stock_level',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code',
        pgConnection.raw('(inventory_items.quantity - inventory_items.reserved_quantity) as available_quantity')
      )
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'inventory_items.location_id', 'warehouse_locations.id')
      .where('inventory_items.is_active', true)
      .where('products.is_active', true);

    // Apply filters
    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);
    if (productId) query = query.where('inventory_items.product_id', productId);
    if (locationId) query = query.where('inventory_items.location_id', locationId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const inventoryStatus = await query;

    // Calculate status indicators
    const statusWithIndicators = inventoryStatus.map(item => ({
      ...item,
      status: item.available_quantity <= 0 ? 'out_of_stock' :
               item.available_quantity <= item.min_stock_level ? 'low_stock' :
               item.available_quantity >= item.max_stock_level ? 'overstock' : 'normal',
      stock_percentage: item.max_stock_level > 0 ?
        ((item.available_quantity / item.max_stock_level) * 100).toFixed(2) : 0
    }));

    res.json({
      inventoryStatus: statusWithIndicators,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get inventory status error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory status',
      code: 'FETCH_INVENTORY_STATUS_ERROR'
    });
  }
});

// Get location occupancy status
router.get('/locations/occupancy', authenticateToken, async (req, res) => {
  try {
    const { warehouseId, zoneId } = req.query;

    let query = pgConnection('warehouse_locations')
      .select(
        'warehouse_locations.id',
        'warehouse_locations.location_code',
        'warehouse_locations.aisle',
        'warehouse_locations.level',
        'warehouse_locations.position',
        'warehouse_locations.is_occupied',
        'warehouse_locations.is_blocked',
        'warehouse_zones.name as zone_name',
        'warehouse_zones.zone_type',
        'inventory_items.quantity',
        'products.sku',
        'products.name as product_name'
      )
      .join('warehouse_zones', 'warehouse_locations.zone_id', 'warehouse_zones.id')
      .leftJoin('inventory_items', function() {
        this.on('warehouse_locations.id', 'inventory_items.location_id')
            .andOn('inventory_items.is_active', '=', pgConnection.raw('?', [true]));
      })
      .leftJoin('products', 'inventory_items.product_id', 'products.id')
      .where('warehouse_locations.is_active', true)
      .where('warehouse_zones.is_active', true);

    if (warehouseId) query = query.where('warehouse_locations.warehouse_id', warehouseId);
    if (zoneId) query = query.where('warehouse_locations.zone_id', zoneId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('warehouse_locations.warehouse_id', req.user.warehouseId);
    }

    const locations = await query;

    // Calculate occupancy statistics
    const stats = {
      total: locations.length,
      occupied: locations.filter(l => l.is_occupied).length,
      blocked: locations.filter(l => l.is_blocked).length,
      available: locations.filter(l => !l.is_occupied && !l.is_blocked).length,
      utilization_rate: ((locations.filter(l => l.is_occupied).length / locations.length) * 100).toFixed(2)
    };

    res.json({
      locations,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get location occupancy error:', error);
    res.status(500).json({
      error: 'Failed to fetch location occupancy',
      code: 'FETCH_OCCUPANCY_ERROR'
    });
  }
});

// Get recent scan events
router.get('/scans/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, type, warehouseId } = req.query;

    let query = pgConnection('scan_events')
      .select(
        'scan_events.*',
        'users.username',
        'users.first_name',
        'users.last_name',
        'products.sku',
        'products.name as product_name',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code'
      )
      .join('users', 'scan_events.user_id', 'users.id')
      .join('products', 'scan_events.product_id', 'products.id')
      .leftJoin('warehouses', 'scan_events.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'scan_events.location_id', 'warehouse_locations.id')
      .orderBy('scan_events.scanned_at', 'desc')
      .limit(parseInt(limit));

    if (type) query = query.where('scan_events.scan_type', type);
    if (warehouseId) query = query.where('scan_events.warehouse_id', warehouseId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('scan_events.warehouse_id', req.user.warehouseId);
    }

    const scanEvents = await query;

    res.json({
      scanEvents,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get recent scans error:', error);
    res.status(500).json({
      error: 'Failed to fetch recent scans',
      code: 'FETCH_SCANS_ERROR'
    });
  }
});

// Get movement tracking data
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const { warehouseId, startDate, endDate, productId } = req.query;

    let query = pgConnection('inventory_transactions')
      .select(
        'inventory_transactions.*',
        'users.username',
        'users.first_name',
        'users.last_name',
        'products.sku',
        'products.name as product_name',
        'warehouses.name as warehouse_name',
        'from_locations.location_code as from_location',
        'to_locations.location_code as to_location'
      )
      .join('users', 'inventory_transactions.user_id', 'users.id')
      .join('inventory_items', 'inventory_transactions.inventory_item_id', 'inventory_items.id')
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations as from_locations', 'inventory_transactions.from_location_id', 'from_locations.id')
      .leftJoin('warehouse_locations as to_locations', 'inventory_transactions.to_location_id', 'to_locations.id')
      .whereIn('inventory_transactions.transaction_type', ['transfer', 'pick', 'putaway'])
      .orderBy('inventory_transactions.transaction_at', 'desc')
      .limit(100);

    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);
    if (productId) query = query.where('inventory_items.product_id', productId);
    if (startDate) query = query.where('inventory_transactions.transaction_at', '>=', startDate);
    if (endDate) query = query.where('inventory_transactions.transaction_at', '<=', endDate);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const movements = await query;

    res.json({
      movements,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get movements error:', error);
    res.status(500).json({
      error: 'Failed to fetch movements',
      code: 'FETCH_MOVEMENTS_ERROR'
    });
  }
});

// Get dashboard metrics
router.get('/dashboard/metrics', authenticateToken, async (req, res) => {
  try {
    const { warehouseId } = req.query;

    let warehouseFilter = '';
    let params = [];

    if (warehouseId) {
      warehouseFilter = 'WHERE warehouse_id = ?';
      params.push(warehouseId);
    } else if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      warehouseFilter = 'WHERE warehouse_id = ?';
      params.push(req.user.warehouseId);
    }

    // Get total inventory value
    const [inventoryValue] = await pgConnection.raw(`
      SELECT COALESCE(SUM(quantity * cost_price), 0) as total_value
      FROM inventory_items
      WHERE is_active = true ${warehouseFilter ? 'AND warehouse_id = ?' : ''}
    `, params);

    // Get low stock items count
    const [lowStock] = await pgConnection.raw(`
      SELECT COUNT(*) as count
      FROM inventory_items i
      JOIN products p ON i.product_id = p.id
      WHERE i.is_active = true AND p.is_active = true
      AND (i.quantity - i.reserved_quantity) <= p.min_stock_level
      ${warehouseFilter ? 'AND i.warehouse_id = ?' : ''}
    `, params);

    // Get out of stock items count
    const [outOfStock] = await pgConnection.raw(`
      SELECT COUNT(*) as count
      FROM inventory_items
      WHERE is_active = true AND quantity <= 0
      ${warehouseFilter ? 'AND warehouse_id = ?' : ''}
    `, params);

    // Get recent transactions count (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentTransactions] = await pgConnection.raw(`
      SELECT COUNT(*) as count
      FROM inventory_transactions it
      JOIN inventory_items i ON it.inventory_item_id = i.id
      WHERE it.transaction_at >= ?
      ${warehouseFilter ? 'AND i.warehouse_id = ?' : ''}
    `, [yesterday, ...(warehouseFilter ? [params[0]] : [])]);

    // Get warehouse utilization
    const [utilization] = await pgConnection.raw(`
      SELECT
        COUNT(*) as total_locations,
        COUNT(CASE WHEN is_occupied = true THEN 1 END) as occupied_locations
      FROM warehouse_locations
      WHERE is_active = true
      ${warehouseFilter ? 'AND warehouse_id = ?' : ''}
    `, params);

    const metrics = {
      inventoryValue: parseFloat(inventoryValue.total_value),
      lowStockItems: parseInt(lowStock.count),
      outOfStockItems: parseInt(outOfStock.count),
      recentTransactions: parseInt(recentTransactions.count),
      warehouseUtilization: {
        totalLocations: parseInt(utilization.total_locations),
        occupiedLocations: parseInt(utilization.occupied_locations),
        utilizationRate: utilization.total_locations > 0 ?
          ((utilization.occupied_locations / utilization.total_locations) * 100).toFixed(2) : 0
      },
      timestamp: new Date().toISOString()
    };

    res.json({ metrics });

  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      code: 'FETCH_METRICS_ERROR'
    });
  }
});

module.exports = router;
