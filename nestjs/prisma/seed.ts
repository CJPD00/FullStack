import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
      role: Role.ADMIN,
    },
  });

  // Create Instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Instructor User',
      password,
      role: Role.INSTRUCTOR,
    },
  });

  // Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      password,
      role: Role.STUDENT,
    },
  });

  // Create Course
  const course = await prisma.course.create({
    data: {
      title: 'NestJS Advanced Course',
      description: 'A complete guide to NestJS',
      instructorId: instructor.id,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Introduction',
            content: 'Welcome to the course',
            position: 1,
          },
          { title: 'Setup', content: 'Setting up the project', position: 2 },
        ],
      },
    },
  });

  console.log({ admin, instructor, student, course });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
