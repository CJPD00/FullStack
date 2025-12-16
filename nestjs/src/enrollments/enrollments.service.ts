import { Injectable } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId: createEnrollmentDto.courseId,
      },
    });
  }

  findAll() {
    return this.prisma.enrollment.findMany({
      include: { user: true, course: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      omit: {
        userId: true,
        courseId: true,
        updatedAt: true,
        createdAt: true,
        id: true,
      },
      include: { course: true },
    });
  }

  findOne(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: { user: true, course: true },
    });
  }

  remove(id: string) {
    return this.prisma.enrollment.delete({
      where: { id },
    });
  }
}
