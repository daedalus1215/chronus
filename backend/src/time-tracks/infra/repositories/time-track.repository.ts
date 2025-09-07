import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { TimeTrack } from "../../domain/entities/time-track-entity/time-track.entity";

@Injectable()
export class TimeTrackRepository {
  constructor(
    @InjectRepository(TimeTrack)
    private readonly repository: Repository<TimeTrack>
  ) {}

  async create(timeTrack: Partial<TimeTrack>): Promise<TimeTrack> {
    const newTimeTrack = this.repository.create(timeTrack);
    return this.repository.save(newTimeTrack);
  }

  async findByUserId(userId: number): Promise<TimeTrack[]> {
    return this.repository.find({
      where: { userId },
      order: { date: "DESC", startTime: "DESC" },
    });
  }

  async findByUserIdAndNoteId(
    userId: number,
    noteId: number
  ): Promise<TimeTrack[]> {
    return this.repository.find({
      where: { userId, noteId },
      order: { date: "DESC", startTime: "DESC" },
    });
  }

  async findById(id: number): Promise<TimeTrack | null> {
    return this.repository.findOne({ where: { id } });
  }

  async getTotalTimeForNote(userId: number, noteId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("timeTrack")
      .select("SUM(timeTrack.durationMinutes)", "total")
      .where("timeTrack.userId = :userId", { userId })
      .andWhere("timeTrack.noteId = :noteId", { noteId })
      .getRawOne();

    return result?.total || 0;
  }

  async getDailyTotal(userId: number, date: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("timeTrack")
      .select("SUM(timeTrack.durationMinutes)", "total")
      .where("timeTrack.userId = :userId", { userId })
      .andWhere("timeTrack.date = :date", { date })
      .getRawOne();

    return result?.total || 0;
  }

  async deleteByIdAndUserId(id: number, userId: number): Promise<boolean> {
    const result = await this.repository.delete({ id, userId });
    return result.affected > 0;
  }

  async getDailyTimeTracksAggregation(
    userId: number,
    date: string
  ): Promise<
    Array<{
      noteId: number;
      totalTimeMinutes: number;
      dailyTimeMinutes: number;
      mostRecentStartTime: string;
      mostRecentDate: string;
    }>
  > {
    const aggregations = await this.repository
      .createQueryBuilder("timeTrack")
      .select([
        "timeTrack.noteId as noteId",
        "SUM(timeTrack.durationMinutes) as totalTimeMinutes",
        "SUM(CASE WHEN timeTrack.date = :date THEN timeTrack.durationMinutes ELSE 0 END) as dailyTimeMinutes",
        "MAX(CASE WHEN timeTrack.date = :date THEN timeTrack.startTime END) as mostRecentStartTime",
        "MAX(CASE WHEN timeTrack.date = :date THEN timeTrack.date END) as mostRecentDate",
      ])
      .where("timeTrack.userId = :userId", { userId })
      .groupBy("timeTrack.noteId")
      .having(
        "SUM(CASE WHEN timeTrack.date = :date THEN timeTrack.durationMinutes ELSE 0 END) > 0",
        { date }
      )
      .orderBy("mostRecentDate", "DESC")
      .addOrderBy("mostRecentStartTime", "DESC")
      .getRawMany();

    return aggregations.map((agg) => ({
      noteId: parseInt(agg.noteId),
      totalTimeMinutes: parseInt(agg.totalTimeMinutes) || 0,
      dailyTimeMinutes: parseInt(agg.dailyTimeMinutes) || 0,
      mostRecentStartTime: agg.mostRecentStartTime,
      mostRecentDate: agg.mostRecentDate,
    }));
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  }

  async getWeeklyMostActiveNote(userId: number): Promise<{
    noteId: number;
    totalTimeMinutes: number;
    weekStartDate: string;
    weekEndDate: string;
  } | null> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const result = await this.repository
      .createQueryBuilder("timeTrack")
      .select([
        "timeTrack.noteId as 'noteId'",
        "SUM(timeTrack.durationMinutes) as 'totalTimeMinutes'",
        "MIN(timeTrack.date) as 'weekStartDate'",
        "MAX(timeTrack.date) as 'weekEndDate'",
      ])
      .where("timeTrack.userId = :userId", { userId })
      .andWhere("timeTrack.date BETWEEN :startDate AND :endDate", {
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: endOfWeek.toISOString().split("T")[0],
      })
      .groupBy("timeTrack.noteId")
      .orderBy("totalTimeMinutes", "DESC")
      .limit(1)
      .getRawOne();

    if (!result) return null;

    return {
      noteId: parseInt(result.noteId),
      totalTimeMinutes: parseInt(result.totalTimeMinutes),
      weekStartDate: result.weekStartDate,
      weekEndDate: result.weekEndDate,
    };
  }
}
