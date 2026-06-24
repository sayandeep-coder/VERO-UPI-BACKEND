import type { AuthenticatedPrincipal } from "@vero/shared-types";
import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  principal: AuthenticatedPrincipal;
}
