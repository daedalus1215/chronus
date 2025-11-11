import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { GetCheckItemSwagger } from "./get-check-item.swagger";
import { GetAuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { AuthUser } from "src/auth/app/decorators/get-auth-user.decorator";
import { CheckItem } from "src/check-items/domain/entities/check-item.entity";
import { CheckItemService } from "src/check-items/domain/services/check-item.service";

@Controller("check-items")
export class GetCheckItemAction {
  constructor(private readonly checkItemService: CheckItemService) {}

  @Get("/items/:id")
  @ProtectedAction(GetCheckItemSwagger)
  async apply(
    @Param("id", ParseIntPipe) id: number,
    @GetAuthUser() authUser: AuthUser
  ): Promise<CheckItem> {
    return await this.checkItemService.getCheckItem(id, authUser);
  }
} 