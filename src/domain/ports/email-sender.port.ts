/**
 * Puerto de salida para el envío de correos (SPE-008).
 *
 * El dominio/aplicación depende de esta abstracción; el adaptador concreto
 * (Nodemailer) vive en infraestructura. Los tests inyectan un fake.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export const EMAIL_SENDER = Symbol('EmailSender');
