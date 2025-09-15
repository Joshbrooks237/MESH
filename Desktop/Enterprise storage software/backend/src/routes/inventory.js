const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const productSchema = Joi.object({
  sku: Joi.string().min(1).max(50).required(),
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  categoryId: Joi.number().integer().optional(),
  barcode: Joi.string().max(100).optional(),
  rfidTag: Joi.string().max(100).optional(),
  weightKg: Joi.number().precision(3).optional(),
  lengthCm: Joi.number().precision(2).optional(),
  widthCm: Joi.number().precision(2).optional(),
  heightCm: Joi.number().precision(2).optional(),
  unitOfMeasure: Joi.string().valid('each', 'kg', 'liter', 'meter', 'box', 'pallet').default('each'),
  minStockLevel: Joi.number().integer().min(0).default(0),
  maxStockLevel: Joi.number().integer().optional(),
  unitCost: Joi.number().precision(2).optional(),
  sellingPrice: Joi.number().precision(2).optional(),
  storageRequirements: Joi.string().valid('standard', 'refrigerated', 'frozen', 'hazardous', 'fragile', 'secure').default('standard')
});

const inventoryItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  warehouseId: Joi.number().integer().required(),
  locationId: Joi.number().integer().optional(),
  batchNumber: Joi.string().max(50).optional(),
  serialNumber: Joi.string().max(100).optional(),
  manufactureDate: Joi.date().optional(),
  expiryDate: Joi.date().optional(),
  quantity: Joi.number().integer().min(0).required(),
  condition: Joi.string().valid('new', 'good', 'damaged', 'expired').default('new'),
  costPrice: Joi.number().precision(2).optional()
});

const transactionSchema = Joi.object({
  inventoryItemId: Joi.number().integer().required(),
  transactionType: Joi.string().valid(
    'receive', 'pick', 'putaway', 'transfer', 'adjustment', 'count',
    'damage', 'expiry', 'return', 'sale', 'scrap'
  ).required(),
  quantityChange: Joi.number().integer().required(),
  fromLocationId: Joi.number().integer().optional(),
  toLocationId: Joi.number().integer().optional(),
  notes: Joi.string().max(500).optional(),
  referenceNumber: Joi.string().max(50).optional()
});

// Get all products with pagination and filtering
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      active = 'true'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = pgConnection('products')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.code as category_code'
      )
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .where('products.is_active', active === 'true')
      .limit(limit)
      .offset(offset)
      .orderBy('products.created_at', 'desc');

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('products.name', 'ilike', `%${search}%`)
          .orWhere('products.sku', 'ilike', `%${search}%`)
          .orWhere('products.barcode', 'ilike', `%${search}%`);
      });
    }

    if (category) {
      query = query.where('products.category_id', category);
    }

    const products = await query;

    // Get total count for pagination
    let countQuery = pgConnection('products')
      .count('products.id as count')
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .where('products.is_active', active === 'true');

    if (search) {
      countQuery = countQuery.where(function() {
        this.where('products.name', 'ilike', `%${search}%`)
          .orWhere('products.sku', 'ilike', `%${search}%`)
          .orWhere('products.barcode', 'ilike', `%${search}%`);
      });
    }

    if (category) {
      countQuery = countQuery.where('products.category_id', category);
    }

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      code: 'FETCH_PRODUCTS_ERROR'
    });
  }
});

// Get product by ID
router.get('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const product = await pgConnection('products')
      .select(
        'products.*',
        'product_categories.name as category_name',
        'product_categories.code as category_code'
      )
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .where('products.id', id)
      .first();

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      code: 'FETCH_PRODUCT_ERROR'
    });
  }
});

// Create new product
router.post('/products', authenticateToken, checkPermission('inventory.manage'), async (req, res) => {
  try {
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const productData = {
      sku: value.sku,
      name: value.name,
      description: value.description,
      category_id: value.categoryId,
      barcode: value.barcode,
      rfid_tag: value.rfidTag,
      weight_kg: value.weightKg,
      length_cm: value.lengthCm,
      width_cm: value.widthCm,
      height_cm: value.heightCm,
      unit_of_measure: value.unitOfMeasure,
      min_stock_level: value.minStockLevel,
      max_stock_level: value.maxStockLevel,
      unit_cost: value.unitCost,
      selling_price: value.sellingPrice,
      storage_requirements: value.storageRequirements,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [productId] = await pgConnection('products').insert(productData).returning('id');

    const product = await pgConnection('products')
      .select(
        'products.*',
        'product_categories.name as category_name'
      )
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .where('products.id', productId)
      .first();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        error: 'Product with this SKU or barcode already exists',
        code: 'DUPLICATE_PRODUCT'
      });
    }
    res.status(500).json({
      error: 'Failed to create product',
      code: 'CREATE_PRODUCT_ERROR'
    });
  }
});

// Update product
router.put('/products/:id', authenticateToken, checkPermission('inventory.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const updateData = {
      name: value.name,
      description: value.description,
      category_id: value.categoryId,
      barcode: value.barcode,
      rfid_tag: value.rfidTag,
      weight_kg: value.weightKg,
      length_cm: value.lengthCm,
      width_cm: value.widthCm,
      height_cm: value.heightCm,
      unit_of_measure: value.unitOfMeasure,
      min_stock_level: value.minStockLevel,
      max_stock_level: value.maxStockLevel,
      unit_cost: value.unitCost,
      selling_price: value.sellingPrice,
      storage_requirements: value.storageRequirements,
      updated_at: new Date()
    };

    const updated = await pgConnection('products')
      .where('id', id)
      .update(updateData);

    if (updated === 0) {
      return res.status(404).json({
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    const product = await pgConnection('products')
      .select(
        'products.*',
        'product_categories.name as category_name'
      )
      .leftJoin('product_categories', 'products.category_id', 'product_categories.id')
      .where('products.id', id)
      .first();

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Failed to update product',
      code: 'UPDATE_PRODUCT_ERROR'
    });
  }
});

// Get inventory items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      warehouse,
      product,
      location,
      lowStock = false
    } = req.query;

    const offset = (page - 1) * limit;
    let query = pgConnection('inventory_items')
      .select(
        'inventory_items.*',
        'products.sku',
        'products.name as product_name',
        'products.unit_of_measure',
        'warehouses.name as warehouse_name',
        'warehouse_locations.location_code'
      )
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .leftJoin('warehouse_locations', 'inventory_items.location_id', 'warehouse_locations.id')
      .where('inventory_items.is_active', true)
      .limit(limit)
      .offset(offset)
      .orderBy('inventory_items.created_at', 'desc');

    // Apply filters
    if (warehouse) {
      query = query.where('inventory_items.warehouse_id', warehouse);
    }
    if (product) {
      query = query.where('inventory_items.product_id', product);
    }
    if (location) {
      query = query.where('inventory_items.location_id', location);
    }
    if (lowStock === 'true') {
      query = query.whereRaw('inventory_items.quantity <= products.min_stock_level');
    }

    const items = await query;

    // Get total count
    let countQuery = pgConnection('inventory_items')
      .count('inventory_items.id as count')
      .join('products', 'inventory_items.product_id', 'products.id')
      .join('warehouses', 'inventory_items.warehouse_id', 'warehouses.id')
      .where('inventory_items.is_active', true);

    if (warehouse) countQuery = countQuery.where('inventory_items.warehouse_id', warehouse);
    if (product) countQuery = countQuery.where('inventory_items.product_id', product);
    if (location) countQuery = countQuery.where('inventory_items.location_id', location);
    if (lowStock === 'true') {
      countQuery = countQuery.whereRaw('inventory_items.quantity <= products.min_stock_level');
    }

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      error: 'Failed to fetch inventory items',
      code: 'FETCH_INVENTORY_ERROR'
    });
  }
});

// Create inventory transaction
router.post('/transactions', authenticateToken, checkPermission('inventory.manage'), async (req, res) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const { inventoryItemId, transactionType, quantityChange, fromLocationId, toLocationId, notes, referenceNumber } = value;

    // Get current inventory item
    const item = await pgConnection('inventory_items')
      .where('id', inventoryItemId)
      .first();

    if (!item) {
      return res.status(404).json({
        error: 'Inventory item not found',
        code: 'INVENTORY_ITEM_NOT_FOUND'
      });
    }

    const quantityBefore = item.quantity;
    const quantityAfter = quantityBefore + quantityChange;

    // Validate quantity doesn't go negative
    if (quantityAfter < 0) {
      return res.status(400).json({
        error: 'Transaction would result in negative quantity',
        code: 'NEGATIVE_QUANTITY'
      });
    }

    // Start transaction
    const trx = await pgConnection.transaction();

    try {
      // Update inventory quantity
      await trx('inventory_items')
        .where('id', inventoryItemId)
        .update({
          quantity: quantityAfter,
          updated_at: new Date()
        });

      // Record transaction
      const [transactionId] = await trx('inventory_transactions').insert({
        inventory_item_id: inventoryItemId,
        user_id: req.user.id,
        transaction_type: transactionType,
        quantity_change: quantityChange,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        notes,
        reference_number: referenceNumber,
        transaction_at: new Date(),
        created_at: new Date()
      }).returning('id');

      await trx.commit();

      res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction: {
          id: transactionId,
          inventoryItemId,
          transactionType,
          quantityChange,
          quantityBefore,
          quantityAfter,
          notes,
          referenceNumber
        }
      });

    } catch (error) {
      await trx.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      error: 'Failed to record transaction',
      code: 'CREATE_TRANSACTION_ERROR'
    });
  }
});

// Get inventory transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      itemId,
      userId,
      type,
      startDate,
      endDate
    } = req.query;

    const offset = (page - 1) * limit;
    let query = pgConnection('inventory_transactions')
      .select(
        'inventory_transactions.*',
        'users.username',
        'users.first_name',
        'users.last_name',
        'products.sku',
        'products.name as product_name',
        'from_locations.location_code as from_location',
        'to_locations.location_code as to_location'
      )
      .join('users', 'inventory_transactions.user_id', 'users.id')
      .join('inventory_items', 'inventory_transactions.inventory_item_id', 'inventory_items.id')
      .join('products', 'inventory_items.product_id', 'products.id')
      .leftJoin('warehouse_locations as from_locations', 'inventory_transactions.from_location_id', 'from_locations.id')
      .leftJoin('warehouse_locations as to_locations', 'inventory_transactions.to_location_id', 'to_locations.id')
      .limit(limit)
      .offset(offset)
      .orderBy('inventory_transactions.transaction_at', 'desc');

    // Apply filters
    if (itemId) query = query.where('inventory_transactions.inventory_item_id', itemId);
    if (userId) query = query.where('inventory_transactions.user_id', userId);
    if (type) query = query.where('inventory_transactions.transaction_type', type);
    if (startDate) query = query.where('inventory_transactions.transaction_at', '>=', startDate);
    if (endDate) query = query.where('inventory_transactions.transaction_at', '<=', endDate);

    const transactions = await query;

    // Get total count
    let countQuery = pgConnection('inventory_transactions')
      .count('inventory_transactions.id as count')
      .join('users', 'inventory_transactions.user_id', 'users.id')
      .join('inventory_items', 'inventory_transactions.inventory_item_id', 'inventory_items.id');

    if (itemId) countQuery = countQuery.where('inventory_transactions.inventory_item_id', itemId);
    if (userId) countQuery = countQuery.where('inventory_transactions.user_id', userId);
    if (type) countQuery = countQuery.where('inventory_transactions.transaction_type', type);
    if (startDate) countQuery = countQuery.where('inventory_transactions.transaction_at', '>=', startDate);
    if (endDate) countQuery = countQuery.where('inventory_transactions.transaction_at', '<=', endDate);

    const [{ count }] = await countQuery;
    const totalPages = Math.ceil(count / limit);

    res.json({
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      code: 'FETCH_TRANSACTIONS_ERROR'
    });
  }
});

module.exports = router;
