import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { User } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guardia de roles para verificar permisos de usuario.
 * @param context - Contexto de ejecución.
 * @returns Booleano indicando si el usuario tiene los roles permitidos.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: User }>();
    return requiredRoles.some((role) => user.role === role);
  }
}
