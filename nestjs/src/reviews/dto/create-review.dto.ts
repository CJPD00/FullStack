import { IsInt, IsOptional, IsString, Max, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    description: 'Rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    required: true,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    example: 'Great course!',
    description: 'Review comment',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    example: 'uuid-of-course',
    description: 'ID of the course being reviewed',
    required: true,
  })
  @IsUUID()
  courseId: string;
}
