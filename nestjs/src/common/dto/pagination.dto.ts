import { IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 10, description: 'Number of items per page' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number = 1;
}
