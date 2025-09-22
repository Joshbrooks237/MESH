const { pgConnection } = require('../config/database');

async function checkOverduePayments() {
  try {
    console.log('🔍 Checking for overdue tenant payments...');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Find billing cycles that are overdue (past grace period)
    const overdueCycles = await pgConnection('billing_cycles')
      .select(
        'billing_cycles.*',
        'tenant_units.tenant_id',
        'tenant_units.grace_period_days',
        'tenant_units.auto_overlock_enabled',
        'tenants.first_name',
        'tenants.last_name',
        'tenants.email',
        'warehouse_locations.location_code'
      )
      .join('tenant_units', 'billing_cycles.tenant_unit_id', 'tenant_units.id')
      .join('tenants', 'tenant_units.tenant_id', 'tenants.id')
      .join('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
      .where('billing_cycles.status', 'pending')
      .where('tenant_units.is_active', true)
      .where('tenant_units.auto_overlock_enabled', true)
      .whereRaw("billing_cycles.billing_date + INTERVAL '1 day' * tenant_units.grace_period_days < CURRENT_DATE")
      .orderBy('billing_cycles.billing_date', 'asc');

    console.log(`📊 Found ${overdueCycles.length} overdue billing cycles`);

    let overlockTasksCreated = 0;
    let skippedCount = 0;

    for (const cycle of overdueCycles) {
      // Check if an overlock task already exists for this billing cycle
      if (cycle.overlock_task_id) {
        console.log(`⏭️  Overlock task already exists for billing cycle ${cycle.id}, skipping...`);
        skippedCount++;
        continue;
      }

      // Calculate how many days overdue
      const billingDate = new Date(cycle.billing_date);
      const daysOverdue = Math.floor((today - billingDate) / (1000 * 60 * 60 * 24));

      // Create overlock task
      const taskData = {
        user_id: 1, // System admin user
        created_by: 1,
        title: `Apply overlock - ${cycle.first_name} ${cycle.last_name} - Unit ${cycle.location_code}`,
        description: `Tenant payment is ${daysOverdue} days overdue. Billing cycle due: ${cycle.billing_date}. Amount due: $${cycle.amount_due}. Please apply security overlocks to Unit ${cycle.location_code}.`,
        priority: 'urgent',
        status: 'pending',
        due_date: todayStr, // Due immediately
        created_at: new Date(),
        updated_at: new Date()
      };

      const taskResult = await pgConnection('tasks').insert(taskData).returning('id');
      const taskId = taskResult[0].id;

      // Update billing cycle status and link to task
      await pgConnection('billing_cycles')
        .where('id', cycle.id)
        .update({
          status: 'overlocked',
          overlock_applied_date: todayStr,
          overlock_task_id: taskId,
          updated_at: new Date()
        });

      console.log(`🔒 Created overlock task #${taskId} for ${cycle.first_name} ${cycle.last_name} (Unit ${cycle.location_code}) - ${daysOverdue} days overdue`);
      overlockTasksCreated++;
    }

    // Update last_overlock_check timestamp for all active tenant units
    await pgConnection('tenant_units')
      .where('is_active', true)
      .update({
        last_overlock_check: new Date(),
        updated_at: new Date()
      });

    console.log(`🎉 Overdue payment check complete!`);
    console.log(`   🔒 Overlock tasks created: ${overlockTasksCreated}`);
    console.log(`   ⏭️  Skipped (already processed): ${skippedCount}`);
    console.log(`   📅 Next check recommended: daily or as scheduled`);

  } catch (error) {
    console.error('❌ Error checking overdue payments:', error);
  } finally {
    process.exit(0);
  }
}

// Function to mark a billing cycle as paid when payment is received
async function markBillingCyclePaid(billingCycleId, paymentAmount, paymentDate = null) {
  try {
    const paidDate = paymentDate || new Date().toISOString().split('T')[0];

    // Get the billing cycle
    const cycle = await pgConnection('billing_cycles')
      .where('id', billingCycleId)
      .first();

    if (!cycle) {
      throw new Error(`Billing cycle ${billingCycleId} not found`);
    }

    // Calculate new amount paid
    const newAmountPaid = parseFloat(cycle.amount_paid) + parseFloat(paymentAmount);
    const isFullyPaid = newAmountPaid >= parseFloat(cycle.amount_due);

    // Update billing cycle
    await pgConnection('billing_cycles')
      .where('id', billingCycleId)
      .update({
        amount_paid: newAmountPaid,
        status: isFullyPaid ? 'paid' : 'pending',
        paid_date: isFullyPaid ? paidDate : null,
        updated_at: new Date()
      });

    console.log(`💰 Updated billing cycle ${billingCycleId}: $${newAmountPaid}/${cycle.amount_due} paid`);

    // If there was an overlock task and payment is now complete, we might want to create a "remove overlock" task
    if (isFullyPaid && cycle.overlock_task_id) {
      // Get tenant and unit info
      const unitInfo = await pgConnection('billing_cycles')
        .select(
          'tenants.first_name',
          'tenants.last_name',
          'warehouse_locations.location_code'
        )
        .join('tenant_units', 'billing_cycles.tenant_unit_id', 'tenant_units.id')
        .join('tenants', 'tenant_units.tenant_id', 'tenants.id')
        .join('warehouse_locations', 'tenant_units.location_id', 'warehouse_locations.id')
        .where('billing_cycles.id', billingCycleId)
        .first();

      if (unitInfo) {
        // Create "remove overlock" task
        const removeTaskData = {
          user_id: 1,
          created_by: 1,
          title: `Remove overlock - ${unitInfo.first_name} ${unitInfo.last_name} - Unit ${unitInfo.location_code}`,
          description: `Payment received and billing cycle completed. Please remove security overlocks from Unit ${unitInfo.location_code}.`,
          priority: 'high',
          status: 'pending',
          due_date: paidDate,
          created_at: new Date(),
          updated_at: new Date()
        };

        const taskResult = await pgConnection('tasks').insert(removeTaskData).returning('id');
        const taskId = taskResult[0].id;
        console.log(`🔓 Created overlock removal task #${taskId} for Unit ${unitInfo.location_code}`);
      }
    }

    return { success: true, isFullyPaid };

  } catch (error) {
    console.error('❌ Error marking billing cycle as paid:', error);
    throw error;
  }
}

// Run the function
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'mark-paid') {
    const billingCycleId = process.argv[3];
    const paymentAmount = process.argv[4];
    const paymentDate = process.argv[5];

    if (!billingCycleId || !paymentAmount) {
      console.error('Usage: node checkOverduePayments.js mark-paid <billingCycleId> <paymentAmount> [paymentDate]');
      process.exit(1);
    }

    markBillingCyclePaid(billingCycleId, paymentAmount, paymentDate)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    checkOverduePayments();
  }
}

module.exports = { checkOverduePayments, markBillingCyclePaid };
