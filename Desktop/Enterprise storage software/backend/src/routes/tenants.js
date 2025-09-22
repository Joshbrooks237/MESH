const express = require('express');
const Joi = require('joi');
const { pgConnection } = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const tenantSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zipCode: Joi.string().max(20).optional(),
  driverLicense: Joi.string().max(50).optional(),
  dateOfBirth: Joi.date().optional(),
  emergencyContactName: Joi.string().max(100).optional(),
  emergencyContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
});

const tenantUnitSchema = Joi.object({
  tenantId: Joi.number().integer().required(),
  locationId: Joi.number().integer().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  monthlyRate: Joi.number().precision(2).min(0).required(),
  depositAmount: Joi.number().precision(2).min(0).default(0),
  notes: Joi.string().max(500).optional()
});

// Get all tenants with search functionality
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      active = 'true'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = pgConnection('tenants')
      .select(
        'tenants.*',
        pgConnection.raw('COUNT(tenant_units.id) as unit_count'),
        pgConnection.raw('COUNT(CASE WHEN tenant_units.is_active = true THEN 1 END) as active_units')
      )
      .leftJoin('tenant_units', 'tenants.id', 'tenant_units.tenant_id')
      .where('tenants.is_active', active === 'true')
      .groupBy('tenants.id')
      .limit(limit)
      .offset(offset)
      .orderBy('tenants.created_at', 'desc');

    // Apply search filter
    if (search) {
      query = query.where(function() {
        this.where('tenants.first_name', 'ilike', `%${search}%`)
          .orWhere('tenants.last_name', 'ilike', `%${search}%`)
          .orWhere('tenants.email', 'ilike', `%${search}%`)
          .orWhere('tenants.phone', 'ilike', `%${search}%`)
          .orWhere('tenants.address', 'ilike', `%${search}%`)
          .orWhere('tenants.city', 'ilike', `%${search}%`)
          .orWhere('tenants.state', 'ilike', `%${search}%`)
          .orWhere('tenants.zip_code', 'ilike', `%${search}%`);
      });
    }

    const tenants = await query;

    // Get total count for pagination
    let countQuery = pgConnection('tenants')
      .where('tenants.is_active', active === 'true');

    if (search) {
      countQuery = countQuery.where(function() {
        this.where('tenants.first_name', 'ilike', `%${search}%`)
          .orWhere('tenants.last_name', 'ilike', `%${search}%`)
          .orWhere('tenants.email', 'ilike', `%${search}%`)
          .orWhere('tenants.phone', 'ilike', `%${search}%`)
          .orWhere('tenants.address', 'ilike', `%${search}%`)
          .orWhere('tenants.city', 'ilike', `%${search}%`)
          .orWhere('tenants.state', 'ilike', `%${search}%`)
          .orWhere('tenants.zip_code', 'ilike', `%${search}%`);
      });
    }

    const [{ count }] = await countQuery.count('* as count');
    const totalPages = Math.ceil(count / limit);

    res.json({
      tenants,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({
      error: 'Failed to fetch tenants',
      code: 'FETCH_TENANTS_ERROR'
    });
  }
});

// Get tenant by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await pgConnection('tenants')
      .where('id', id)
      .first();

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    // Get tenant's units
    const units = await pgConnection('tenant_units')
      .select(
        'tenant_units.*',
        'warehouse_locations.location_code',
        'warehouse_locations.aisle',
        'warehouse_locations.level',
        'warehouse_locations.position'
      )
      .join('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
      .where('tenant_units.tenant_id', id)
      .where('tenant_units.is_active', true)
      .orderBy('tenant_units.created_at', 'desc');

    // Get payment history
    const payments = await pgConnection('tenant_payments')
      .where('tenant_id', id)
      .orderBy('payment_date', 'desc')
      .limit(10);

    res.json({
      tenant: {
        ...tenant,
        units,
        recentPayments: payments
      }
    });

  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant',
      code: 'FETCH_TENANT_ERROR'
    });
  }
});

// Create new tenant
router.post('/', authenticateToken, checkPermission('tenant.manage'), async (req, res) => {
  try {
    const { error, value } = tenantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const tenantData = {
      first_name: value.firstName,
      last_name: value.lastName,
      email: value.email,
      phone: value.phone,
      address: value.address,
      city: value.city,
      state: value.state,
      zip_code: value.zipCode,
      driver_license: value.driverLicense,
      date_of_birth: value.dateOfBirth,
      emergency_contact_name: value.emergencyContactName,
      emergency_contact_phone: value.emergencyContactPhone,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [tenantId] = await pgConnection('tenants').insert(tenantData).returning('id');

    const tenant = await pgConnection('tenants')
      .where('id', tenantId)
      .first();

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant
    });

  } catch (error) {
    console.error('Create tenant error:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Tenant with this email already exists',
        code: 'DUPLICATE_TENANT'
      });
    }
    res.status(500).json({
      error: 'Failed to create tenant',
      code: 'CREATE_TENANT_ERROR'
    });
  }
});

// Update tenant
router.put('/:id', authenticateToken, checkPermission('tenant.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = tenantSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    const updateData = {
      first_name: value.firstName,
      last_name: value.lastName,
      email: value.email,
      phone: value.phone,
      address: value.address,
      city: value.city,
      state: value.state,
      zip_code: value.zipCode,
      driver_license: value.driverLicense,
      date_of_birth: value.dateOfBirth,
      emergency_contact_name: value.emergencyContactName,
      emergency_contact_phone: value.emergencyContactPhone,
      updated_at: new Date()
    };

    const updated = await pgConnection('tenants')
      .where('id', id)
      .update(updateData);

    if (updated === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    const tenant = await pgConnection('tenants')
      .where('id', id)
      .first();

    res.json({
      message: 'Tenant updated successfully',
      tenant
    });

  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({
      error: 'Failed to update tenant',
      code: 'UPDATE_TENANT_ERROR'
    });
  }
});

// Assign unit to tenant
router.post('/:tenantId/units', authenticateToken, checkPermission('tenant.manage'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { error, value } = tenantUnitSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }

    // Check if tenant exists
    const tenant = await pgConnection('tenants')
      .where('id', tenantId)
      .first();

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      });
    }

    // Check if location exists and is available
    const location = await pgConnection('warehouse_locations')
      .where('id', value.locationId)
      .first();

    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        code: 'LOCATION_NOT_FOUND'
      });
    }

    if (location.is_occupied) {
      return res.status(409).json({
        error: 'Location is already occupied',
        code: 'LOCATION_OCCUPIED'
      });
    }

    // Create tenant-unit relationship
    const [tenantUnitId] = await pgConnection('tenant_units').insert({
      tenant_id: tenantId,
      location_id: value.locationId,
      start_date: value.startDate,
      end_date: value.endDate,
      monthly_rate: value.monthlyRate,
      deposit_amount: value.depositAmount,
      payment_status: 'pending',
      notes: value.notes,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    // Mark location as occupied
    await pgConnection('warehouse_locations')
      .where('id', value.locationId)
      .update({
        is_occupied: true,
        updated_at: new Date()
      });

    // Update warehouse used capacity
    await pgConnection('warehouses')
      .where('id', location.warehouse_id)
      .increment('used_capacity', 1);

    const tenantUnit = await pgConnection('tenant_units')
      .select(
        'tenant_units.*',
        'warehouse_locations.location_code',
        'warehouse_locations.aisle',
        'warehouse_locations.level',
        'warehouse_locations.position'
      )
      .join('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
      .where('tenant_units.id', tenantUnitId)
      .first();

    res.status(201).json({
      message: 'Unit assigned to tenant successfully',
      tenantUnit
    });

  } catch (error) {
    console.error('Assign unit error:', error);
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'This unit is already assigned to a tenant',
        code: 'UNIT_ALREADY_ASSIGNED'
      });
    }
    res.status(500).json({
      error: 'Failed to assign unit',
      code: 'ASSIGN_UNIT_ERROR'
    });
  }
});

// Get tenant's units
router.get('/:tenantId/units', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;

    const units = await pgConnection('tenant_units')
      .select(
        'tenant_units.*',
        'warehouse_locations.location_code',
        'warehouse_locations.aisle',
        'warehouse_locations.level',
        'warehouse_locations.position',
        'warehouse_locations.location_type',
        'warehouses.name as warehouse_name'
      )
      .join('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
      .join('warehouses', 'warehouse_locations.warehouse_id', 'warehouses.id')
      .where('tenant_units.tenant_id', tenantId)
      .where('tenant_units.is_active', true)
      .orderBy('tenant_units.created_at', 'desc');

    res.json({ units });

  } catch (error) {
    console.error('Get tenant units error:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant units',
      code: 'FETCH_TENANT_UNITS_ERROR'
    });
  }
});

// Record payment
router.post('/:tenantId/payments', authenticateToken, checkPermission('tenant.manage'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { amount, paymentDate, paymentMethod, tenantUnitId, transactionId, notes } = req.body;

    if (!amount || !paymentDate) {
      return res.status(400).json({
        error: 'Amount and payment date are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const paymentData = {
      tenant_id: tenantId,
      tenant_unit_id: tenantUnitId,
      amount: parseFloat(amount),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      notes,
      created_at: new Date()
    };

    const [paymentId] = await pgConnection('tenant_payments').insert(paymentData).returning('id');

    const payment = await pgConnection('tenant_payments')
      .where('id', paymentId)
      .first();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      error: 'Failed to record payment',
      code: 'RECORD_PAYMENT_ERROR'
    });
  }
});

// Get tenant payment history
router.get('/:tenantId/payments', authenticateToken, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const payments = await pgConnection('tenant_payments')
      .where('tenant_id', tenantId)
      .orderBy('payment_date', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await pgConnection('tenant_payments')
      .where('tenant_id', tenantId)
      .count('id as count');

    const totalPages = Math.ceil(count / limit);

    res.json({
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: parseInt(count),
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get tenant payments error:', error);
    res.status(500).json({
      error: 'Failed to fetch tenant payments',
      code: 'FETCH_TENANT_PAYMENTS_ERROR'
    });
  }
});

module.exports = router;
