import { Get, Param, Controller, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CalendarEventService } from '../../../domain/services/calendar-event.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FetchCalendarEventSwagger } from './fetch-calendar-event.swagger';
import { FetchCalendarEventCommand } from '../../../domain/transaction-scripts/fetch-calendar-event-TS/fetch-calendar-event.command';
import { CalendarEventResponseDto } from '../../dtos/responses/calendar-event.response.dto';

@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar Events')
@ApiBearerAuth()
export class FetchCalendarEventAction {
  constructor(
    private readonly calendarEventService: CalendarEventService,
  ) {}

  @Get(':id')
  @ProtectedAction(FetchCalendarEventSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthUser() user: AuthUser,
  ): Promise<CalendarEventResponseDto> {
    const command: FetchCalendarEventCommand = {
      eventId: id,
      user,
    };
    const event = await this.calendarEventService.fetchCalendarEventById(command);
    return new CalendarEventResponseDto(event);
  }
}

