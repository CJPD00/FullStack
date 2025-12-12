# Enrollments Module

Gestiona las inscripciones de los estudiantes a los cursos.

## Flujo

1.  Un estudiante se inscribe a un curso (`POST /enrollments`).
2.  Se crea un registro en la tabla `Enrollment` vinculando `User` y `Course`.
3.  Esto permite al estudiante acceder al contenido del curso (si implementamos lógica de "contenido privado").

## Consultas

- `GET /enrollments/my-courses`: Devuelve todos los cursos donde el usuario actual está inscrito.
