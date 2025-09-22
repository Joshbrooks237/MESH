exports.up = function(knex) {
  return knex.schema
    .createTable('tasks', function(table) {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('title', 255).notNullable();
      table.text('description');
      table.date('due_date');
      table.enu('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
      table.enu('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
      table.boolean('is_completed').defaultTo(false);
      table.timestamp('completed_at');
      table.integer('created_by').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('assigned_to').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      // Indexes for performance
      table.index(['user_id', 'status']);
      table.index(['assigned_to', 'status']);
      table.index(['due_date']);
      table.index(['is_completed']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('tasks');
};
