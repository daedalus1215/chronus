import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';

class ReorderNoteItemDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderNotesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderNoteItemDto)
  items: ReorderNoteItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  folderId?: number | null;
}
