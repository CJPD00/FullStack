import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '@prisma/client';

/**
 * Servicio de autenticación.
 * @param usersService - Servicio de usuarios.
 * @param jwtService - Servicio de JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Valida el usuario.
   * @param email - Correo electrónico del usuario.
   * @param pass - Contraseña del usuario.
   * @returns El usuario autenticado.
   */
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Genera un token de acceso y un token de refresco.
   * @param user - Usuario autenticado.
   * @returns Un objeto con el token de acceso y el token de refresco.
   */
  login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    };
  }

  /**
   * Registra un nuevo usuario.
   * @param createUserDto - DTO con los datos del usuario a registrar.
   * @returns El usuario registrado.
   */
  async register(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('El usuario ya existe');
    }

    if (!createUserDto.password) {
      throw new Error('Password is required for registration');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * Autentica un usuario con Google.
   * @param req - Petición con el usuario autenticado.
   * @returns El usuario autenticado.
   */
  googleLogin(req: { user: Omit<User, 'password'> }) {
    if (!req.user) {
      return 'No user from google';
    }
    return this.login(req.user);
  }

  async validateGoogleUser(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    googleId: string;
    accessToken: string;
  }): Promise<User> {
    const user = await this.usersService.findByEmail(googleUser.email);
    if (user) {
      // Update googleId if not present (linking accounts)
      if (!user.googleId) {
        const updatedUser = await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
        });
        return updatedUser;
      }
      return user;
    }

    // Create new user (password is optional for OAuth users)
    const newUser = await this.usersService.create({
      email: googleUser.email,
      name: `${googleUser.firstName} ${googleUser.lastName}`,
      // Don't send password field for OAuth users
    });

    // Update googleId for the new user since CreateUserDto doesn't have it
    const updatedNewUser = await this.usersService.update(newUser.id, {
      googleId: googleUser.googleId,
    });

    return updatedNewUser;
  }

  /**
   * Valida un refresh token y genera un nuevo access token.
   * @param refreshToken - Refresh token a validar.
   * @returns Un objeto con el nuevo access token.
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        email: string;
        sub: string;
        role: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevo access token
      const newPayload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
