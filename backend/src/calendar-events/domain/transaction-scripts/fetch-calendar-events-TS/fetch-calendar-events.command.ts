import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type FetchCalendarEventsCommand = {
  userId: number;
  startDate: Date;
  endDate: Date;
  user: AuthUser;
};

