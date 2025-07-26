import { AuthUser } from 'src/auth/app/decorators/get-auth-user.decorator';

export type GetTimeTracksAggregationCommand = {
  user: AuthUser;
  date?: string;
}; 