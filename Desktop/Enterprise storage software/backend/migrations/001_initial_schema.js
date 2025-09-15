exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username', 50).unique().notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('first_name', 50).notNullable();
      table.string('last_name', 50).notNullable();
      table.enu('role', ['super_admin', 'admin', 'manager', 'supervisor', 'operator', 'auditor', 'viewer']).defaultTo('operator');
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('SET NULL');
      table.string('phone', 20);
      table.string('department', 100);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('last_login');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Refresh tokens table
    .createTable('refresh_tokens', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('token').notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.unique(['user_id', 'token']);
    })

    // Warehouses table
    .createTable('warehouses', function(table) {
      table.increments('id').primary();
      table.string('code', 20).unique().notNullable();
      table.string('name', 100).notNullable();
      table.text('description');
      table.string('address', 255);
      table.string('city', 100);
      table.string('state', 50);
      table.string('country', 50).defaultTo('USA');
      table.string('postal_code', 20);
      table.decimal('latitude', 10, 8);
      table.decimal('longitude', 11, 8);
      table.integer('total_capacity').defaultTo(0);
      table.integer('used_capacity').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Warehouse zones (areas within warehouse)
    .createTable('warehouse_zones', function(table) {
      table.increments('id').primary();
      table.integer('warehouse_id').unsigned().notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
      table.string('code', 20).notNullable();
      table.string('name', 100).notNullable();
      table.enu('zone_type', ['storage', 'picking', 'shipping', 'receiving', 'quality_control', 'returns']).defaultTo('storage');
      table.integer('aisle_count').defaultTo(0);
      table.integer('level_count').defaultTo(1);
      table.integer('position_count').defaultTo(0);
      table.decimal('temperature_min', 5, 2);
      table.decimal('temperature_max', 5, 2);
      table.boolean('requires_authorization').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['warehouse_id', 'code']);
    })

    // Warehouse locations (specific positions)
    .createTable('warehouse_locations', function(table) {
      table.increments('id').primary();
      table.integer('warehouse_id').unsigned().notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
      table.integer('zone_id').unsigned().notNullable().references('id').inTable('warehouse_zones').onDelete('CASCADE');
      table.string('location_code', 30).notNullable();
      table.integer('aisle').notNullable();
      table.integer('level').notNullable();
      table.integer('position').notNullable();
      table.enu('location_type', ['bin', 'shelf', 'pallet', 'floor']).defaultTo('bin');
      table.integer('max_weight_kg').defaultTo(100);
      table.integer('max_height_cm').defaultTo(200);
      table.decimal('width_cm', 8, 2);
      table.decimal('depth_cm', 8, 2);
      table.boolean('is_occupied').defaultTo(false);
      table.boolean('is_blocked').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['warehouse_id', 'location_code']);
      table.index(['zone_id', 'is_occupied']);
    })

    // Product categories
    .createTable('product_categories', function(table) {
      table.increments('id').primary();
      table.string('code', 20).unique().notNullable();
      table.string('name', 100).notNullable();
      table.text('description');
      table.integer('parent_id').unsigned().references('id').inTable('product_categories').onDelete('SET NULL');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Products
    .createTable('products', function(table) {
      table.increments('id').primary();
      table.string('sku', 50).unique().notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.integer('category_id').unsigned().references('id').inTable('product_categories').onDelete('SET NULL');
      table.string('barcode', 100).unique();
      table.string('rfid_tag', 100).unique();
      table.decimal('weight_kg', 10, 3);
      table.decimal('length_cm', 8, 2);
      table.decimal('width_cm', 8, 2);
      table.decimal('height_cm', 8, 2);
      table.enu('unit_of_measure', ['each', 'kg', 'liter', 'meter', 'box', 'pallet']).defaultTo('each');
      table.integer('min_stock_level').defaultTo(0);
      table.integer('max_stock_level');
      table.decimal('unit_cost', 12, 2);
      table.decimal('selling_price', 12, 2);
      table.enu('storage_requirements', ['standard', 'refrigerated', 'frozen', 'hazardous', 'fragile', 'secure']).defaultTo('standard');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.index(['category_id', 'is_active']);
    })

    // Inventory items (physical stock)
    .createTable('inventory_items', function(table) {
      table.increments('id').primary();
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('warehouse_id').unsigned().notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
      table.integer('location_id').unsigned().references('id').inTable('warehouse_locations').onDelete('SET NULL');
      table.string('batch_number', 50);
      table.string('serial_number', 100);
      table.date('manufacture_date');
      table.date('expiry_date');
      table.integer('quantity').notNullable().defaultTo(0);
      table.integer('reserved_quantity').defaultTo(0);
      table.enu('condition', ['new', 'good', 'damaged', 'expired']).defaultTo('new');
      table.decimal('cost_price', 12, 2);
      table.timestamp('received_at');
      table.timestamp('last_counted_at');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.unique(['product_id', 'batch_number', 'serial_number']);
      table.index(['warehouse_id', 'location_id']);
      table.index(['expiry_date']);
    })

    // Inventory transactions
    .createTable('inventory_transactions', function(table) {
      table.increments('id').primary();
      table.integer('inventory_item_id').unsigned().notNullable().references('id').inTable('inventory_items').onDelete('CASCADE');
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.enu('transaction_type', [
        'receive', 'pick', 'putaway', 'transfer', 'adjustment', 'count',
        'damage', 'expiry', 'return', 'sale', 'scrap'
      ]).notNullable();
      table.integer('quantity_change').notNullable();
      table.integer('quantity_before').notNullable();
      table.integer('quantity_after').notNullable();
      table.integer('from_location_id').unsigned().references('id').inTable('warehouse_locations');
      table.integer('to_location_id').unsigned().references('id').inTable('warehouse_locations');
      table.text('notes');
      table.string('reference_number', 50); // PO number, SO number, etc.
      table.timestamp('transaction_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['inventory_item_id', 'transaction_at']);
      table.index(['user_id', 'transaction_at']);
    })

    // Scan events (for barcode/RFID tracking)
    .createTable('scan_events', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').onDelete('SET NULL');
      table.integer('location_id').unsigned().references('id').inTable('warehouse_locations').onDelete('SET NULL');
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('SET NULL');
      table.enu('scan_type', ['barcode', 'rfid']).notNullable();
      table.string('identifier', 100).notNullable(); // barcode or RFID tag
      table.enu('action', ['scan', 'pick', 'putaway', 'count', 'verify']).defaultTo('scan');
      table.timestamp('scanned_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['user_id', 'scanned_at']);
      table.index(['product_id', 'scanned_at']);
      table.index(['warehouse_id', 'scanned_at']);
    })

    // RFID events (detailed RFID tracking)
    .createTable('rfid_events', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
      table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').onDelete('SET NULL');
      table.integer('location_id').unsigned().references('id').inTable('warehouse_locations').onDelete('SET NULL');
      table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('SET NULL');
      table.string('reader_id', 50).notNullable();
      table.string('rfid_tag', 100).notNullable();
      table.decimal('signal_strength', 5, 2);
      table.timestamp('scanned_at').defaultTo(knex.fn.now());
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['user_id', 'scanned_at']);
      table.index(['product_id', 'scanned_at']);
      table.index(['reader_id', 'scanned_at']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('rfid_events')
    .dropTableIfExists('scan_events')
    .dropTableIfExists('inventory_transactions')
    .dropTableIfExists('inventory_items')
    .dropTableIfExists('products')
    .dropTableIfExists('product_categories')
    .dropTableIfExists('warehouse_locations')
    .dropTableIfExists('warehouse_zones')
    .dropTableIfExists('warehouses')
    .dropTableIfExists('refresh_tokens')
    .dropTableIfExists('users');
};
