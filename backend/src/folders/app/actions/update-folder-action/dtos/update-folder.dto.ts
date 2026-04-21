import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  parentId?: number | null;
}
