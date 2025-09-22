const { pgConnection } = require('../config/database');

async function seedDemoTenants() {
  try {
    console.log('👥 Seeding demo tenants...');

    const demoTenants = [
      // Traditional Western names
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

      // Hispanic/Latino names
      {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '555-0106',
        address: '789 Cypress Rd',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12350'
      },
      {
        first_name: 'Carlos',
        last_name: 'Rodriguez',
        email: 'carlos.rodriguez@email.com',
        phone: '555-0107',
        address: '321 Magnolia Ave',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12351'
      },

      // Asian names
      {
        first_name: 'Wei',
        last_name: 'Zhang',
        email: 'wei.zhang@email.com',
        phone: '555-0108',
        address: '654 Bamboo Ln',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12352'
      },
      {
        first_name: 'Priya',
        last_name: 'Patel',
        email: 'priya.patel@email.com',
        phone: '555-0109',
        address: '987 Spice Rd',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12353'
      },

      // Middle Eastern names
      {
        first_name: 'Ahmed',
        last_name: 'Al-Rashid',
        email: 'ahmed.al-rashid@email.com',
        phone: '555-0110',
        address: '147 Desert Palm St',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12354'
      },
      {
        first_name: 'Fatima',
        last_name: 'Hassan',
        email: 'fatima.hassan@email.com',
        phone: '555-0111',
        address: '258 Oasis Dr',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12355'
      },

      // African/African-American names
      {
        first_name: 'Kofi',
        last_name: 'Mensah',
        email: 'kofi.mensah@email.com',
        phone: '555-0112',
        address: '369 Savannah Ave',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12356'
      },
      {
        first_name: 'Nia',
        last_name: 'Thompson',
        email: 'nia.thompson@email.com',
        phone: '555-0113',
        address: '741 Harmony St',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12357'
      },

      // European names (non-English)
      {
        first_name: 'Sophie',
        last_name: 'Dubois',
        email: 'sophie.dubois@email.com',
        phone: '555-0114',
        address: '852 Eiffel Blvd',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12358'
      },
      {
        first_name: 'Luca',
        last_name: 'Rossi',
        email: 'luca.rossi@email.com',
        phone: '555-0115',
        address: '963 Venice Ln',
        city: 'Anytown',
        state: 'TX',
        zip_code: '12359'
      },

      // More traditional American names
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
      }
    ];

    for (const tenant of demoTenants) {
      // Check if tenant already exists
      const existingTenant = await pgConnection('tenants')
        .where('email', tenant.email)
        .first();

      if (existingTenant) {
        console.log(`⏭️  Tenant ${tenant.first_name} ${tenant.last_name} already exists, skipping...`);
        continue;
      }

      const [tenantId] = await pgConnection('tenants').insert({
        ...tenant,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');

      console.log(`✅ Created tenant: ${tenant.first_name} ${tenant.last_name} (ID: ${tenantId})`);
    }

    console.log('🎉 Demo tenants seeding complete!');

  } catch (error) {
    console.error('❌ Error seeding demo tenants:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
if (require.main === module) {
  seedDemoTenants();
}

module.exports = { seedDemoTenants };



