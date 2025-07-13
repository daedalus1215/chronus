import { Controller, Patch, Body, Param, ParseIntPipe } from "@nestjs/common";
import { UpdateCheckItemDto } from "../../dtos/requests/update-check-item.dto";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { UpdateCheckItemSwagger } from "./update-check-item.swagger";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CheckItem } from "src/check-items/domain/entities/check-item.entity";
import { CheckItemService } from "src/check-items/domain/services/check-item.service";

@Controller("check-items")
export class UpdateCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Patch("/items/:id")
  @ProtectedAction(UpdateCheckItemSwagger)
  async apply(
    @Body() dto: UpdateCheckItemDto,
    @Param("id", ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.checkItemService.updateCheckItem(id, dto, authUser);
  }
}