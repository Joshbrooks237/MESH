const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const reportQuerySchema = Joi.object({
  warehouseId: Joi.number().integer().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  categoryId: Joi.number().integer().optional(),
  productId: Joi.number().integer().optional(),
  groupBy: Joi.string().valid('day', 'week', 'month', 'quarter', 'year').optional()
});

// Inventory value report
router.get('/inventory-value', authenticateToken, checkPermission('reporting.view'), async (req, res) => {
  try {
    const { error, value } = reportQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { warehouseId, categoryId, productId } = value;

    let query = pgConnection('inventory_items')
      .select(
        'products.sku',
        'products.name as product_name',
        'product_categories.name as category_name',
        'warehouses.name as warehouse_name',
        pgConnection.raw('SUM(inventory_items.quantity) as total_quantity'),
        pgConnection.raw('SUM(inventory_items.quantity * inventory_items.cost_price) as total_value'),
        pgConnection.raw('AVG(inventory_items.cost_price) as average_cost'),
        pgConnection.raw('MIN(inventory_items.cost_price) as min_cost'),
        pgConnection.raw('MAX(inventory_items.cost_price) as max_cost')
      )
      .join('products', 'inventory_items.product_id', 'products.id')
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .where('inventory_items.is_active', true)
      .where('products.is_active', true)
      .groupBy('products.id', 'products.sku', 'products.name', 'product_categories.name', 'warehouses.name')
      .orderBy('total_value', 'desc');

    // Apply filters
    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);
    if (categoryId) query = query.where('products.category_id', categoryId);
    if (productId) query = query.where('inventory_items.product_id', productId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const inventoryValue = await query;

    // Calculate summary
    const summary = {
      totalItems: inventoryValue.length,
      totalValue: inventoryValue.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0),
      totalQuantity: inventoryValue.reduce((sum, item) => sum + parseInt(item.total_quantity || 0), 0),
      averageValue: inventoryValue.length > 0 ?
        inventoryValue.reduce((sum, item) => sum + parseFloat(item.total_value || 0), 0) / inventoryValue.length : 0
    };

    res.json({
      report: {
        type: 'inventory_value',
        generatedAt: new Date().toISOString(),
        summary,
        data: inventoryValue
      }
    });

  } catch (error) {
    console.error('Inventory value report error:', error);
    res.status(500).json({
      error: 'Failed to generate inventory value report',
      code: 'INVENTORY_VALUE_REPORT_ERROR'
    });
  }
});

// Stock movement report
router.get('/stock-movements', authenticateToken, checkPermission('reporting.view'), async (req, res) => {
  try {
    const { error, value } = reportQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { warehouseId, startDate, endDate, groupBy = 'day' } = value;

    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = "DATE_TRUNC('week', transaction_at)";
        break;
      case 'month':
        dateFormat = "DATE_TRUNC('month', transaction_at)";
        break;
      case 'quarter':
        dateFormat = "DATE_TRUNC('quarter', transaction_at)";
        break;
      case 'year':
        dateFormat = "DATE_TRUNC('year', transaction_at)";
        break;
      default:
        dateFormat = "DATE_TRUNC('day', transaction_at)";
    }

    let query = pgConnection('inventory_transactions')
      .select(
        pgConnection.raw(`${dateFormat} as period`),
        'inventory_transactions.transaction_type',
        'products.sku',
        'products.name as product_name',
        'warehouses.name as warehouse_name',
        'users.username',
        pgConnection.raw('SUM(quantity_change) as total_change'),
        pgConnection.raw('COUNT(*) as transaction_count'),
        pgConnection.raw('AVG(ABS(quantity_change)) as average_change')
      )
      .join('inventory_items', 'inventory_transactions.inventory_item_id', 'inventory_items.id')
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .join('users', 'inventory_transactions.user_id', 'users.id')
      .where('inventory_transactions.transaction_at', '>=', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .where('inventory_transactions.transaction_at', '<=', endDate || new Date())
      .groupBy(pgConnection.raw(dateFormat), 'inventory_transactions.transaction_type', 'products.id', 'products.sku', 'products.name', 'warehouses.name', 'users.username')
      .orderBy('period', 'desc')
      .orderBy('products.name');

    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const movements = await query;

    // Group by period and transaction type
    const groupedMovements = movements.reduce((acc, movement) => {
      const period = movement.period.toISOString().split('T')[0];
      if (!acc[period]) {
        acc[period] = {};
      }
      if (!acc[period][movement.transaction_type]) {
        acc[period][movement.transaction_type] = [];
      }
      acc[period][movement.transaction_type].push(movement);
      return acc;
    }, {});

    res.json({
      report: {
        type: 'stock_movements',
        generatedAt: new Date().toISOString(),
        parameters: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString(),
          groupBy
        },
        data: groupedMovements
      }
    });

  } catch (error) {
    console.error('Stock movements report error:', error);
    res.status(500).json({
      error: 'Failed to generate stock movements report',
      code: 'STOCK_MOVEMENTS_REPORT_ERROR'
    });
  }
});

// Low stock alert report
router.get('/low-stock-alerts', authenticateToken, checkPermission('reporting.view'), async (req, res) => {
  try {
    const { warehouseId } = req.query;

    let query = pgConnection('inventory_items')
      .select(
        'products.sku',
        'products.name as product_name',
        'products.min_stock_level',
        'products.max_stock_level',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code',
        'inventory_items.quantity',
        'inventory_items.reserved_quantity',
        pgConnection.raw('(inventory_items.quantity - inventory_items.reserved_quantity) as available_quantity'),
        pgConnection.raw('ROUND(((inventory_items.quantity - inventory_items.reserved_quantity) / NULLIF(products.min_stock_level, 0)) * 100, 2) as stock_percentage'),
        pgConnection.raw('GREATEST(products.min_stock_level - (inventory_items.quantity - inventory_items.reserved_quantity), 0) as shortage_quantity')
      )
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'inventory_items.location_id', 'warehouse_locations.id')
      .where('inventory_items.is_active', true)
      .where('products.is_active', true)
      .whereRaw('(inventory_items.quantity - inventory_items.reserved_quantity) <= products.min_stock_level')
      .whereRaw('products.min_stock_level > 0')
      .orderBy('stock_percentage')
      .orderBy('products.name');

    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const lowStockItems = await query;

    // Categorize alerts
    const alerts = {
      critical: lowStockItems.filter(item => item.available_quantity <= 0),
      warning: lowStockItems.filter(item => item.available_quantity > 0 && item.available_quantity <= item.min_stock_level * 0.5),
      notice: lowStockItems.filter(item => item.available_quantity > item.min_stock_level * 0.5)
    };

    res.json({
      report: {
        type: 'low_stock_alerts',
        generatedAt: new Date().toISOString(),
        summary: {
          totalAlerts: lowStockItems.length,
          criticalAlerts: alerts.critical.length,
          warningAlerts: alerts.warning.length,
          noticeAlerts: alerts.notice.length
        },
        alerts
      }
    });

  } catch (error) {
    console.error('Low stock alerts report error:', error);
    res.status(500).json({
      error: 'Failed to generate low stock alerts report',
      code: 'LOW_STOCK_ALERTS_REPORT_ERROR'
    });
  }
});

// Warehouse utilization report
router.get('/warehouse-utilization', authenticateToken, checkPermission('reporting.view'), async (req, res) => {
  try {
    const { warehouseId } = req.query;

    let query = pgConnection('warehouses')
      .select(
        'warehouses.id',
        'warehouses.name',
        'warehouses.code',
        'warehouses.total_capacity',
        'warehouses.used_capacity',
        pgConnection.raw('ROUND((warehouses.used_capacity::decimal / NULLIF(warehouses.total_capacity, 0)) * 100, 2) as utilization_percentage'),
        pgConnection.raw('COUNT(DISTINCT warehouse_locations.id) as total_locations'),
        pgConnection.raw('COUNT(DISTINCT CASE WHEN warehouse_locations.is_occupied = true THEN warehouse_locations.id END) as occupied_locations'),
        pgConnection.raw('COUNT(DISTINCT CASE WHEN warehouse_locations.is_blocked = true THEN warehouse_locations.id END) as blocked_locations'),
        pgConnection.raw('COUNT(DISTINCT warehouse_zones.id) as total_zones'),
        pgConnection.raw('COUNT(DISTINCT inventory_items.id) as total_inventory_items'),
        pgConnection.raw('COALESCE(SUM(inventory_items.quantity), 0) as total_quantity'),
        pgConnection.raw('COALESCE(SUM(inventory_items.quantity * inventory_items.cost_price), 0) as total_value')
      )
      .leftJoin('warehouse_zones', 'warehouses.id', 'warehouse_zones.warehouse_id')
      .leftJoin('warehouse_locations', function() {
        this.on('warehouses.id', 'warehouse_locations.warehouse_id')
            .andOn('warehouse_locations.is_active', '=', pgConnection.raw('?', [true]));
      })
      .leftJoin('inventory_items', function() {
        this.on('warehouses.id', 'inventory_items.warehouse_id')
            .andOn('inventory_items.is_active', '=', pgConnection.raw('?', [true]));
      })
      .where('warehouses.is_active', true)
      .groupBy('warehouses.id', 'warehouses.name', 'warehouses.code', 'warehouses.total_capacity', 'warehouses.used_capacity')
      .orderBy('warehouses.name');

    if (warehouseId) query = query.where('warehouses.id', warehouseId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('warehouses.id', req.user.warehouseId);
    }

    const utilization = await query;

    // Get zone utilization breakdown
    let zoneQuery = pgConnection('warehouse_zones')
      .select(
        'warehouse_zones.warehouse_id',
        'warehouse_zones.name as zone_name',
        'warehouse_zones.zone_type',
        pgConnection.raw('COUNT(DISTINCT warehouse_locations.id) as zone_locations'),
        pgConnection.raw('COUNT(DISTINCT CASE WHEN warehouse_locations.is_occupied = true THEN warehouse_locations.id END) as occupied_zone_locations'),
        pgConnection.raw('ROUND((COUNT(DISTINCT CASE WHEN warehouse_locations.is_occupied = true THEN warehouse_locations.id END)::decimal / NULLIF(COUNT(DISTINCT warehouse_locations.id), 0)) * 100, 2) as zone_utilization')
      )
      .leftJoin('warehouse_locations', function() {
        this.on('warehouse_zones.id', 'warehouse_locations.zone_id')
            .andOn('warehouse_locations.is_active', '=', pgConnection.raw('?', [true]));
      })
      .where('warehouse_zones.is_active', true)
      .groupBy('warehouse_zones.warehouse_id', 'warehouse_zones.id', 'warehouse_zones.name', 'warehouse_zones.zone_type')
      .orderBy('warehouse_zones.warehouse_id', 'warehouse_zones.name');

    if (warehouseId) zoneQuery = zoneQuery.where('warehouse_zones.warehouse_id', warehouseId);

    const zoneUtilization = await zoneQuery;

    res.json({
      report: {
        type: 'warehouse_utilization',
        generatedAt: new Date().toISOString(),
        warehouseUtilization: utilization,
        zoneUtilization: zoneUtilization
      }
    });

  } catch (error) {
    console.error('Warehouse utilization report error:', error);
    res.status(500).json({
      error: 'Failed to generate warehouse utilization report',
      code: 'WAREHOUSE_UTILIZATION_REPORT_ERROR'
    });
  }
});

// Product turnover report
router.get('/product-turnover', authenticateToken, checkPermission('reporting.view'), async (req, res) => {
  try {
    const { error, value } = reportQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { warehouseId, startDate, endDate, categoryId } = value;

    // Get products and their transaction activity
    let query = pgConnection('products')
      .select(
        'products.id',
        'products.sku',
        'products.name as product_name',
        'product_categories.name as category_name',
        'warehouses.name as warehouse_name',
        pgConnection.raw('COALESCE(AVG(inventory_items.quantity), 0) as average_inventory'),
        pgConnection.raw('COALESCE(SUM(CASE WHEN transaction_type IN (\'pick\', \'sale\') THEN ABS(quantity_change) END), 0) as total_outbound'),
        pgConnection.raw('COALESCE(SUM(CASE WHEN transaction_type = \'receive\' THEN quantity_change END), 0) as total_inbound'),
        pgConnection.raw('COUNT(DISTINCT CASE WHEN transaction_type IN (\'pick\', \'sale\') THEN DATE(transaction_at) END) as active_days'),
        pgConnection.raw('MIN(inventory_transactions.transaction_at) as first_transaction'),
        pgConnection.raw('MAX(inventory_transactions.transaction_at) as last_transaction')
      )
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .leftJoin('inventory_items', 'products.id', 'inventory_items.product_id')
      .leftJoin('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('inventory_transactions', 'inventory_items.id', 'inventory_transactions.inventory_item_id')
      .where('products.is_active', true)
      .where(function() {
        this.where('inventory_transactions.transaction_at', '>=', startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
           .orWhereNull('inventory_transactions.transaction_at');
      })
      .where(function() {
        this.where('inventory_transactions.transaction_at', '<=', endDate || new Date())
           .orWhereNull('inventory_transactions.transaction_at');
      })
      .groupBy('products.id', 'products.sku', 'products.name', 'product_categories.name', 'warehouses.name', 'inventory_items.warehouse_id')
      .orderBy('total_outbound', 'desc');

    if (warehouseId) query = query.where('inventory_items.warehouse_id', warehouseId);
    if (categoryId) query = query.where('products.category_id', categoryId);

    // Check user warehouse access
    if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.warehouseId) {
      query = query.where('inventory_items.warehouse_id', req.user.warehouseId);
    }

    const turnoverData = await query;

    // Calculate turnover ratios and categorize products
    const processedData = turnoverData.map(item => {
      const averageInventory = parseFloat(item.average_inventory);
      const totalOutbound = parseFloat(item.total_outbound);
      const activeDays = parseInt(item.active_days);

      const turnoverRatio = averageInventory > 0 ? totalOutbound / averageInventory : 0;
      const dailyTurnover = activeDays > 0 ? totalOutbound / activeDays : 0;

      let turnoverCategory;
      if (turnoverRatio >= 12) turnoverCategory = 'fast_moving';
      else if (turnoverRatio >= 4) turnoverCategory = 'medium_moving';
      else if (turnoverRatio >= 1) turnoverCategory = 'slow_moving';
      else turnoverCategory = 'very_slow_moving';

      return {
        ...item,
        turnoverRatio: turnoverRatio.toFixed(2),
        dailyTurnover: dailyTurnover.toFixed(2),
        turnoverCategory,
        activeDays
      };
    });

    // Group by turnover category
    const categorized = processedData.reduce((acc, item) => {
      if (!acc[item.turnoverCategory]) {
        acc[item.turnoverCategory] = [];
      }
      acc[item.turnoverCategory].push(item);
      return acc;
    }, {});

    res.json({
      report: {
        type: 'product_turnover',
        generatedAt: new Date().toISOString(),
        parameters: {
          startDate: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString()
        },
        summary: {
          totalProducts: processedData.length,
          fastMoving: categorized.fast_moving?.length || 0,
          mediumMoving: categorized.medium_moving?.length || 0,
          slowMoving: categorized.slow_moving?.length || 0,
          verySlowMoving: categorized.very_slow_moving?.length || 0
        },
        data: processedData,
        categorized
      }
    });

  } catch (error) {
    console.error('Product turnover report error:', error);
    res.status(500).json({
      error: 'Failed to generate product turnover report',
      code: 'PRODUCT_TURNOVER_REPORT_ERROR'
    });
  }
});

// Custom report generator
router.post('/custom', authenticateToken, checkPermission('reporting.generate'), async (req, res) => {
  try {
    const { reportType, filters, aggregations, dateRange } = req.body;

    // This would be a more complex implementation for custom reports
    // For now, return a placeholder response

    res.json({
      report: {
        type: 'custom',
        generatedAt: new Date().toISOString(),
        status: 'Report generation started. This feature is under development.',
        parameters: {
          reportType,
          filters,
          aggregations,
          dateRange
        }
      }
    });

  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({
      error: 'Failed to generate custom report',
      code: 'CUSTOM_REPORT_ERROR'
    });
  }
});

module.exports = router;
