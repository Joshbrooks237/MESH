const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const warehouseSchema = Joi.object({
  code: Joi.string().min(1).max(20).required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  country: Joi.string().max(50).default('USA'),
  postalCode: Joi.string().max(20).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  totalCapacity: Joi.number().integer().min(0).default(0)
});

const zoneSchema = Joi.object({
  warehouseId: Joi.number().integer().required(),
  code: Joi.string().min(1).max(20).required(),
  name: Joi.string().min(1).max(100).required(),
  zoneType: Joi.string().valid('storage', 'picking', 'shipping', 'receiving', 'quality_control', 'returns').default('storage'),
  aisleCount: Joi.number().integer().min(0).default(0),
  levelCount: Joi.number().integer().min(1).default(1),
  positionCount: Joi.number().integer().min(0).default(0),
  temperatureMin: Joi.number().precision(2).optional(),
  temperatureMax: Joi.number().precision(2).optional(),
  requiresAuthorization: Joi.boolean().default(false)
});

const locationSchema = Joi.object({
  warehouseId: Joi.number().integer().required(),
  zoneId: Joi.number().integer().required(),
  aisle: Joi.number().integer().min(1).required(),
  level: Joi.number().integer().min(1).required(),
  position: Joi.number().integer().min(1).required(),
  locationType: Joi.string().valid('bin', 'shelf', 'pallet', 'floor').default('bin'),
  maxWeightKg: Joi.number().integer().min(0).default(100),
  maxHeightCm: Joi.number().integer().min(0).default(200),
  widthCm: Joi.number().precision(2).optional(),
  depthCm: Joi.number().precision(2).optional()
});

// Get all warehouses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const warehouses = await pgConnection('warehouses')
      .select('*')
      .where('is_active', true)
      .orderBy('created_at', 'desc');

    res.json({ warehouses });

  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({
      error: 'Failed to fetch warehouses',
      code: 'FETCH_WAREHOUSES_ERROR'
    });
  }
});

// Create warehouse
router.post('/', authenticateToken, checkPermission('warehouse.manage'), async (req, res) => {
  try {
    const { error, value } = warehouseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const warehouseData = {
      code: value.code,
      name: value.name,
      description: value.description,
      address: value.address,
      city: value.city,
      state: value.state,
      country: value.country,
      postal_code: value.postalCode,
      latitude: value.latitude,
      longitude: value.longitude,
      total_capacity: value.totalCapacity,
      used_capacity: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [warehouseId] = await pgConnection('warehouses').insert(warehouseData).returning('id');

    const warehouse = await pgConnection('warehouses').where('id', warehouseId).first();

    res.status(201).json({
      message: 'Warehouse created successfully',
      warehouse
    });

  } catch (error) {
    console.error('Create warehouse error:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Warehouse with this code already exists',
        code: 'DUPLICATE_WAREHOUSE'
      });
    }
    res.status(500).json({
      error: 'Failed to create warehouse',
      code: 'CREATE_WAREHOUSE_ERROR'
    });
  }
});

// Get warehouse zones
router.get('/:warehouseId/zones', authenticateToken, async (req, res) => {
  try {
    const { warehouseId } = req.params;

    // Check if warehouse exists and user has access
    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    // Check access permissions (users can only see their warehouse unless they have admin rights)
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId !== parseInt(warehouseId)) {
      return res.status(403).json({
        error: 'Access denied to this warehouse',
        code: 'WAREHOUSE_ACCESS_DENIED'
      });
    }

    const zones = await pgConnection('warehouse_zones')
      .where('warehouse_id', warehouseId)
      .where('is_active', true)
      .orderBy('code');

    res.json({ zones });

  } catch (error) {
    console.error('Get warehouse zones error:', error);
    res.status(500).json({
      error: 'Failed to fetch warehouse zones',
      code: 'FETCH_ZONES_ERROR'
    });
  }
});

// Create warehouse zone
router.post('/:warehouseId/zones', authenticateToken, checkPermission('warehouse.manage'), async (req, res) => {
  try {
    const { warehouseId } = req.params;

    // Check if warehouse exists
    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    const { error, value } = zoneSchema.validate({ ...req.body, warehouseId: parseInt(warehouseId) });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const zoneData = {
      warehouse_id: warehouseId,
      code: value.code,
      name: value.name,
      zone_type: value.zoneType,
      aisle_count: value.aisleCount,
      level_count: value.levelCount,
      position_count: value.positionCount,
      temperature_min: value.temperatureMin,
      temperature_max: value.temperatureMax,
      requires_authorization: value.requiresAuthorization,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [zoneId] = await pgConnection('warehouse_zones').insert(zoneData).returning('id');

    const zone = await pgConnection('warehouse_zones').where('id', zoneId).first();

    res.status(201).json({
      message: 'Zone created successfully',
      zone
    });

  } catch (error) {
    console.error('Create zone error:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Zone with this code already exists in the warehouse',
        code: 'DUPLICATE_ZONE'
      });
    }
    res.status(500).json({
      error: 'Failed to create zone',
      code: 'CREATE_ZONE_ERROR'
    });
  }
});

// Get warehouse locations
router.get('/:warehouseId/locations', authenticateToken, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { zoneId, occupied, aisle, level } = req.query;

    // Check warehouse access
    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId !== parseInt(warehouseId)) {
      return res.status(403).json({
        error: 'Access denied to this warehouse',
        code: 'WAREHOUSE_ACCESS_DENIED'
      });
    }

    let query = pgConnection('warehouse_locations')
      .select(
        'warehouse_locations.*',
        'warehouse_zones.name as zone_name',
        'warehouse_zones.code as zone_code'
      )
      .join('warehouse_zones', 'warehouse_locations.zone_id', 'warehouse_zones.id')
      .where('warehouse_locations.warehouse_id', warehouseId)
      .where('warehouse_locations.is_active', true)
      .orderBy(['aisle', 'level', 'position']);

    // Apply filters
    if (zoneId) query = query.where('warehouse_locations.zone_id', zoneId);
    if (occupied !== undefined) query = query.where('warehouse_locations.is_occupied', occupied === 'true');
    if (aisle) query = query.where('warehouse_locations.aisle', aisle);
    if (level) query = query.where('warehouse_locations.level', level);

    const locations = await query;

    res.json({ locations });

  } catch (error) {
    console.error('Get warehouse locations error:', error);
    res.status(500).json({
      error: 'Failed to fetch warehouse locations',
      code: 'FETCH_LOCATIONS_ERROR'
    });
  }
});

// Create warehouse location
router.post('/:warehouseId/locations', authenticateToken, checkPermission('warehouse.manage'), async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    const { error, value } = locationSchema.validate({ ...req.body, warehouseId: parseInt(warehouseId) });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    // Generate location code
    const locationCode = `${value.aisle.toString().padStart(2, '0')}-${value.level.toString().padStart(2, '0')}-${value.position.toString().padStart(3, '0')}`;

    const locationData = {
      warehouse_id: warehouseId,
      zone_id: value.zoneId,
      location_code: locationCode,
      aisle: value.aisle,
      level: value.level,
      position: value.position,
      location_type: value.locationType,
      max_weight_kg: value.maxWeightKg,
      max_height_cm: value.maxHeightCm,
      width_cm: value.widthCm,
      depth_cm: value.depthCm,
      is_occupied: false,
      is_blocked: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [locationId] = await pgConnection('warehouse_locations').insert(locationData).returning('id');

    const location = await pgConnection('warehouse_locations')
      .select(
        'warehouse_locations.*',
        'warehouse_zones.name as zone_name'
      )
      .join('warehouse_zones', 'warehouse_locations.zone_id', 'warehouse_zones.id')
      .where('warehouse_locations.id', locationId)
      .first();

    res.status(201).json({
      message: 'Location created successfully',
      location
    });

  } catch (error) {
    console.error('Create location error:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Location with this code already exists',
        code: 'DUPLICATE_LOCATION'
      });
    }
    res.status(500).json({
      error: 'Failed to create location',
      code: 'CREATE_LOCATION_ERROR'
    });
  }
});

// Bulk create locations for a zone
router.post('/:warehouseId/zones/:zoneId/locations/bulk', authenticateToken, checkPermission('warehouse.manage'), async (req, res) => {
  try {
    const { warehouseId, zoneId } = req.params;
    const { aisleStart, aisleEnd, levelStart, levelEnd, positionStart, positionEnd, locationType = 'bin' } = req.body;

    // Validate inputs
    if (!aisleStart || !aisleEnd || !levelStart || !levelEnd || !positionStart || !positionEnd) {
      return res.status(400).json({
        error: 'All range parameters are required',
        code: 'MISSING_RANGE_PARAMS'
      });
    }

    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    const zone = await pgConnection('warehouse_zones')
      .where('id', zoneId)
      .where('warehouse_id', warehouseId)
      .where('is_active', true)
      .first();

    if (!zone) {
      return res.status(404).json({
        error: 'Zone not found',
        code: 'ZONE_NOT_FOUND'
      });
    }

    const locations = [];
    const locationCodes = [];

    // Generate all location combinations
    for (let aisle = aisleStart; aisle <= aisleEnd; aisle++) {
      for (let level = levelStart; level <= levelEnd; level++) {
        for (let position = positionStart; position <= positionEnd; position++) {
          const locationCode = `${aisle.toString().padStart(2, '0')}-${level.toString().padStart(2, '0')}-${position.toString().padStart(3, '0')}`;
          locationCodes.push(locationCode);

          locations.push({
            warehouse_id: parseInt(warehouseId),
            zone_id: parseInt(zoneId),
            location_code: locationCode,
            aisle,
            level,
            position,
            location_type: locationType,
            max_weight_kg: 100,
            max_height_cm: 200,
            is_occupied: false,
            is_blocked: false,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    }

    // Check for existing locations
    const existingLocations = await pgConnection('warehouse_locations')
      .whereIn('location_code', locationCodes)
      .where('warehouse_id', warehouseId);

    if (existingLocations.length > 0) {
      return res.status(409).json({
        error: 'Some locations already exist',
        code: 'LOCATIONS_EXIST',
        existingCodes: existingLocations.map(l => l.location_code)
      });
    }

    // Insert locations in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      await pgConnection('warehouse_locations').insert(batch);
      insertedCount += batch.length;
    }

    res.status(201).json({
      message: `${insertedCount} locations created successfully`,
      count: insertedCount,
      ranges: {
        aisles: `${aisleStart}-${aisleEnd}`,
        levels: `${levelStart}-${levelEnd}`,
        positions: `${positionStart}-${positionEnd}`
      }
    });

  } catch (error) {
    console.error('Bulk create locations error:', error);
    res.status(500).json({
      error: 'Failed to create locations',
      code: 'BULK_CREATE_LOCATIONS_ERROR'
    });
  }
});

// Get warehouse utilization
router.get('/:warehouseId/utilization', authenticateToken, async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const warehouse = await pgConnection('warehouses')
      .where('id', warehouseId)
      .where('is_active', true)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        error: 'Warehouse not found',
        code: 'WAREHOUSE_NOT_FOUND'
      });
    }

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId !== parseInt(warehouseId)) {
      return res.status(403).json({
        error: 'Access denied to this warehouse',
        code: 'WAREHOUSE_ACCESS_DENIED'
      });
    }

    // Get location statistics
    const locationStats = await pgConnection('warehouse_locations')
      .select(
        pgConnection.raw('COUNT(*) as total_locations'),
        pgConnection.raw('COUNT(CASE WHEN is_occupied = true THEN 1 END) as occupied_locations'),
        pgConnection.raw('COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_locations')
      )
      .where('warehouse_id', warehouseId)
      .where('is_active', true)
      .first();

    // Get zone statistics
    const zoneStats = await pgConnection('warehouse_zones')
      .select('zone_type')
      .count('* as count')
      .where('warehouse_id', warehouseId)
      .where('is_active', true)
      .groupBy('zone_type');

    // Get inventory value
    const inventoryValue = await pgConnection('inventory_items')
      .sum('quantity * cost_price as total_value')
      .where('warehouse_id', warehouseId)
      .where('is_active', true)
      .first();

    const utilization = {
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        totalCapacity: warehouse.total_capacity,
        usedCapacity: warehouse.used_capacity
      },
      locations: {
        total: parseInt(locationStats.total_locations),
        occupied: parseInt(locationStats.occupied_locations),
        blocked: parseInt(locationStats.blocked_locations),
        available: parseInt(locationStats.total_locations) - parseInt(locationStats.occupied_locations) - parseInt(locationStats.blocked_locations)
      },
      zones: zoneStats,
      inventoryValue: parseFloat(inventoryValue.total_value || 0),
      utilizationPercentage: warehouse.total_capacity > 0 ?
        ((warehouse.used_capacity / warehouse.total_capacity) * 100).toFixed(2) : 0
    };

    res.json({ utilization });

  } catch (error) {
    console.error('Get warehouse utilization error:', error);
    res.status(500).json({
      error: 'Failed to fetch warehouse utilization',
      code: 'FETCH_UTILIZATION_ERROR'
    });
  }
});

// Get warehouse locations for map display
router.get('/map-data', authenticateToken, async (req, res) => {
  try {
    // Get all warehouses with location data
    const warehouses = await pgConnection('warehouses')
      .select(
        'id',
        'code',
        'name',
        'address',
        'city',
        'state',
        'postal_code',
        'latitude',
        'longitude',
        'total_capacity',
        'used_capacity',
        'is_active'
      )
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .where('is_active', true);

    // Get location statistics for each warehouse
    const mapData = await Promise.all(
      warehouses.map(async (warehouse) => {
        try {
          const stats = await pgConnection('warehouse_locations')
            .select(
              pgConnection.raw('COUNT(*) as total_locations'),
              pgConnection.raw('COUNT(CASE WHEN is_occupied = true THEN 1 END) as occupied_locations'),
              pgConnection.raw('COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_locations')
            )
            .where('warehouse_id', warehouse.id)
            .where('is_active', true)
            .first();

          // Get tenant count for this warehouse (simplified)
          let tenantCount = { count: 0 };
          try {
            tenantCount = await pgConnection('tenant_units')
              .countDistinct('tenant_id as count')
              .leftJoin('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
              .where('warehouse_locations.warehouse_id', warehouse.id)
              .whereNull('tenant_units.end_date')
              .first();
          } catch (tenantError) {
            console.log(`Could not get tenant count for warehouse ${warehouse.id}:`, tenantError.message);
          }

          return {
            ...warehouse,
            latitude: parseFloat(warehouse.latitude),
            longitude: parseFloat(warehouse.longitude),
            utilization_rate: warehouse.total_capacity > 0 ?
              Math.round((warehouse.used_capacity / warehouse.total_capacity) * 100) : 0,
            location_stats: {
              total_locations: parseInt(stats.total_locations || 0),
              occupied_locations: parseInt(stats.occupied_locations || 0),
              blocked_locations: parseInt(stats.blocked_locations || 0),
              available_locations: parseInt(stats.total_locations || 0) - parseInt(stats.occupied_locations || 0) - parseInt(stats.blocked_locations || 0)
            },
            tenant_count: parseInt(tenantCount.count || 0)
          };
        } catch (warehouseError) {
          console.log(`Error processing warehouse ${warehouse.id}:`, warehouseError.message);
          return {
            ...warehouse,
            latitude: parseFloat(warehouse.latitude),
            longitude: parseFloat(warehouse.longitude),
            utilization_rate: 0,
            location_stats: {
              total_locations: 0,
              occupied_locations: 0,
              blocked_locations: 0,
              available_locations: 0
            },
            tenant_count: 0
          };
        }
      })
    );

    // Get overall statistics
    const overallStats = {
      total_warehouses: mapData.length,
      total_capacity: mapData.reduce((sum, w) => sum + (w.total_capacity || 0), 0),
      total_used: mapData.reduce((sum, w) => sum + (w.used_capacity || 0), 0),
      total_tenants: mapData.reduce((sum, w) => sum + w.tenant_count, 0)
    };

    overallStats.overall_utilization = overallStats.total_capacity > 0 ?
      Math.round((overallStats.total_used / overallStats.total_capacity) * 100) : 0;

    res.json({
      warehouses: mapData,
      statistics: overallStats
    });

  } catch (error) {
    console.error('Get map data error:', error);
    res.status(500).json({
      error: 'Failed to fetch map data',
      code: 'FETCH_MAP_DATA_ERROR'
    });
  }
});

module.exports = router;
