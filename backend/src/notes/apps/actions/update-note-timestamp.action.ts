import {
  Controller,
  Put,
  Param,
  Patch,
} from "@nestjs/common";
import { NoteMemoTagRepository } from "src/notes/infra/repositories/note-memo-tag.repository";
import { ProtectedAction } from "src/time-tracks/apps/decorators/protected-action.decorator";
import {
  AuthUser,
  GetAuthUser,
} from "src/auth/app/decorators/get-auth-user.decorator";
import { ApiTags } from "@nestjs/swagger";
import { UpdateResult } from "typeorm";

@ApiTags("Notes")
@Controller("notes")
export class UpdateNoteTimestampAction {
  constructor(private readonly noteRepository: NoteMemoTagRepository) {}

  @Patch(":id/timestamp")
  @ProtectedAction({
    summary: "Update note timestamp",
    tag: "Notes",
  })
  async apply(
    @Param("id") id: number,
    @GetAuthUser() user: AuthUser
  ): Promise<UpdateResult> {
    //@TODO: Add valiodation here
    return await this.noteRepository.updateNoteTimestamp(id);
  }
}
