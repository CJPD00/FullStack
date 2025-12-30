import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  async findAll({ limit, page }: PaginationDto) {
    const skip = (page - 1) * limit;
    const courses = await this.prisma.course.findMany({
      skip,
      take: limit,
      include: {
        instructor: {
          omit: { password: true },
        },
      },
    });
    const total = await this.prisma.course.count();
    return {
      data: courses,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { lessons: true, instructor: true },
    });
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    userId: string,
    role: Role,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (role !== Role.ADMIN) {
      if (!course || course.instructorId !== userId) {
        throw new UnauthorizedException({
          message: 'No tienes permiso para actualizar este curso.',
          error: 'Unauthorized',
          statusCode: 403,
        });
      }
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });

    // Notify subscribers
    await this.notificationsService.notifyCourseSubscribers(
      id,
      `El curso "${updatedCourse.title}" ha sido actualizado.`,
    );

    return updatedCourse;
  }

  async remove(id: string, userId: string, role: Role) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (role !== Role.ADMIN) {
      if (!course || course.instructorId !== userId) {
        throw new UnauthorizedException({
          message: 'No tienes permiso para eliminar este curso.',
          error: 'Unauthorized',
          statusCode: 403,
        });
      }
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
