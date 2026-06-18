import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  console.log('Cleaning database...')
  const tablenames = ['Payment', 'Attendance', 'Expense', 'Material', 'Task', 'Milestone', 'ProjectMember', 'Project', 'Worker', 'User']
  for (const tablename of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`)
    } catch (error) {
      // Ignore if table doesn't exist yet
    }
  }
  console.log('Database cleaned.')


  // Hash passwords
  const adminPassword = await bcrypt.hash('Haseem@2004', 10)
  const managerPassword = await bcrypt.hash('Manager@1234', 10)
  const supervisorPassword = await bcrypt.hash('Super@1234', 10)
  const clientPassword = await bcrypt.hash('Client@1234', 10)

  // Create default users
  const admin = await prisma.user.upsert({
    where: { email: 'haseem3393@gmail.com' },
    update: {},
    create: {
      email: 'haseem3393@gmail.com',
      password: adminPassword,
      name: 'Haseem',
      role: UserRole.ADMIN,
      permissions: {
        phone: '+94771112222',
        active: true,
        modules: {
          projects: { view: true, edit: true, delete: true },
          finance: { view: true, edit: true },
          reports: { view: true }
        }
      }
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@munafcons.lk' },
    update: {},
    create: {
      email: 'manager@munafcons.lk',
      password: managerPassword,
      name: 'Project Manager',
      role: UserRole.PROJECT_MANAGER,
      permissions: {
        phone: '+94773334444',
        active: true,
        modules: {
          projects: { view: true, edit: true, delete: false },
          finance: { view: true, edit: false },
          reports: { view: true }
        }
      }
    },
  })

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@munafcons.lk' },
    update: {},
    create: {
      email: 'supervisor@munafcons.lk',
      password: supervisorPassword,
      name: 'Site Supervisor',
      role: UserRole.SUPERVISOR,
      permissions: {
        phone: '+94775556666',
        active: true,
        modules: {
          projects: { view: true, edit: false, delete: false },
          finance: { view: false, edit: false },
          reports: { view: true }
        }
      }
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@munafcons.lk' },
    update: {},
    create: {
      email: 'client@munafcons.lk',
      password: clientPassword,
      name: 'Building Owner Client',
      role: UserRole.CLIENT,
      permissions: {
        phone: '+94777778888',
        active: true,
        modules: {
          projects: { view: false, edit: false, delete: false },
          finance: { view: false, edit: false },
          reports: { view: false }
        }
      }
    },
  })

  console.log('✅ Default users created:')
  console.log(`   Admin: ${admin.email}`)
  console.log(`   Manager: ${manager.email}`)
  console.log(`   Supervisor: ${supervisor.email}`)
  console.log(`   Client: ${client.email}`)

  // Create sample workers
  const workers = await Promise.all([
    prisma.worker.upsert({
      where: { id: 'worker-1' },
      update: {},
      create: {
        id: 'worker-1',
        name: 'Kumar',
        trade: 'Mason',
        dailyWage: 2500,
        phone: '+94771234567',
        active: true,
      },
    }),
    prisma.worker.upsert({
      where: { id: 'worker-2' },
      update: {},
      create: {
        id: 'worker-2',
        name: 'Raj',
        trade: 'Carpenter',
        dailyWage: 2200,
        phone: '+94772345678',
        active: true,
      },
    }),
    prisma.worker.upsert({
      where: { id: 'worker-3' },
      update: {},
      create: {
        id: 'worker-3',
        name: 'Priyan',
        trade: 'Electrician',
        dailyWage: 3000,
        phone: '+94773456789',
        active: true,
      },
    }),
  ])

  console.log(`✅ Created ${workers.length} sample workers`)

  // Create a sample project
  const project = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      name: 'Sample Residential Building',
      location: 'Colombo 03',
      description: 'Sample project for testing',
      budget: 5000000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'ONGOING',
      progress: 25,
      managerId: manager.id,
      clientId: client.id,
    },
  })

  console.log(`✅ Created sample project: ${project.name}`)

  // Create milestones for the project
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        name: 'Foundation Complete',
        description: 'Building foundation completed',
        dueDate: new Date('2024-03-31'),
        projectId: project.id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Structure Complete',
        description: 'Main structure completed',
        dueDate: new Date('2024-06-30'),
        projectId: project.id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Roofing Complete',
        description: 'Roofing work completed',
        dueDate: new Date('2024-09-30'),
        projectId: project.id,
      },
    }),
    prisma.milestone.create({
      data: {
        name: 'Final Handover',
        description: 'Project handover to client',
        dueDate: new Date('2024-12-31'),
        projectId: project.id,
      },
    }),
  ])

  console.log(`✅ Created ${milestones.length} milestones`)

  // Create payment schedule
  const contractValue = 5000000
  await Promise.all([
    prisma.payment.create({
      data: {
        contractValue,
        percentage: 'FOUNDATION_25',
        amount: contractValue * 0.25,
        status: 'PENDING',
        projectId: project.id,
        milestoneId: milestones[0].id,
      },
    }),
    prisma.payment.create({
      data: {
        contractValue,
        percentage: 'STRUCTURE_35',
        amount: contractValue * 0.35,
        status: 'PENDING',
        projectId: project.id,
        milestoneId: milestones[1].id,
      },
    }),
    prisma.payment.create({
      data: {
        contractValue,
        percentage: 'ROOFING_25',
        amount: contractValue * 0.25,
        status: 'PENDING',
        projectId: project.id,
        milestoneId: milestones[2].id,
      },
    }),
    prisma.payment.create({
      data: {
        contractValue,
        percentage: 'HANDOVER_15',
        amount: contractValue * 0.15,
        status: 'PENDING',
        projectId: project.id,
        milestoneId: milestones[3].id,
      },
    }),
  ])

  console.log('✅ Created payment schedule')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
