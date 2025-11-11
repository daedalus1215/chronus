import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateCheckItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 