import { ArrayMinSize, IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class BulkReparentFoldersDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsInt({ each: true })
  @Min(1, { each: true })
  folderIds: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
