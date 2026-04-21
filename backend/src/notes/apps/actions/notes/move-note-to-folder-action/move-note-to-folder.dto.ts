import { IsNumber, IsOptional } from 'class-validator';

export class MoveNoteToFolderDto {
  @IsNumber()
  @IsOptional()
  folderId: number | null;
}
