exports.up = function(knex) {
  return knex.schema
    .alterTable('tenant_units', function(table) {
      // Add billing cycle tracking
      table.integer('billing_day_of_month').defaultTo(null); // Day of month when billing occurs (1-31)
      table.date('next_billing_date').defaultTo(null); // Next scheduled billing date
      table.date('last_billing_date').defaultTo(null); // Last billing date
      table.integer('grace_period_days').defaultTo(10); // Days after due date before overlock
      table.boolean('auto_overlock_enabled').defaultTo(true); // Whether to auto-create overlock tasks
      table.timestamp('last_overlock_check').defaultTo(null); // When overlock status was last checked
    })

    // Create a table for billing cycles
    .createTable('billing_cycles', function(table) {
      table.increments('id').primary();
      table.integer('tenant_unit_id').unsigned().notNullable().references('id').inTable('tenant_units').onDelete('CASCADE');
      table.date('billing_date').notNullable(); // When payment was/is due
      table.decimal('amount_due', 8, 2).notNullable();
      table.decimal('amount_paid', 8, 2).defaultTo(0);
      table.enu('status', ['pending', 'paid', 'overdue', 'overlocked']).defaultTo('pending');
      table.date('paid_date');
      table.date('overlock_applied_date');
      table.integer('overlock_task_id').unsigned().references('id').inTable('tasks').onDelete('SET NULL');
      table.text('notes');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      // Indexes
      table.index(['tenant_unit_id', 'billing_date']);
      table.index(['status', 'billing_date']);
      table.unique(['tenant_unit_id', 'billing_date']); // One billing cycle per unit per month
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('billing_cycles')
    .alterTable('tenant_units', function(table) {
      table.dropColumn('billing_day_of_month');
      table.dropColumn('next_billing_date');
      table.dropColumn('last_billing_date');
      table.dropColumn('grace_period_days');
      table.dropColumn('auto_overlock_enabled');
      table.dropColumn('last_overlock_check');
    });
};
