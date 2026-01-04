import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { AudioService } from 'src/audio/domain/services/audio.service';
import { DownloadAudioSwagger } from './download-audio.swagger';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';

@Controller('audio')
@UseGuards(JwtAuthGuard)
export class DownloadAudioAction {
  constructor(private readonly audioService: AudioService) {}

  @Get('download/:assetId')
  @ProtectedAction(DownloadAudioSwagger)
  async execute(
    @GetAuthUser('userId') userId: number,
    @Param('assetId') assetId: string,
    @Res() res: Response
  ) {
    const { data, headers } = await this.audioService.downloadAudio(
      userId,
      assetId
    );

    res.setHeader('Content-Type', headers['content-type'] || 'audio/wav');
    res.setHeader(
      'Content-Disposition',
      headers['content-disposition'] || `attachment; filename="${assetId}.wav"`
    );

    res.send(data);
  }
}
