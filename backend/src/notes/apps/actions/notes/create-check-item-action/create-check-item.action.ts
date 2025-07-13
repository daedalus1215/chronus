import { Controller, Post, Body, Param, ParseIntPipe } from "@nestjs/common";
import { CreateCheckItemDto } from "../../../dtos/requests/create-check-item.dto";
import { ProtectedAction } from "src/time-tracks/apps/decorators/protected-action.decorator";
import { CreateCheckItemSwagger } from "./create-check-item.swagger";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CheckItem } from "src/notes/domain/entities/notes/check-item.entity";
import { CheckItemService } from "src/notes/domain/services/check-item.service";

@Controller("notes")
export class CreateCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Post(":noteId/check-items")
  @ProtectedAction(CreateCheckItemSwagger)
  async apply(
    @Body() createCheckItemDto: CreateCheckItemDto,
    @Param("noteId", ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem[]> {
    return await this.checkItemService.createCheckItem({
      checkItem: createCheckItemDto,
      authUser,
      noteId,
    });
  }
}
