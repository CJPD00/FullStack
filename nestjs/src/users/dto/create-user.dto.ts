import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: 'password123',
    minLength: 6,
    description: 'Contraseña (opcional para OAuth)',
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.STUDENT,
    description: 'Rol del usuario',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
