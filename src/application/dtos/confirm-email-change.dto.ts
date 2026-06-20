export interface ConfirmEmailChangeDto {
  token: string;
}

export interface ConfirmEmailChangeResult {
  side: 'old' | 'new';
  bothConfirmed: boolean;
  applied: boolean;
}
