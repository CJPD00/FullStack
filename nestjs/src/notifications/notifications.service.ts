import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  findAll() {
    return this.prisma.notification.findMany({
      include: { user: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: { user: true },
    });
  }
  markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId, readAt: null },
      data: {
        readAt: new Date(),
      },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: {
        readAt: new Date(),
      },
    });
  }

  remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async notifyCourseSubscribers(courseId: string, message: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true },
    });

    // const notifications = enrollments.map((enrollment) => ({
    //   userId: enrollment.userId,
    //   message,
    // }));

    // Optimización: Crear todas las notificaciones en una transacción o createMany si es soportado (SQLite lo soporta)
    // Prisma createMany no devuelve los objetos creados en todas las DBs, así que iteraremos para este caso o usaremos createMany y luego emitiremos.
    // Para simplificar y asegurar consistencia con el gateway:

    for (const enrollment of enrollments) {
      // Persistir
      const notification = await this.prisma.notification.create({
        data: {
          userId: enrollment.userId,
          message,
        },
      });

      // Emitir evento en tiempo real
      this.notificationsGateway.notifyUser(enrollment.userId, notification);
    }
  }

  async notifyLessonUpdate(lessonId: string, message: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true, title: true },
    });

    if (lesson) {
      await this.notifyCourseSubscribers(lesson.courseId, message);
    }
  }
}
