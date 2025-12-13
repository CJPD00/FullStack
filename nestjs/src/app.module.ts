import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { validationSchema } from './config/env.validation';

/**
 * Módulo principal de la aplicación.
 * @param imports - Módulos importados.
 * @param controllers - Controladores de la aplicación.
 * @param providers - Proveedores de la aplicación.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: {
        abortEarly: false, // Muestra todos los errores, no solo el primero
      },
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
