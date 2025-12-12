# Lessons Module

Gestiona el contenido educativo dentro de los cursos.

## Estructura

- `Lesson`: Pertenece a un `Course`.
- **Campos**: `title`, `content` (texto/markdown), `videoUrl` (enlace a video externo), `position` (orden).

## Funcionalidad

- Las lecciones se ordenan por `position`.
- Solo el instructor del curso (o admin) debería poder crear/editar lecciones (requiere validación adicional en Service).
