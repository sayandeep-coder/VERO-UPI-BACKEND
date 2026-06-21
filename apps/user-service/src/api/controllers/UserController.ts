import { asyncHandler } from "@vero/shared-http";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { Request, Response } from "express";
import type { UserProfileService } from "../../application/services/UserProfileService.js";

const getUserParamsSchema = z.object({
  userId: z.string().uuid()
});

export class UserController {
  public constructor(private readonly userProfileService: UserProfileService) {}

  public getById = asyncHandler(async (request: Request, response: Response) => {
    const params = parseOrThrow(getUserParamsSchema, request.params);
    const user = await this.userProfileService.getProfile({ userId: params.userId });

    response.status(200).json({ data: user });
  });
}
