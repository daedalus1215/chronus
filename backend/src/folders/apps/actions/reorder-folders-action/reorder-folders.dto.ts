import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

class ReorderFolderItemDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderFoldersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderFolderItemDto)
  items: ReorderFolderItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
