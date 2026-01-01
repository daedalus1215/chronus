import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

/**
 * Command for deleting a calendar event.
 */
export type DeleteCalendarEventCommand = {
  eventId: number;
  user: AuthUser;
};

