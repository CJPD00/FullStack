import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import { FindAllLessonsDto } from './dto/find-all-lesson.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: string,
    userRole: Role,
    createLessonDto: CreateLessonDto,
  ) {
    // If not admin, check if course belongs to instructor
    if (userRole !== Role.ADMIN) {
      const course = await this.prisma.course.findUnique({
        where: { id: createLessonDto.courseId },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (course.instructorId !== userId) {
        throw new ForbiddenException(
          'You can only add lessons to your own courses',
        );
      }
    }

    return this.prisma.lesson.create({
      data: createLessonDto,
    });
  }

  async findAll(paginationDto: FindAllLessonsDto, courseId?: string) {
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

  async update(
    id: string,
    userId: string,
    userRole: Role,
    updateLessonDto: UpdateLessonDto,
  ) {
    // If not admin, check ownership
    if (userRole !== Role.ADMIN) {
      const lesson = await this.findOne(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      if (lesson.course.instructorId !== userId) {
        throw new ForbiddenException(
          'You can only update lessons of your own courses',
        );
      }
    }

    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });

    // Notify subscribers
    await this.notificationsService.notifyLessonUpdate(
      id,
      `La lección "${updatedLesson.title}" ha sido actualizada.`,
    );

    return updatedLesson;
  }

  async remove(id: string, userId: string, userRole: Role) {
    // If not admin, check ownership
    if (userRole !== Role.ADMIN) {
      const lesson = await this.findOne(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }

      if (lesson.course.instructorId !== userId) {
        throw new ForbiddenException(
          'You can only delete lessons of your own courses',
        );
      }
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
