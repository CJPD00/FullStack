# NestJS LMS Course - Advanced Backend

Bienvenido al curso avanzado de NestJS. Este proyecto simula una plataforma de gestión de cursos online (LMS) y está diseñado para enseñar arquitectura backend profesional, patrones de diseño y buenas prácticas.

## 🚀 Cómo empezar

### Prerrequisitos

- Node.js (v18+)
- pnpm (recomendado) o npm
- Docker (opcional, para PostgreSQL en producción)

### Instalación

1.  **Clonar el repositorio**

    ```bash
    git clone <repo-url>
    cd nestjs-lms
    ```

2.  **Instalar dependencias**

    ```bash
    pnpm install
    ```

3.  **Configurar entorno**
    Copia el archivo de ejemplo y configúralo (por defecto usa SQLite para desarrollo):

    ```bash
    cp .env.example .env
    ```

4.  **Base de Datos**
    Ejecuta las migraciones y el seed de datos:

    ```bash
    pnpm prisma migrate dev --name init
    pnpm prisma db seed
    ```

5.  **Iniciar el servidor**
    ```bash
    pnpm start:dev
    ```
    El servidor correrá en `http://localhost:3000/api/v1`.

### 📚 Documentación API

La documentación interactiva (Swagger) está disponible en:
`http://localhost:3000/api/docs`

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura monolítica modular. Cada dominio de negocio tiene su propio módulo.

### Módulos Principales

- **Auth**: Autenticación JWT, Refresh Tokens y Google OAuth.
- **Users**: Gestión de usuarios y roles (Student, Instructor, Admin).
- **Courses**: Gestión de cursos (CRUD, relaciones).
- **Lessons**: Lecciones dentro de los cursos.
- **Enrollments**: Inscripciones de usuarios a cursos.
- **Notifications**: Sistema de notificaciones.

### Tecnologías Clave

- **NestJS**: Framework principal.
- **Prisma**: ORM para base de datos (SQLite/PostgreSQL).
- **Passport**: Estrategias de autenticación.
- **Class-Validator**: Validación de datos.
- **Swagger**: Documentación automática.

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## 📝 Guía de Estudio

Revisa el `README.md` dentro de cada módulo en `src/` para entender la lógica específica y las decisiones de diseño tomadas.
