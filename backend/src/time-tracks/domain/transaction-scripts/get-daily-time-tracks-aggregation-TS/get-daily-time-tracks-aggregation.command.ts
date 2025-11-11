import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type GetDailyTimeTracksAggregationCommand = {
  user: AuthUser;
  date?: string;
}; 