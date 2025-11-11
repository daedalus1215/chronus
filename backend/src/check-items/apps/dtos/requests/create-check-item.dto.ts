import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCheckItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
} 