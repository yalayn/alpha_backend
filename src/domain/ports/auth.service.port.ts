export interface IAuthService {
  generateToken(payload: any): string;
}

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
