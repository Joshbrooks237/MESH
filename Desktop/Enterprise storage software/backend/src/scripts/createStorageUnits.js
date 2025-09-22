const { pgConnection } = require('../config/database');

async function createStorageUnits() {
  try {
    console.log('🏗️ Creating 732 storage units...');

    // Get the warehouse ID
    const warehouse = await pgConnection('warehouses')
      .where('code', 'MAIN')
      .first();

    if (!warehouse) {
      console.error('❌ Warehouse MAIN not found');
      return;
    }

    console.log(`Found warehouse: ${warehouse.name} (ID: ${warehouse.id})`);

    // Check if units already exist
    const existingUnits = await pgConnection('warehouse_locations')
      .where('warehouse_id', warehouse.id)
      .count('id as count')
      .first();

    if (existingUnits.count > 0) {
      console.log(`⏭️  ${existingUnits.count} units already exist, skipping...`);
      return;
    }

    // Get or create storage zone
    let zone = await pgConnection('warehouse_zones')
      .where('warehouse_id', warehouse.id)
      .where('code', 'STORAGE')
      .first();

    let zoneId;
    if (zone) {
      zoneId = zone.id;
      console.log(`⏭️  Storage zone already exists with ID: ${zoneId}`);
    } else {
      const zoneResult = await pgConnection('warehouse_zones').insert({
        warehouse_id: warehouse.id,
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

      zoneId = zoneResult[0].id;
      console.log(`✅ Created storage zone with ID: ${zoneId}`);
    }

    // Create 732 storage locations
    const locations = [];
    const batchSize = 100;

    // Layout: 12 aisles, 1 level, 61 positions per aisle = 732 units
    for (let aisle = 1; aisle <= 12; aisle++) {
      for (let position = 1; position <= 61; position++) {
        const locationCode = `${aisle.toString().padStart(2, '0')}-01-${position.toString().padStart(3, '0')}`;

        locations.push({
          warehouse_id: warehouse.id,
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
          console.log(`✅ Created ${locations.length} units...`);
          locations.length = 0; // Clear array
        }
      }
    }

    // Insert remaining locations
    if (locations.length > 0) {
      await pgConnection('warehouse_locations').insert(locations);
      console.log(`✅ Created ${locations.length} units...`);
    }

    console.log('🎉 Storage units creation complete!');
    console.log(`📊 Created 732 units in warehouse: ${warehouse.name}`);

  } catch (error) {
    console.error('❌ Error creating storage units:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
if (require.main === module) {
  createStorageUnits();
}

module.exports = { createStorageUnits };
