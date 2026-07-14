import { Controller, Get, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import {
  GetAuthUser,
  AuthUser,
} from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ProtectedAction } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { NotesByYearResponseDto } from '../../dtos/responses/notes-by-year.response.dto';
import { FetchNotesByYearSwagger } from './fetch-notes-by-year.swagger';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class FetchNotesByYearAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Get('/notes-by-year')
  @ProtectedAction(FetchNotesByYearSwagger)
  async apply(@GetAuthUser() user: AuthUser): Promise<NotesByYearResponseDto> {
    return await this.timeTrackService.getNotesByYear({ user });
  }
}
