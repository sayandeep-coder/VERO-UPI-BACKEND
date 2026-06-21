import { UnauthorizedError } from "@vero/shared-errors";
import type { AuthenticatedPrincipal } from "@vero/shared-types";
import jwt from "jsonwebtoken";

export interface AccessTokenPayload extends jwt.JwtPayload {
  sub: string;
  sid?: string;
  roles?: string[];
}

export const signAccessToken = (
  principal: AuthenticatedPrincipal,
  secret: string,
  expiresInSeconds = 900
): string => {
  const payload: Record<string, unknown> = {
    roles: principal.roles
  };

  if (principal.sessionId) {
    payload.sid = principal.sessionId;
  }

  return jwt.sign(
    payload,
    secret,
    {
      subject: principal.userId,
      expiresIn: expiresInSeconds,
      issuer: "vero2026",
      audience: "vero2026-api"
    }
  );
};

export const verifyAccessToken = (token: string, secret: string): AuthenticatedPrincipal => {
  try {
    const payload = jwt.verify(token, secret, {
      issuer: "vero2026",
      audience: "vero2026-api"
    }) as AccessTokenPayload;

    if (!payload.sub) {
      throw new UnauthorizedError("Invalid access token subject");
    }

    const principal: AuthenticatedPrincipal = {
      userId: payload.sub,
      roles: payload.roles ?? ["USER"]
    };

    if (payload.sid) {
      principal.sessionId = payload.sid;
    }

    return principal;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const extractBearerToken = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Bearer token is required");
  }

  return authorizationHeader.slice("Bearer ".length);
};
