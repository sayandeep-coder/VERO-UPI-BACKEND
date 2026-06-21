import { PrismaClient } from "@prisma/client";

declare global {
  var __veroPrismaClient: PrismaClient | undefined;
}

export const prisma =
  globalThis.__veroPrismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__veroPrismaClient = prisma;
}

export type DatabaseClient = PrismaClient;
