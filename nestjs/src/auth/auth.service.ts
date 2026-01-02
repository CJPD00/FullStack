import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { TokenType } from '@prisma/client';

interface JwtPayloadWithExp {
  exp: number;
  [key: string]: unknown;
}

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
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  /**
   * Decodifica un JWT y extrae la fecha de expiración de forma segura.
   * @param token - Token JWT a decodificar.
   * @returns Fecha de expiración del token.
   */
  private decodeTokenExpiration(token: string): Date {
    const decoded: unknown = this.jwtService.decode(token);
    if (!decoded || typeof decoded !== 'object' || !('exp' in decoded)) {
      throw new Error('Invalid token: unable to decode expiration');
    }
    const payload = decoded as JwtPayloadWithExp;
    return new Date(payload.exp * 1000);
  }

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
  async login(user: Omit<User, 'password'>) {
    const familyId = randomUUID();
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      familyId,
    };

    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    const access_token = this.jwtService.sign({
      email: user.email,
      sub: user.id,
      role: user.role,
    }); // Access token does not need familyId usually, but can have it if needed. Keeping it simple.

    // Store hash of refresh token
    const hash = await bcrypt.hash(refresh_token, 10);
    const expiresAt = this.decodeTokenExpiration(refresh_token);

    await this.prisma.token.create({
      data: {
        token: hash,
        type: TokenType.REFRESH,
        expiresAt,
        userId: user.id,
        familyId,
      },
    });

    return {
      access_token,
      refresh_token,
    };
  }

  /**
   * Registra un nuevo usuario.
   * @param createUserDto - DTO con los datos del usuario a registrar.
   * @returns El usuario registrado.
   */
  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('The user is already exist');
    }

    if (!registerDto.password) {
      throw new Error('Password is required for registration');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours to verify

    await this.prisma.token.create({
      data: {
        token,
        type: TokenType.VERIFICATION,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      token,
      user.name || '',
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async activateAccount(token: string) {
    const existingToken = await this.prisma.token.findUnique({
      where: { token },
    });

    if (!existingToken || existingToken.type !== TokenType.VERIFICATION) {
      throw new UnauthorizedException('Token inválido');
    }

    if (existingToken.expiresAt < new Date()) {
      await this.prisma.token.delete({ where: { id: existingToken.id } });
      throw new UnauthorizedException('El token ha expirado');
    }

    await this.usersService.update(existingToken.userId, { verified: true });
    await this.prisma.token.delete({ where: { id: existingToken.id } });

    return { message: 'Cuenta activada correctamente' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal user existence
      return {
        message:
          'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.',
      };
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour to reset

    // Delete existing reset tokens
    const existingTokens = await this.prisma.token.findMany({
      where: { userId: user.id, type: TokenType.PASSWORD_RESET },
    });
    if (existingTokens.length > 0) {
      await this.prisma.token.deleteMany({
        where: { userId: user.id, type: TokenType.PASSWORD_RESET },
      });
    }

    await this.prisma.token.create({
      data: {
        token,
        type: TokenType.PASSWORD_RESET,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      token,
      user.name || '',
    );

    return {
      message:
        'Si el correo existe, se ha enviado un enlace para restablecer la contraseña.',
    };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('No se encontró cuenta con ese correo');
    }

    if (user.verified) {
      throw new ConflictException('La cuenta ya está verificada');
    }

    // Delete existing verification tokens
    await this.prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: TokenType.VERIFICATION,
      },
    });

    // Create new token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.token.create({
      data: {
        token,
        type: TokenType.VERIFICATION,
        expiresAt,
        userId: user.id,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      token,
      user.name || '',
    );

    return { message: 'Correo de verificación reenviado' };
  }

  async resetPassword(token: string, newPass: string) {
    const existingToken = await this.prisma.token.findUnique({
      where: { token },
    });

    if (!existingToken || existingToken.type !== TokenType.PASSWORD_RESET) {
      throw new UnauthorizedException('Token inválido');
    }

    if (existingToken.expiresAt < new Date()) {
      await this.prisma.token.delete({ where: { id: existingToken.id } });
      throw new UnauthorizedException('El token ha expirado');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.usersService.update(existingToken.userId, {
      password: hashedPassword,
    });
    await this.prisma.token.delete({ where: { id: existingToken.id } });

    return { message: 'Contraseña actualizada correctamente' };
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
        familyId: string;
      }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 1. Find all active refresh tokens for this family
      const tokens = await this.prisma.token.findMany({
        where: {
          familyId: payload.familyId,
          type: TokenType.REFRESH,
        },
      });

      // 2. Reuse Detection Logic
      // We look for the current token in the database
      let foundParams: { id: string; userId: string } | null = null;
      for (const t of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, t.token);
        if (isMatch) {
          foundParams = { id: t.id, userId: t.userId };
          break;
        }
      }

      if (!foundParams) {
        // Token is valid JWT but not in DB -> REUSE DETECTED!
        // Invalidate the entire family
        await this.prisma.token.deleteMany({
          where: { familyId: payload.familyId, type: TokenType.REFRESH },
        });
        throw new UnauthorizedException(
          'Suspected token reuse. Please log in again.',
        );
      }

      // 3. Rotation Logic
      // Token found. Delete it (single use) and issue new pair.
      await this.prisma.token.delete({ where: { id: foundParams.id } });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generate new pair with SAME familyId
      const newPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
        familyId: payload.familyId,
      };

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      });

      const newAccessToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
      });

      // Save new refresh token
      const newHash = await bcrypt.hash(newRefreshToken, 10);
      const expiresAt = this.decodeTokenExpiration(newRefreshToken);

      await this.prisma.token.create({
        data: {
          token: newHash,
          type: TokenType.REFRESH,
          expiresAt,
          userId: user.id,
          familyId: payload.familyId,
        },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }
}
