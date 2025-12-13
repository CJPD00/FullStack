import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guardia de autenticación JWT para verificar tokens de acceso.
 * @returns Decorador de guardia.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
