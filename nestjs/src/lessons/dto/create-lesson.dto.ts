import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  courseId: string;
}
