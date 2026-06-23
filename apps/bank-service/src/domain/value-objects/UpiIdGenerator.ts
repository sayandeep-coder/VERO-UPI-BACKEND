export class UpiIdGenerator {
  public base(firstName: string | null | undefined, accountNumber: string): string {
    const normalizedName = (firstName?.trim().split(/\s+/)[0] ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const prefix = normalizedName.length > 0 ? normalizedName : "user";
    const suffix = accountNumber.slice(-4).padStart(4, "0");

    return `${prefix}${suffix}@vero`;
  }

  public withCollisionSuffix(baseUpiId: string, collisionIndex: number): string {
    return collisionIndex === 0 ? baseUpiId : `${baseUpiId}_${collisionIndex}`;
  }
}
