import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { AudioDownloadResult } from '../../dtos/responses/audio.response.dto';

@Injectable()
export class DownloadAudioResponder {
  apply(result: AudioDownloadResult, res: Response): void {
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', result.contentDisposition);
    res.send(result.data);
  }
}
