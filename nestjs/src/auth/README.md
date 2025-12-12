# Auth Module

Este módulo maneja la autenticación y autorización del sistema.

## Conceptos Clave

### JWT (JSON Web Tokens)

Usamos JWT para mantener la sesión del usuario sin estado (stateless).

- **Access Token**: Vida corta (ej. 15 min). Se envía en cada petición.
- **Refresh Token**: Vida larga (ej. 7 días). Se usa para obtener nuevos access tokens.

### Google OAuth2

Implementado usando `passport-google-oauth20`. Permite a los usuarios loguearse con su cuenta de Google.

### Guards

- `JwtAuthGuard`: Protege rutas que requieren estar logueado.
- `RolesGuard`: Protege rutas que requieren roles específicos (ej. ADMIN).

## Endpoints Principales

- `POST /auth/login`: Inicia sesión con email/password.
- `POST /auth/register`: Registra un nuevo usuario.
- `GET /auth/google`: Inicia flujo de OAuth con Google.
