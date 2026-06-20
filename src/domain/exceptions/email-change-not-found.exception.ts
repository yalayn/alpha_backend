export class EmailChangeNotFoundException extends Error {
  constructor() {
    super('No pending email change request');
    this.name = 'EmailChangeNotFoundException';
  }
}
