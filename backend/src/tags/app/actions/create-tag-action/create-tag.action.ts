import { Controller, Post, Body } from "@nestjs/common";
import { CreateTagTransactionScript } from "../../../domain/transaction-scripts/create-tag.transaction.script";
import { CreateTagDto } from "./dtos/create-tag.dto";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { CreateTagSwagger } from "./create-tag.swagger";

@Controller("tags")
export class CreateTagAction {
  constructor(private readonly createTagTS: CreateTagTransactionScript) {}

  @Post()
  @ProtectedAction(CreateTagSwagger)
  async createTag(
    @Body() createTagDto: CreateTagDto,
    @GetAuthUser("userId") userId: number
  ) {
    return this.createTagTS.apply({ ...createTagDto, userId });
  }
}
