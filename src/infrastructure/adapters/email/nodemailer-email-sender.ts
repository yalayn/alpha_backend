import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailMessage, EmailSender } from '@domain/ports/email-sender.port';

/**
 * Adaptador real de envío de correo vía SMTP (Nodemailer) — SPE-008.
 *
 * Configuración por env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
 * Si no hay `SMTP_HOST` configurado (dev sin SMTP), cae a un transporte `jsonTransport`
 * que no envía nada real y deja el correo en el log — así la app arranca sin SMTP.
 * En tests se inyecta un fake del puerto `EmailSender`, no este adaptador.
 */
@Injectable()
export class NodemailerEmailSender implements EmailSender {
  private readonly logger = new Logger(NodemailerEmailSender.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly isReal: boolean;

  constructor() {
    this.from = process.env.EMAIL_FROM || 'no-reply@project-alpha.local';
    this.isReal = !!process.env.SMTP_HOST;

    this.transporter = this.isReal
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        })
      : nodemailer.createTransport({ jsonTransport: true });
  }

  async send(message: EmailMessage): Promise<void> {
    const info = await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.body,
    });

    if (!this.isReal) {
      this.logger.warn(
        `SMTP no configurado — correo simulado para ${message.to}: ${message.subject}`,
      );
      this.logger.debug(info.message?.toString());
    }
  }
}
