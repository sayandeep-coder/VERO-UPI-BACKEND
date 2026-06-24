import { extractBearerToken, verifyAccessToken } from "@vero/shared-auth";
import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

export const authenticateRequest = (jwtAccessSecret: string): RequestHandler => {
  return (request, _response, next) => {
    const token = extractBearerToken(request.header("authorization"));
    const principal = verifyAccessToken(token, jwtAccessSecret);
    (request as AuthenticatedRequest).principal = principal;
    next();
  };
};
