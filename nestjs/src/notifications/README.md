# Notifications Module

Sistema de notificaciones para usuarios.

## Funcionalidad

- Permite enviar mensajes a usuarios específicos.
- Los usuarios pueden ver sus propias notificaciones (`GET /notifications/my-notifications`).
- Soporte futuro para Firebase Cloud Messaging (FCM) para push notifications móviles.

## Roles

- Solo los administradores pueden crear notificaciones globales o específicas desde la API por ahora.
- El sistema podría generar notificaciones automáticas (ej. "Bienvenido al curso") usando Event Emitters.
