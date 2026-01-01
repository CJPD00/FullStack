import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { getEmailConfirmationTemplate } from './templates/confirmation.template';
import { getResetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found in environment variables. Email sending will fail.',
      );
    }
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('EMAIL_FROM') || 'onboarding@resend.dev';
  }

  async sendVerificationEmail(email: string, token: string, name?: string) {
    const domain =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const confirmLink = `${domain}/verify-email?token=${token}`;

    // In dev mode, logging the link is helpful if emails aren't configured
    this.logger.debug(
      `Sending verification email to ${email}. Link: ${confirmLink}`,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Confirma tu correo electrónico',
        html: getEmailConfirmationTemplate(confirmLink, name),
      });

      if (error) {
        this.logger.error(
          'Error sending verification email via Resend:',
          error,
        );
        throw new Error(error.message);
      }

      this.logger.log(`Verification email sent to ${email}, ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw if you don't want to block registration, but usually we want to know
      // For now, logging error is consistent.
    }
  }

  async sendPasswordResetEmail(email: string, token: string, name?: string) {
    const domain =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${domain}/reset-password?token=${token}`;

    this.logger.debug(
      `Sending password reset email to ${email}. Link: ${resetLink}`,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Restablecer contraseña',
        html: getResetPasswordTemplate(resetLink, name),
      });

      if (error) {
        this.logger.error(
          'Error sending password reset email via Resend:',
          error,
        );
        throw new Error(error.message);
      }

      this.logger.log(`Password reset email sent to ${email}, ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }
}
