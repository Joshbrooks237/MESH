const { pgConnection } = require('../config/database');

async function seedStorageFacility() {
  try {
    console.log('🏢 Setting up Storage Facility with 732 units...');

    // Create the main warehouse
    console.log('Creating warehouse...');
    const warehouseResult = await pgConnection('warehouses').insert({
      code: 'MAIN',
      name: 'Main Storage Facility',
      description: 'Primary storage facility with 732 units downstairs',
      address: '123 Storage Lane',
      city: 'Storage City',
      state: 'TX',
      country: 'USA',
      postal_code: '12345',
      total_capacity: 732,
      used_capacity: 0,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    const warehouseId = warehouseResult[0].id;
    console.log(`✅ Created warehouse with ID: ${warehouseId}`);

    // Create storage zone
    console.log('Creating storage zone...');
    const zoneResult = await pgConnection('warehouse_zones').insert({
      warehouse_id: warehouseId,
      code: 'STORAGE',
      name: 'Main Storage Area',
      zone_type: 'storage',
      aisle_count: 12,
      level_count: 1,
      position_count: 61,
      requires_authorization: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }).returning('id');

    const zoneId = zoneResult[0].id;
    console.log(`✅ Created storage zone with ID: ${zoneId}`);

    // Create 732 storage locations
    console.log('Creating 732 storage units...');

    const locations = [];
    const batchSize = 100;
    let totalCreated = 0;

    // Layout: 12 aisles, 1 level, 61 positions per aisle = 732 units
    for (let aisle = 1; aisle <= 12; aisle++) {
      for (let position = 1; position <= 61; position++) {
        const locationCode = `${aisle.toString().padStart(2, '0')}-01-${position.toString().padStart(3, '0')}`;

        locations.push({
          warehouse_id: warehouseId,
          zone_id: zoneId,
          location_code: locationCode,
          aisle: aisle,
          level: 1,
          position: position,
          location_type: 'bin',
          max_weight_kg: 500,
          max_height_cm: 300,
          is_occupied: false,
          is_blocked: false,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });

        // Insert in batches to avoid memory issues
        if (locations.length >= batchSize) {
          await pgConnection('warehouse_locations').insert(locations);
          totalCreated += locations.length;
          console.log(`✅ Created ${totalCreated} units...`);
          locations.length = 0; // Clear array
        }
      }
    }

    // Insert remaining locations
    if (locations.length > 0) {
      await pgConnection('warehouse_locations').insert(locations);
      totalCreated += locations.length;
    }

    console.log(`✅ Created ${totalCreated} storage units`);

    // Update warehouse capacity
    await pgConnection('warehouses')
      .where('id', warehouseId)
      .update({
        total_capacity: totalCreated,
        updated_at: new Date()
      });

    console.log('🏢 Storage facility setup complete!');
    console.log(`📊 Facility Details:`);
    console.log(`   - Warehouse: Main Storage Facility`);
    console.log(`   - Total Units: ${totalCreated}`);
    console.log(`   - Layout: 12 aisles × 1 level × 61 positions`);
    console.log(`   - Zone: Main Storage Area`);

  } catch (error) {
    console.error('❌ Error setting up storage facility:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedStorageFacility();
}

module.exports = { seedStorageFacility };
