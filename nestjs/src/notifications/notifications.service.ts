import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

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
}
