import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: '123',
    description: 'Course ID',
    required: true,
  })
  @IsString()
  courseId: string;
}
