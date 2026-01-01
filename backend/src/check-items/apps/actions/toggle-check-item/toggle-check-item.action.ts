import { Controller, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { ToggleCheckItemSwagger } from "./toggle-check-item.swagger";
import { GetAuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";
import { AuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";
import { CheckItem } from "src/check-items/domain/entities/check-item.entity";
import { CheckItemService } from "src/check-items/domain/services/check-item.service";

@Controller("check-items")
export class ToggleCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Patch("/items/:id/toggle/notes/:noteId")
  @ProtectedAction(ToggleCheckItemSwagger)
  async apply(
    @Param("id", ParseIntPipe) id: number,
    @Param("noteId", ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.checkItemService.toggleCheckItem(id, noteId, authUser);
  } 
} 