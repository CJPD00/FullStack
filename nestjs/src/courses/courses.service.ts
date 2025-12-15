import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto,
    });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: { instructor: true },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { lessons: true, instructor: true },
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course || course.instructorId !== userId) {
      throw new UnauthorizedException({
        message: 'No tienes permiso para actualizar este curso.',
        error: 'Unauthorized',
        statusCode: 403,
      });
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course || course.instructorId !== userId) {
      throw new UnauthorizedException({
        message: 'No tienes permiso para eliminar este curso.',
        error: 'Unauthorized',
        statusCode: 403,
      });
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
