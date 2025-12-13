import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';
import { Request } from 'express';

/**
 * Estrategia de autenticación Google para verificar tokens de acceso.
 * @param configService - Servicio de configuración.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  /**
   * Valida el token de autenticación.
   * @param request - Objeto de solicitud Express.
   * @param accessToken - Token de acceso.
   * @param refreshToken - Token de refresco.
   * @param profile - Perfil del usuario.
   * @param done - Callback de autenticación.
   * @returns El usuario autenticado.
   */
  async validate(
    request: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<User> {
    const { name, emails, photos, id } = profile;
    const user = await this.authService.validateGoogleUser({
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      googleId: id,
      accessToken,
    });
    done(null, user);
    return user;
  }
}
