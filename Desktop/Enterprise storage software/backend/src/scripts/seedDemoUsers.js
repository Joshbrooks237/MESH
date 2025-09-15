const bcrypt = require('bcryptjs');
const { pgConnection } = require('../config/database');
const { ROLES } = require('../middleware/auth');

async function seedDemoUsers() {
  try {
    console.log('🌱 Seeding demo users...');

    // Demo users data
    const demoUsers = [
      {
        username: 'admin',
        email: 'admin@enterprise-storage.com',
        password: 'password123',
        firstName: 'System',
        lastName: 'Administrator',
        role: ROLES.SUPER_ADMIN,
        department: 'IT Administration'
      },
      {
        username: 'manager',
        email: 'manager@enterprise-storage.com',
        password: 'password123',
        firstName: 'Warehouse',
        lastName: 'Manager',
        role: ROLES.MANAGER,
        department: 'Operations'
      },
      {
        username: 'supervisor',
        email: 'supervisor@enterprise-storage.com',
        password: 'password123',
        firstName: 'Operations',
        lastName: 'Supervisor',
        role: ROLES.SUPERVISOR,
        department: 'Operations'
      },
      {
        username: 'operator',
        email: 'operator@enterprise-storage.com',
        password: 'password123',
        firstName: 'Warehouse',
        lastName: 'Operator',
        role: ROLES.OPERATOR,
        department: 'Operations'
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await pgConnection('users')
        .where('username', userData.username)
        .first();

      if (existingUser) {
        console.log(`⏭️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const [userId] = await pgConnection('users').insert({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        department: userData.department,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }).returning('id');

      console.log(`✅ Created demo user: ${userData.username} (${userData.role})`);
    }

    console.log('🎉 Demo users seeding completed!');
    console.log('');
    console.log('📋 Demo Credentials:');
    console.log('   Admin:     admin / password123');
    console.log('   Manager:   manager / password123');
    console.log('   Supervisor: supervisor / password123');
    console.log('   Operator:  operator / password123');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDemoUsers();
}

module.exports = { seedDemoUsers };
