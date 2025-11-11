import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CheckItem } from "src/check-items/domain/entities/check-item.entity";
import { CheckItemService } from "src/check-items/domain/services/check-item.service";
import { GetCheckItemsByNoteSwagger } from "./get-check-items-by-note.swagger";

@Controller("check-items")
export class GetCheckItemsByNoteAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Get("notes/:noteId")
  @ProtectedAction(GetCheckItemsByNoteSwagger)
  async apply(
    @Param("noteId", ParseIntPipe) noteId: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem[]> {
    return await this.checkItemService.getCheckItemsByNoteId(noteId, authUser);
  }
} 