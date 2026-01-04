import { IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class ReorderCheckItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  checkItemIds: number[];
}
