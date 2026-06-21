import { UserController } from "../api/controllers/UserController.js";
import { createUserRoutes } from "../api/routes/userRoutes.js";
import { UserProfileService } from "../application/services/UserProfileService.js";
import { PrismaUserReadRepository } from "../infrastructure/database/PrismaUserReadRepository.js";

export const createUserServiceContainer = () => {
  const userRepository = new PrismaUserReadRepository();
  const userProfileService = new UserProfileService(userRepository);
  const userController = new UserController(userProfileService);
  const router = createUserRoutes(userController);

  return { router };
};
