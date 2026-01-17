import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateEmailRequestDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
