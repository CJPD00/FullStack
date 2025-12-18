import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'New notification',
    description: 'Notification message',
    required: true,
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'User ID',
    description: 'User ID',
    required: true,
  })
  @IsString()
  userId: string;
}
