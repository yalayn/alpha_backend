export class EmailUnchangedException extends Error {
  constructor() {
    super('New email must be different from the current one');
    this.name = 'EmailUnchangedException';
  }
}
