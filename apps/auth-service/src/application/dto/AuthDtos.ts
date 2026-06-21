export interface RefreshTokenRequestDto {
  refresh_token: string;
}

export interface LogoutRequestDto {
  refresh_token: string;
}

export interface RefreshTokenResponseDto {
  access_token: string;
  expires_in_seconds: number;
}
