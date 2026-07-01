export type ContactMessageType = 'comment' | 'request';

/**
 * Mensaje de contacto (comentario o solicitud) enviado por un usuario
 * autenticado. Es un registro **inmutable** y punto-en-el-tiempo: guarda un
 * snapshot de `senderName`/`senderEmail` del remitente al momento de enviarlo
 * (si el usuario luego cambia su nombre, el mensaje conserva el de entonces).
 */
export class ContactMessage {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly senderName: string,
    public readonly senderEmail: string,
    public readonly type: ContactMessageType,
    public readonly subject: string,
    public readonly message: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
