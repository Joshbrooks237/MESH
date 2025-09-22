const { pgConnection } = require('../config/database');

async function createTenantTable() {
  try {
    console.log('👥 Creating tenants table...');

    // Create tenants table
    await pgConnection.schema.createTable('tenants', function(table) {
      table.increments('id').primary();
      table.string('first_name', 50).notNullable();
      table.string('last_name', 50).notNullable();
      table.string('email', 255).unique().notNullable();
      table.string('phone', 20);
      table.string('address', 255);
      table.string('city', 100);
      table.string('state', 50);
      table.string('zip_code', 20);
      table.string('driver_license', 50);
      table.date('date_of_birth');
      table.string('emergency_contact_name', 100);
      table.string('emergency_contact_phone', 20);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(pgConnection.fn.now());
      table.timestamp('updated_at').defaultTo(pgConnection.fn.now());
    });

    // Create tenant_units junction table (many-to-many relationship)
    await pgConnection.schema.createTable('tenant_units', function(table) {
      table.increments('id').primary();
      table.integer('tenant_id').unsigned().notNullable().references('id').inTable('tenants').onDelete('CASCADE');
      table.integer('location_id').unsigned().notNullable().references('id').inTable('warehouse_locations').onDelete('CASCADE');
      table.date('start_date').notNullable();
      table.date('end_date');
      table.decimal('monthly_rate', 8, 2).notNullable();
      table.decimal('deposit_amount', 8, 2).defaultTo(0);
      table.string('payment_status', 20).defaultTo('pending'); // pending, paid, overdue
      table.text('notes');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(pgConnection.fn.now());
      table.timestamp('updated_at').defaultTo(pgConnection.fn.now());
      table.unique(['tenant_id', 'location_id']); // One tenant per unit
    });

    // Create tenant_payments table
    await pgConnection.schema.createTable('tenant_payments', function(table) {
      table.increments('id').primary();
      table.integer('tenant_id').unsigned().notNullable().references('id').inTable('tenants').onDelete('CASCADE');
      table.integer('tenant_unit_id').unsigned().references('id').inTable('tenant_units').onDelete('SET NULL');
      table.decimal('amount', 8, 2).notNullable();
      table.date('payment_date').notNullable();
      table.string('payment_method', 50); // cash, check, card, bank_transfer
      table.string('transaction_id', 100);
      table.text('notes');
      table.timestamp('created_at').defaultTo(pgConnection.fn.now());
    });

    console.log('✅ Created tenants, tenant_units, and tenant_payments tables');

    // Seed some demo tenants
    console.log('👤 Creating demo tenants...');

    const demoTenants = [
      // Original tenants
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12345'
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12346'
      },
      {
        first_name: 'Mike',
        last_name: 'Wilson',
        email: 'mike.wilson@email.com',
        phone: '555-0103',
        address: '789 Pine St',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12347'
      },
      {
        first_name: 'Lisa',
        last_name: 'Brown',
        email: 'lisa.brown@email.com',
        phone: '555-0104',
        address: '321 Elm Dr',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12348'
      },
      {
        first_name: 'David',
        last_name: 'Davis',
        email: 'david.davis@email.com',
        phone: '555-0105',
        address: '654 Maple Ln',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12349'
      },
      // Additional diverse tenants
      {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@outlook.com',
        phone: '555-0106',
        address: '987 Cedar St',
        city: 'Springfield',
        state: 'IL',
        zip_code: '62701'
      },
      {
        first_name: 'Robert',
        last_name: 'Chen',
        email: 'r.chen@gmail.com',
        phone: '555-0107',
        address: '456 Birch Ave',
        city: 'Seattle',
        state: 'WA',
        zip_code: '98101'
      },
      {
        first_name: 'Jennifer',
        last_name: 'Williams',
        email: 'jennifer.w@company.com',
        phone: '555-0108',
        address: '789 Willow Dr',
        city: 'Denver',
        state: 'CO',
        zip_code: '80202'
      },
      {
        first_name: 'James',
        last_name: 'Anderson',
        email: 'james.anderson@business.net',
        phone: '555-0109',
        address: '321 Spruce Ln',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701'
      },
      {
        first_name: 'Emily',
        last_name: 'Martinez',
        email: 'emily.martinez@email.org',
        phone: '555-0110',
        address: '654 Pine Rd',
        city: 'Phoenix',
        state: 'AZ',
        zip_code: '85001'
      },
      {
        first_name: 'Christopher',
        last_name: 'Taylor',
        email: 'chris.taylor@service.com',
        phone: '555-0111',
        address: '987 Elm St',
        city: 'Portland',
        state: 'OR',
        zip_code: '97201'
      },
      {
        first_name: 'Amanda',
        last_name: 'Thompson',
        email: 'amanda.thompson@home.org',
        phone: '555-0112',
        address: '147 Oak Ave',
        city: 'Nashville',
        state: 'TN',
        zip_code: '37201'
      },
      {
        first_name: 'Daniel',
        last_name: 'Rodriguez',
        email: 'daniel.rodriguez@storage.biz',
        phone: '555-0113',
        address: '258 Maple Dr',
        city: 'Las Vegas',
        state: 'NV',
        zip_code: '89101'
      },
      {
        first_name: 'Jessica',
        last_name: 'Lee',
        email: 'jessica.lee@personal.net',
        phone: '555-0114',
        address: '369 Birch Ln',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101'
      },
      {
        first_name: 'Michael',
        last_name: 'White',
        email: 'michael.white@enterprise.com',
        phone: '555-0115',
        address: '741 Cedar Rd',
        city: 'Boston',
        state: 'MA',
        zip_code: '02101'
      },
      {
        first_name: 'Ashley',
        last_name: 'Harris',
        email: 'ashley.harris@domain.org',
        phone: '555-0116',
        address: '852 Willow St',
        city: 'Atlanta',
        state: 'GA',
        zip_code: '30301'
      },
      {
        first_name: 'Kevin',
        last_name: 'Clark',
        email: 'kevin.clark@company.biz',
        phone: '555-0117',
        address: '963 Pine Ave',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601'
      },
      {
        first_name: 'Rachel',
        last_name: 'Lewis',
        email: 'rachel.lewis@email.net',
        phone: '555-0118',
        address: '159 Spruce Dr',
        city: 'Salt Lake City',
        state: 'UT',
        zip_code: '84101'
      },
      {
        first_name: 'Brian',
        last_name: 'Walker',
        email: 'brian.walker@service.org',
        phone: '555-0119',
        address: '357 Oak Ln',
        city: 'San Diego',
        state: 'CA',
        zip_code: '92101'
      },
      {
        first_name: 'Stephanie',
        last_name: 'Hall',
        email: 'stephanie.hall@home.biz',
        phone: '555-0120',
        address: '468 Elm Rd',
        city: 'New Orleans',
        state: 'LA',
        zip_code: '70112'
      }
    ];

    for (const tenant of demoTenants) {
      const [tenantId] = await pgConnection('tenants').insert({
        ...tenant,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');

      console.log(`✅ Created tenant: ${tenant.first_name} ${tenant.last_name} (ID: ${tenantId})`);
    }

    console.log('🎉 Tenant system setup complete!');

  } catch (error) {
    console.error('❌ Error creating tenant tables:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
if (require.main === module) {
  createTenantTable();
}

module.exports = { createTenantTable };
