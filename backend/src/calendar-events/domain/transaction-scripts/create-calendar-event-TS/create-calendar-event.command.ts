import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type CreateCalendarEventCommand = {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  user: AuthUser;
};

