import { IsNumber } from "class-validator";

export class RemoveTagFromNoteDto {
  @IsNumber()
  noteId: number;

  @IsNumber()
  tagId: string;
}