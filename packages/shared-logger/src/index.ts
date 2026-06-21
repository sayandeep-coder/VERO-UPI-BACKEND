import pino from "pino";

export type Logger = pino.Logger;

export const createLogger = (serviceName: string, level = "info"): Logger => {
  return pino({
    name: serviceName,
    level,
    redact: {
      paths: [
        "req.headers.authorization",
        "authorization",
        "accessToken",
        "refreshToken",
        "otp",
        "password",
        "DATABASE_URL",
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET"
      ],
      remove: true
    },
    base: {
      service: serviceName
    },
    timestamp: pino.stdTimeFunctions.isoTime
  });
};
