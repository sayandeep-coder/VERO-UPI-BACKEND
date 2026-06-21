export interface AuthenticatedPrincipal {
  userId: string;
  sessionId?: string;
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
}
