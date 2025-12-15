import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Logger } from '@nestjs/common';

/**
 * Estrategia de autenticación JWT para verificar tokens de acceso.
 * @param configService - Servicio de configuración.
 * @param usersService - Servicio de usuarios.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: false,
    });
    this.logger.log('[JWT Strategy] Initialized with secret');
  }

  /**
   * Valida el token de autenticación.
   * @param payload - Payload del token.
   * @returns El usuario autenticado.
   */
  async validate(payload: { sub: string; email: string }) {
    console.log('[JWT Strategy] Validating token for user:', payload.sub);
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      this.logger.error('[JWT Strategy] User not found:', payload.sub);
      throw new UnauthorizedException('Usuario no encontrado');
    }

    console.log('[JWT Strategy] User authenticated:', user.email);
    return user;
  }
}
