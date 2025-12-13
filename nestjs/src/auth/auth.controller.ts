import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Controlador de autenticación.
 * @param authService - Servicio de autenticación.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Autentica un usuario con email y contraseña.
   * @param loginDto - DTO con el email y contraseña del usuario.
   * @returns El usuario autenticado.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() loginDto: LoginDto) {
    // In a real app, use a DTO and validate
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  /**
   * Registra un nuevo usuario.
   * @param createUserDto - DTO con los datos del usuario a registrar.
   * @returns El usuario registrado.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /**
   * Autentica un usuario con Google.
   * @returns El usuario autenticado.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  /**
   * Autentica un usuario con Google.
   * @param req - Petición con el usuario autenticado.
   * @returns El usuario autenticado.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: { user: any }) {
    return this.authService.googleLogin(req);
  }
}
