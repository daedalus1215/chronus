import {
  Controller,
  Get,
  Options,
  Param,
  ParseIntPipe,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { AudioStreamingService } from '../../../domain/services/audio-streaming.service';

@Controller('audio')
@UseGuards(JwtAuthGuard)
@ApiTags('audio')
export class StreamAudioAction {
  constructor(private readonly audioStreamingService: AudioStreamingService) {}

  @Get('stream/:audioId')
  @ProtectedAction({
    tag: 'audio',
    summary:
      'Stream audio file with range request support - Streams the audio file with HTTP Range request support for seeking. Audio is cached from Hermes on first request.',
  })
  @ApiParam({
    name: 'audioId',
    type: 'number',
    description: 'ID of the audio file to stream',
  })
  @ApiResponse({
    status: 200,
    description: 'Full audio file content',
    content: {
      'audio/wav': {},
      'audio/mpeg': {},
      'audio/ogg': {},
    },
  })
  @ApiResponse({
    status: 206,
    description: 'Partial audio content (range request)',
    content: {
      'audio/wav': {},
      'audio/mpeg': {},
      'audio/ogg': {},
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this audio',
  })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  async execute(
    @GetAuthUser('userId') userId: number,
    @Param('audioId', ParseIntPipe) audioId: number,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const rangeHeader = req.headers.range;
    await this.audioStreamingService.streamAudio(
      audioId,
      userId,
      rangeHeader,
      res
    );
  }
}
