import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { TextToSpeechRequestDto } from '../../dtos/requests/text-to-speech.dto';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TextToSpeechSwagger } from './text-to-speech.swagger';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class TextToSpeechAction {
  constructor(private readonly audioService: AudioService) {}

  @Post('text-to-speech')
  @ProtectedAction(TextToSpeechSwagger)
  async execute(@Body() request: TextToSpeechRequestDto, @GetAuthUser('userId') userId) {
    return this.audioService.convertTextToSpeech({...request, userId});
  }
}
