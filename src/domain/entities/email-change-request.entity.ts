export type EmailChangeStatus = 'pending' | 'applied' | 'failed';

/**
 * Solicitud de cambio de email con doble verificación (SPE-008).
 *
 * Guarda los tokens **hasheados** (RN-006) — los valores en claro solo viajan
 * por email. La entidad es inmutable: las transiciones de estado devuelven una
 * nueva instancia, igual que el resto del dominio (ver `User`).
 */
export class EmailChangeRequest {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly newEmail: string,
    public readonly oldTokenHash: string,
    public readonly newTokenHash: string,
    public readonly status: EmailChangeStatus,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
    public readonly oldConfirmedAt?: Date,
    public readonly newConfirmedAt?: Date,
  ) {}

  get oldConfirmed(): boolean {
    return !!this.oldConfirmedAt;
  }

  get newConfirmed(): boolean {
    return !!this.newConfirmedAt;
  }

  get bothConfirmed(): boolean {
    return this.oldConfirmed && this.newConfirmed;
  }

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this.expiresAt.getTime();
  }

  /** Indica a qué lado (actual/nuevo) corresponde un hash de token, o null si no coincide. */
  sideForTokenHash(hash: string): 'old' | 'new' | null {
    if (hash === this.oldTokenHash) return 'old';
    if (hash === this.newTokenHash) return 'new';
    return null;
  }

  /**
   * Marca un lado como confirmado. Idempotente: confirmar el mismo lado dos
   * veces conserva la marca original sin avanzar (edge case de la spec §5).
   */
  confirmSide(side: 'old' | 'new', at: Date = new Date()): EmailChangeRequest {
    return new EmailChangeRequest(
      this.id,
      this.userId,
      this.newEmail,
      this.oldTokenHash,
      this.newTokenHash,
      this.status,
      this.createdAt,
      this.expiresAt,
      side === 'old' ? this.oldConfirmedAt ?? at : this.oldConfirmedAt,
      side === 'new' ? this.newConfirmedAt ?? at : this.newConfirmedAt,
    );
  }

  withStatus(status: EmailChangeStatus): EmailChangeRequest {
    return new EmailChangeRequest(
      this.id,
      this.userId,
      this.newEmail,
      this.oldTokenHash,
      this.newTokenHash,
      status,
      this.createdAt,
      this.expiresAt,
      this.oldConfirmedAt,
      this.newConfirmedAt,
    );
  }
}
