import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { ImgbbService } from '../common/services/imgbb.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CoursesController],
  providers: [CoursesService, ImgbbService],
})
export class CoursesModule {}
