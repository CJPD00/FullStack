import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorador para verificar roles de usuario.
 * @param roles - Roles permitidos.
 * @returns Decorador de roles.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
