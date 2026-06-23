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

export interface SendOtpResponseDto {
  challenge_id: string;
  expires_in_seconds: number;
  resend_after_seconds: number;
  dev_otp?: string;
}

export interface VerifyOtpResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in_seconds: number;
  is_new_user: boolean;
  user: {
    id: string;
    mobile_number: string;
    full_name: string | null;
    status: string;
    is_verified: boolean;
  };
}
