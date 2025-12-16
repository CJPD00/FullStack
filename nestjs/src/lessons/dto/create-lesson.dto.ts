import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    example: 'Lesson Title',
    description: 'Title of the lesson',
    required: true,
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Lesson Content',
    description: 'Content of the lesson',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'Lesson Video URL',
    description: 'Video URL of the lesson',
  })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Position of the lesson',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @ApiProperty({
    example: 'Course ID',
    description: 'ID of the course',
    required: true,
  })
  @IsString()
  courseId: string;
}
