import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: createReviewDto.courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    //Check if user is enrolled?
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: createReviewDto.courseId },
      },
    });
    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in the course to review it',
      );
    }

    return this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
      },
    });
  }

  findAll(courseId?: string) {
    if (courseId) {
      return this.prisma.review.findMany({
        where: { courseId },
        include: { user: true, course: true },
      });
    }

    return this.prisma.review.findMany({
      include: { user: true, course: true },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, course: true },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.findOne(id);

    // Only owner or admin can update
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
    });
  }

  async remove(id: string, userId: string, userRole: Role) {
    const review = await this.findOne(id);

    // Only owner or admin can delete
    if (review.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
