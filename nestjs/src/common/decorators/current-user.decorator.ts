import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/**
 * Decorador para obtener el usuario actual autenticado.
 * @param data - Datos adicionales (no utilizado).
 * @param ctx - Contexto de ejecución.
 * @returns El usuario autenticado.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
