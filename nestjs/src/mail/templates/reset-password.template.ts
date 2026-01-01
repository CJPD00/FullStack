export const getResetPasswordTemplate = (url: string, name?: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .content { font-size: 16px; color: #333; line-height: 1.6; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { background-color: #EF4444; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; transition: background-color 0.3s; }
    .button:hover { background-color: #dc2626; }
    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Restablecer Contraseña</h2>
    </div>
    <div class="content">
      <p>Hola${name ? ' ' + name : ''},</p>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p>Si has sido tú, haz clic en el botón de abajo para continuar:</p>
      
      <div class="button-container">
        <a href="${url}" class="button">Restablecer Contraseña</a>
      </div>
      
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no has solicitado este cambio, por favor ignora este correo o contacta a soporte si tienes dudas.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Tu Aplicación. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
`;
