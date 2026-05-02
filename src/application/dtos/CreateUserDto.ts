export class CreateUserDto {
  constructor(
    public readonly email: string,
    public readonly name: string,
  ) {}
}
