import type { UpiIdRepository } from "../../domain/repositories/UpiIdRepository.js";
import { toUpiIdDto, type UpiIdDto } from "../dto/BankDtos.js";
import type { UserScopedQuery } from "../queries/BankQueries.js";

export class GetUpiIdsService {
  public constructor(private readonly upiIds: UpiIdRepository) {}

  public async list(query: UserScopedQuery): Promise<UpiIdDto[]> {
    const upiIds = await this.upiIds.findByUserId(query.userId);
    return upiIds.map(toUpiIdDto);
  }
}
