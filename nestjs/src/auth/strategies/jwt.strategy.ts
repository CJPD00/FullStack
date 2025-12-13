import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * Estrategia de autenticación JWT para verificar tokens de acceso.
 * @param configService - Servicio de configuración.
 * @param usersService - Servicio de usuarios.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Valida el token de autenticación.
   * @param payload - Payload del token.
   * @returns El usuario autenticado.
   */
  async validate(payload: { sub: string; email: string }) {
    const user = await this.usersService.findOne(payload.sub);
    return user;
  }
}
