import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type UpdateCalendarEventCommand = {
  eventId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  user: AuthUser;
};

