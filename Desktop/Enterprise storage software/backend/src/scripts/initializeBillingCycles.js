const { pgConnection } = require('../config/database');

async function initializeBillingCycles() {
  try {
    console.log('💰 Initializing billing cycles for existing tenant units...');

    // Get all active tenant units
    const tenantUnits = await pgConnection('tenant_units')
      .where('is_active', true)
      .select(
        'id',
        'tenant_id',
        'start_date',
        'monthly_rate',
        'billing_day_of_month',
        'next_billing_date'
      );

    console.log(`📊 Found ${tenantUnits.length} active tenant units`);

    let initializedCount = 0;
    let skippedCount = 0;

    for (const unit of tenantUnits) {
      // Set billing day of month to the start date's day if not already set
      const billingDay = unit.billing_day_of_month || new Date(unit.start_date).getDate();

      // Update tenant unit with billing information
      await pgConnection('tenant_units')
        .where('id', unit.id)
        .update({
          billing_day_of_month: billingDay,
          updated_at: new Date()
        });

      // Calculate next billing date
      const nextBillingDate = calculateNextBillingDate(unit.start_date, billingDay);

      // Check if billing cycles already exist for this unit
      const existingCycles = await pgConnection('billing_cycles')
        .where('tenant_unit_id', unit.id)
        .count('id as count')
        .first();

      if (existingCycles.count > 0) {
        console.log(`⏭️  Billing cycles already exist for tenant unit ${unit.id}, skipping...`);
        skippedCount++;
        continue;
      }

      // Create billing cycles for the next 12 months (past and future)
      const billingCycles = [];
      const startDate = new Date(unit.start_date);

      for (let i = -6; i <= 6; i++) { // 6 months back, current month, 6 months forward
        const cycleDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, billingDay);
        const billingDate = cycleDate.toISOString().split('T')[0];

        // Skip if this billing cycle is in the future and unit hasn't started yet
        if (cycleDate > new Date() && cycleDate > startDate) continue;

        billingCycles.push({
          tenant_unit_id: unit.id,
          billing_date: billingDate,
          amount_due: parseFloat(unit.monthly_rate),
          amount_paid: 0,
          status: cycleDate <= new Date() ? 'pending' : 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // Insert billing cycles
      if (billingCycles.length > 0) {
        await pgConnection('billing_cycles').insert(billingCycles);
        console.log(`✅ Created ${billingCycles.length} billing cycles for tenant unit ${unit.id}`);
        initializedCount++;
      }
    }

    console.log(`🎉 Billing cycle initialization complete!`);
    console.log(`   📊 Initialized: ${initializedCount} tenant units`);
    console.log(`   ⏭️  Skipped: ${skippedCount} already initialized units`);

  } catch (error) {
    console.error('❌ Error initializing billing cycles:', error);
  } finally {
    process.exit(0);
  }
}

function calculateNextBillingDate(startDate, billingDay) {
  const now = new Date();
  const start = new Date(startDate);

  // Calculate the next billing date
  let nextBilling = new Date(now.getFullYear(), now.getMonth(), billingDay);

  // If the billing day has passed this month, move to next month
  if (nextBilling <= now) {
    nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  }

  return nextBilling.toISOString().split('T')[0];
}

// Run the function
if (require.main === module) {
  initializeBillingCycles();
}

module.exports = { initializeBillingCycles };
