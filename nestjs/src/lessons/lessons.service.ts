import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Course, Lesson, User } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto, user: User) {
    const course: Course | null = await this.prisma.course.findUnique({
      where: { id: createLessonDto.courseId },
    });

    if (!course || course.instructorId !== user.id) {
      throw new UnauthorizedException({
        message: 'You are not authorized to create a lesson for this course',
        code: 401,
      });
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
    });
  }

  async findAll(paginationDto: PaginationDto, courseId?: string) {
    const { limit, page } = paginationDto;
    const skip = (page - 1) * limit;

    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      include: { course: true },
      skip,
      take: limit,
    });

    const total = await this.prisma.lesson.count({
      where: { courseId },
    });

    return {
      data: lessons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: User) {
    const lesson: Lesson | null = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException({
        message: 'Lesson not found',
        code: 404,
      });
    }

    const course: Course | null = await this.prisma.course.findUnique({
      where: { id: lesson?.courseId },
    });

    if (!course || course.instructorId !== user.id) {
      throw new UnauthorizedException({
        message: 'You are not authorized to update a lesson for this course',
        code: 401,
      });
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: string, user: User) {
    const lesson: Lesson | null = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException({
        message: 'Lesson not found',
        code: 404,
      });
    }

    const course: Course | null = await this.prisma.course.findUnique({
      where: { id: lesson?.courseId },
    });

    if (!course || course.instructorId !== user.id) {
      throw new UnauthorizedException({
        message: 'You are not authorized to delete a lesson for this course',
        code: 401,
      });
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
