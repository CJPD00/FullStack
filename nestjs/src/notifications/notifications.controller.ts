import {
  Controller,
  Get,
  //Post,
  Body,
  Patch,
  Param,
  //Delete,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
// import { RolesGuard } from '../common/guards/roles.guard';
// import { Roles } from '../common/decorators/roles.decorator';
// import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @Post()
  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBody({ type: CreateNotificationDto })
  // create(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationsService.create(createNotificationDto);
  // }

  // @Get()
  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  // findAll() {
  //   return this.notificationsService.findAll();
  // }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find all notifications for current user' })
  findMyNotifications(@CurrentUser() user: User) {
    return this.notificationsService.findByUser(user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationsService.findOne(id);
  // }

  // @Patch(':id')
  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBody({ type: UpdateNotificationDto })
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNotificationDto: UpdateNotificationDto,
  // ) {
  //   return this.notificationsService.update(id, updateNotificationDto);
  // }

  // @Delete(':id')
  // @ApiBearerAuth('JWT-auth')
  // @UseGuards(RolesGuard)
  // @Roles(Role.ADMIN)
  // remove(@Param('id') id: string) {
  //   return this.notificationsService.remove(id);
  // }
}
