import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Course, Lesson, User } from '@prisma/client';

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

  // findAll() {
  //   return this.prisma.lesson.findMany({
  //     include: { course: true },
  //   });
  // }

  findByCourseId(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      include: { course: true },
    });
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
