export const BANK_DEFAULTS = {
  bankName: "VERO BANK",
  ifscCode: "VERO0001",
  accountType: "SAVINGS",
  accountStatus: "ACTIVE",
  upiStatus: "ACTIVE",
  currency: "INR",
  accountNumberSeed: 1_000_000_000,
  dailyLimit: "100000.00",
  monthlyLimit: "1000000.00",
  zeroAmount: "0.00",
  upiHandle: "vero"
} as const;
