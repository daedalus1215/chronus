import { Body, Controller, Delete, Param, ParseIntPipe, Post } from "@nestjs/common";
import { RemoveTagFromNoteDto } from "./dtos/requests/remove-tag-from-note.dto";
import { RemoveTagFromNoteTransactionScript } from "src/tags/domain/transaction-scripts/remove-tag-from-note/remove-tag-from-note.transaction.script";
import { ProtectedAction } from "src/shared-kernel/apps/decorators/protected-action.decorator";
import { GetAuthUser } from "src/shared-kernel/apps/decorators/get-auth-user.decorator";
import { RemoveTagFromNoteSwagger } from "./swagger/remove-tag-from-note.swagger";

@Controller("tags")
export class RemoveTagFromNoteAction {
  constructor(private readonly transactionScript: RemoveTagFromNoteTransactionScript) {}

  @Delete(":tagId/remove-from-note/notes/:noteId")
  @ProtectedAction(RemoveTagFromNoteSwagger)
  async execute(
    @Param("tagId", ParseIntPipe) tagId: number,
    @Param("noteId", ParseIntPipe) noteId: number,
    @GetAuthUser("userId") userId: number
  ): Promise<{ success: boolean }> {
    await this.transactionScript.apply(tagId, noteId, userId);
    return { success: true };
  }
}