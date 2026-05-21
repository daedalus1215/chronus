import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { UpdatePlaybackPositionDto } from './dtos/requests/update-playback-position.dto';
import { UpdatePlaybackPositionSwagger } from './update-playback-position.swagger';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class UpdatePlaybackPositionAction {
  constructor(private readonly audioService: AudioService) {}

  @Patch(':audioId/playback-position')
  @HttpCode(204)
  @ProtectedAction(UpdatePlaybackPositionSwagger)
  async execute(
    @GetAuthUser('userId') userId: number,
    @Param('audioId', ParseIntPipe) audioId: number,
    @Body() body: UpdatePlaybackPositionDto
  ): Promise<void> {
    await this.audioService.updatePlaybackPosition(
      audioId,
      body.positionSeconds,
      userId
    );
  }
}
