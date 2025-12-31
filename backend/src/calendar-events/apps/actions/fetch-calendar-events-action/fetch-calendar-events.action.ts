import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CalendarEventService } from '../../../domain/services/calendar-event.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FetchCalendarEventsSwagger } from './fetch-calendar-events.swagger';
import { FetchCalendarEventsRequestDto } from './dtos/requests/fetch-calendar-events.dto';
import { FetchCalendarEventsCommand } from '../../../domain/transaction-scripts/fetch-calendar-events-TS/fetch-calendar-events.command';
import { CalendarEventResponseDto } from '../../dtos/responses/calendar-event.response.dto';

@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar Events')
@ApiBearerAuth()
export class FetchCalendarEventsAction {
  constructor(
    private readonly calendarEventService: CalendarEventService,
  ) {}

  @Get()
  @ProtectedAction(FetchCalendarEventsSwagger)
  async apply(
    @Query() dto: FetchCalendarEventsRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<CalendarEventResponseDto[]> {
    const command: FetchCalendarEventsCommand = {
      userId: user.userId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      user,
    };
    const events = await this.calendarEventService.fetchCalendarEvents(command);
    return events.map((event) => new CalendarEventResponseDto(event));
  }
}

