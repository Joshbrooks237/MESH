const { pgConnection } = require('../config/database');

async function assignTenantsToUnits() {
  try {
    console.log('🏠 Assigning tenants to storage units...');

    // Get all tenants
    const tenants = await pgConnection('tenants')
      .select('id', 'first_name', 'last_name')
      .where('is_active', true);

    console.log(`Found ${tenants.length} active tenants`);

    // Get all available units (not occupied)
    const availableUnits = await pgConnection('warehouse_locations')
      .select('id', 'location_code', 'aisle', 'level', 'position')
      .where('is_active', true)
      .where('is_occupied', false)
      .orderBy(['aisle', 'level', 'position']);

    console.log(`Found ${availableUnits.length} available units`);

    // Assign tenants to units (assign about 60% of units to tenants)
    const unitsToAssign = Math.floor(availableUnits.length * 0.6);
    const assignedUnits = [];

    for (let i = 0; i < unitsToAssign && i < tenants.length; i++) {
      const tenant = tenants[i];
      const unit = availableUnits[i];

      // Calculate monthly rate based on unit characteristics
      let monthlyRate = 50.00; // Base rate
      if (unit.aisle <= 3) monthlyRate += 10; // Premium location
      if (unit.level === 1) monthlyRate += 5; // Ground level premium

      // Random start date within the last 6 months
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 180));

      const tenantUnitData = {
        tenant_id: tenant.id,
        location_id: unit.id,
        start_date: startDate.toISOString().split('T')[0],
        monthly_rate: monthlyRate,
        deposit_amount: monthlyRate, // Deposit equals one month's rent
        payment_status: Math.random() > 0.8 ? 'overdue' : 'paid', // 20% chance of being overdue
        notes: `Assigned to ${tenant.first_name} ${tenant.last_name}`,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [tenantUnitId] = await pgConnection('tenant_units').insert(tenantUnitData).returning('id');

      // Mark unit as occupied
      await pgConnection('warehouse_locations')
        .where('id', unit.id)
        .update({
          is_occupied: true,
          updated_at: new Date()
        });

      // Update warehouse capacity
      await pgConnection('warehouses')
        .where('id', 1) // Assuming warehouse ID 1
        .increment('used_capacity', 1);

      assignedUnits.push({
        tenant: `${tenant.first_name} ${tenant.last_name}`,
        unit: unit.location_code,
        monthlyRate: monthlyRate,
        startDate: startDate.toISOString().split('T')[0]
      });

      console.log(`✅ Assigned ${tenant.first_name} ${tenant.last_name} to unit ${unit.location_code}`);
    }

    // Create some payment history for assigned tenants
    console.log('💰 Creating payment history...');
    for (const assignment of assignedUnits.slice(0, 10)) { // Create payments for first 10 tenants
      const tenant = tenants.find(t => `${t.first_name} ${t.last_name}` === assignment.tenant);
      if (!tenant) continue;

      const tenantUnit = await pgConnection('tenant_units')
        .where('tenant_id', tenant.id)
        .first();

      if (!tenantUnit) continue;

      // Create 3-6 months of payment history
      const paymentsToCreate = Math.floor(Math.random() * 4) + 3;
      for (let i = paymentsToCreate; i >= 1; i--) {
        const paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() - i);

        const paymentData = {
          tenant_id: tenant.id,
          tenant_unit_id: tenantUnit.id,
          amount: assignment.monthlyRate,
          payment_date: paymentDate.toISOString().split('T')[0],
          payment_method: ['cash', 'check', 'card', 'bank_transfer'][Math.floor(Math.random() * 4)],
          notes: `Monthly rent for ${paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          created_at: paymentDate
        };

        await pgConnection('tenant_payments').insert(paymentData);
      }

      console.log(`✅ Created payment history for ${assignment.tenant}`);
    }

    console.log('\n📊 Assignment Summary:');
    console.log(`   - Total tenants: ${tenants.length}`);
    console.log(`   - Assigned to units: ${assignedUnits.length}`);
    console.log(`   - Units still available: ${availableUnits.length - assignedUnits.length}`);
    console.log(`   - Occupancy rate: ${((assignedUnits.length / availableUnits.length) * 100).toFixed(1)}%`);

    console.log('\n🎉 Tenant assignment complete!');

  } catch (error) {
    console.error('❌ Error assigning tenants to units:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
if (require.main === module) {
  assignTenantsToUnits();
}

module.exports = { assignTenantsToUnits };
