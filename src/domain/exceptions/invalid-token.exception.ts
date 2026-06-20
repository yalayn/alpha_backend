export class InvalidTokenException extends Error {
  constructor() {
    super('Invalid or already used token');
    this.name = 'InvalidTokenException';
  }
}
