import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type FetchCalendarEventCommand = {
  eventId: number;
  user: AuthUser;
};

