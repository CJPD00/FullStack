# Users Module

Gestiona la información de los usuarios y sus roles.

## Relaciones

- Un usuario puede tener muchos `Enrollments` (cursos inscritos).
- Un usuario (Instructor) puede tener muchos `Courses` creados.
- Un usuario puede tener muchas `Notifications`.

## Seguridad

- Las contraseñas se hashean usando `bcrypt` antes de guardarse.
- Nunca se devuelve el campo `password` en las respuestas de la API (se excluye en el servicio o usando `ClassSerializerInterceptor` si se prefiere).
