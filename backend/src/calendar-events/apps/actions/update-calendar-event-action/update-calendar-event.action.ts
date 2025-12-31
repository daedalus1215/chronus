import { Put, Body, Param, Controller, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CalendarEventService } from '../../../domain/services/calendar-event.service';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateCalendarEventSwagger } from './update-calendar-event.swagger';
import { UpdateCalendarEventRequestDto } from './dtos/requests/update-calendar-event.dto';
import { UpdateCalendarEventCommand } from '../../../domain/transaction-scripts/update-calendar-event-TS/update-calendar-event.command';
import { CalendarEventResponseDto } from '../../dtos/responses/calendar-event.response.dto';

@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
@ApiTags('Calendar Events')
@ApiBearerAuth()
export class UpdateCalendarEventAction {
  constructor(
    private readonly calendarEventService: CalendarEventService,
  ) {}

  @Put(':id')
  @ProtectedAction(UpdateCalendarEventSwagger)
  async apply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCalendarEventRequestDto,
    @GetAuthUser() user: AuthUser,
  ): Promise<CalendarEventResponseDto> {
    const command: UpdateCalendarEventCommand = {
      eventId: id,
      title: dto.title,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      user,
    };
    const event = await this.calendarEventService.updateCalendarEvent(command);
    return new CalendarEventResponseDto(event);
  }
}

