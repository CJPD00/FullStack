import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Course Title',
    description: 'Title of the course',
    required: true,
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Course Description',
    description: 'Description of the course',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Price of the course',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Published status of the course',
  })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the instructor',
    required: true,
  })
  @IsString()
  instructorId: string;

  @ApiPropertyOptional({
    description: 'URL of the course image',
    example: 'https://i.ibb.co/example.jpg',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
