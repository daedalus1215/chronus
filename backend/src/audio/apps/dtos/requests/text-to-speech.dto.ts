import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from 'class-validator';

export class TextToSpeechRequestDto {
  @ApiProperty({description: 'Text to be converted to speech'})
  @IsString()
  text: string;

  @ApiProperty({description: 'ID of the asset associated with the audio'})
  @IsNumber()
  assetId: number;
}

export class TextToSpeechResponseDto {
  file_path: string;
}
