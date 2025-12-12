# Courses Module

El núcleo de la plataforma LMS. Permite la creación y gestión de cursos.

## Estructura

- `Course`: Entidad principal.
- `Lesson`: Sub-entidad relacionada. Un curso tiene muchas lecciones.

## Permisos

- **Lectura**: Pública (cualquiera puede ver cursos).
- **Escritura**: Solo `INSTRUCTOR` y `ADMIN`.
- **Edición**: Un instructor solo debería poder editar sus propios cursos (lógica a implementar en Service o Guard avanzado).

## DTOs

Usamos `CreateCourseDto` y `UpdateCourseDto` para validar la entrada de datos, asegurando que campos como `price` sean números positivos y `title` sea string.
