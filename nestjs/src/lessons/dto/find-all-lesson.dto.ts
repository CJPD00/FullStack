import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class FindAllLessonsDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'Course ID',
    description: 'ID of the course to filter lessons',
  })
  @IsString()
  courseId?: string;
}
