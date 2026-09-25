import { IsBoolean } from 'class-validator';

export class PinNoteDto {
  @IsBoolean()
  pinned: boolean;
}
