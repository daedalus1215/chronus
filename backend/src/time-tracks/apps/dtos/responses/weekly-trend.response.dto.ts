export type WeeklyTrendDayDto = {
  date: string;
  totalMinutes: number;
};

export type WeeklyTrendResponseDto = {
  trend: WeeklyTrendDayDto[];
  weeklyTotal: number;
};
