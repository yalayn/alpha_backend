export class TokenExpiredException extends Error {
  constructor() {
    super('Token has expired');
    this.name = 'TokenExpiredException';
  }
}
