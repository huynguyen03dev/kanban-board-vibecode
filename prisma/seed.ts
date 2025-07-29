import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.task.deleteMany();

  // Create sample tasks
  const tasks = [
    {
      title: 'Design the user interface',
      description: 'Create wireframes and mockups for the application',
      status: TaskStatus.TODO,
    },
    {
      title: 'Set up project structure',
      description: 'Initialize the project with necessary dependencies',
      status: TaskStatus.TODO,
    },
    {
      title: 'Implement drag and drop',
      description: 'Add drag and drop functionality using @dnd-kit',
      status: TaskStatus.IN_PROGRESS,
    },
    {
      title: 'Install dependencies',
      description: 'Install Next.js, Tailwind CSS, and other required packages',
      status: TaskStatus.DONE,
    },
    {
      title: 'Set up database integration',
      description: 'Configure PostgreSQL and Prisma for data persistence',
      status: TaskStatus.DONE,
    },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
