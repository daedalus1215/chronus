import { Controller, Delete, Param, ParseIntPipe } from "@nestjs/common";
import { ProtectedAction } from "src/time-tracks/apps/decorators/protected-action.decorator";
import { DeleteCheckItemSwagger } from "./delete-check-item.swagger";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CheckItemService } from "src/check-items/domain/services/check-item.service";

@Controller("check-items")
export class DeleteCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Delete("/items/:id")
  @ProtectedAction(DeleteCheckItemSwagger)
  async apply(
    @Param("id", ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<void> {
    return await this.checkItemService.deleteCheckItem(id, authUser);
  }
}