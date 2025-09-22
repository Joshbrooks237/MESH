const { pgConnection } = require('../config/database');

async function seedDemoTasks() {
  try {
    console.log('📝 Seeding demo tasks...');

    // Get the admin user ID (assuming user with ID 1)
    const adminUser = await pgConnection('users').where('username', 'admin').first();
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeding first.');
      return;
    }

    const userId = adminUser.id;

    const demoTasks = [
      // Overlock related tasks
      {
        user_id: userId,
        created_by: userId,
        title: 'Install overlocks on Unit A-101',
        description: 'Install security overlocks on all doors and windows for tenant moving in next week.',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Remove overlocks from Unit B-203',
        description: 'Remove overlocks from previous tenant. Unit is being prepared for new tenant.',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Inspect overlocks on all ground floor units',
        description: 'Monthly inspection of overlock systems on ground floor units for security compliance.',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        created_at: new Date(),
        updated_at: new Date()
      },

      // Property maintenance tasks
      {
        user_id: userId,
        created_by: userId,
        title: 'Property check - Building A',
        description: 'Complete property inspection checklist for Building A including electrical, plumbing, and structural elements.',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Fix leaky faucet in Unit C-105',
        description: 'Repair dripping faucet in kitchen. Tenant reported issue yesterday.',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Replace burned out light bulbs in hallway',
        description: 'Replace fluorescent bulbs in main hallway. Multiple bulbs are out.',
        priority: 'low',
        status: 'completed',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
        is_completed: true,
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
      },

      // Communication tasks
      {
        user_id: userId,
        created_by: userId,
        title: 'Send welcome message to new tenants',
        description: 'Send welcome email and facility information to all tenants who moved in this month.',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Follow up on maintenance request from Unit D-302',
        description: 'Tenant called about heating issue. Need to schedule repair and update tenant.',
        priority: 'high',
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0], // Today
        created_at: new Date(),
        updated_at: new Date()
      },

      // Administrative tasks
      {
        user_id: userId,
        created_by: userId,
        title: 'Update tenant database with new contact info',
        description: 'Several tenants have updated their phone numbers and email addresses.',
        priority: 'medium',
        status: 'pending',
        due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Prepare monthly occupancy report',
        description: 'Compile and send monthly report to management with occupancy rates and revenue.',
        priority: 'medium',
        status: 'in_progress',
        due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days from now
        created_at: new Date(),
        updated_at: new Date()
      },

      // Security and safety tasks
      {
        user_id: userId,
        created_by: userId,
        title: 'Test emergency alarm system',
        description: 'Monthly test of all emergency alarms and notification systems throughout facility.',
        priority: 'urgent',
        status: 'pending',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Clean and restock first aid kits',
        description: 'Check expiration dates and restock supplies in all facility first aid kits.',
        priority: 'low',
        status: 'pending',
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
        created_at: new Date(),
        updated_at: new Date()
      },

      // Completed tasks examples
      {
        user_id: userId,
        created_by: userId,
        title: 'Process rental payment for Unit A-201',
        description: 'Monthly rental payment received and processed successfully.',
        priority: 'medium',
        status: 'completed',
        is_completed: true,
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user_id: userId,
        created_by: userId,
        title: 'Schedule pest control inspection',
        description: 'Quarterly pest control inspection scheduled and completed.',
        priority: 'medium',
        status: 'completed',
        is_completed: true,
        completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const task of demoTasks) {
      // Check if task already exists (by title to avoid duplicates)
      const existingTask = await pgConnection('tasks')
        .where('title', task.title)
        .andWhere('created_by', userId)
        .first();

      if (existingTask) {
        console.log(`⏭️  Task "${task.title}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      await pgConnection('tasks').insert(task);
      console.log(`✅ Created task: ${task.title}`);
      createdCount++;
    }

    console.log(`🎉 Demo tasks seeding complete!`);
    console.log(`   📊 Created: ${createdCount} tasks`);
    console.log(`   ⏭️  Skipped: ${skippedCount} duplicate tasks`);
    console.log(`   📈 Total tasks in system: ${createdCount + skippedCount}`);

  } catch (error) {
    console.error('❌ Error seeding demo tasks:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
if (require.main === module) {
  seedDemoTasks();
}

module.exports = { seedDemoTasks };
