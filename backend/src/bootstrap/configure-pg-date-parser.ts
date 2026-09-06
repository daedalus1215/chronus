import { types } from 'pg';

/** Postgres OID for `date` (a calendar day, with no time and no zone). */
const PG_OID_DATE = 1082;

/**
 * Keeps `date` columns as 'YYYY-MM-DD' strings instead of JavaScript Dates.
 *
 * node-postgres parses a `date` column into a Date at midnight, which is wrong twice over
 * for this app:
 *
 *   1. A Date is an *instant*. `time_track.date` is a calendar day on purpose (see the
 *      comment on the entity, and D22) — turning it into an instant invents a timezone,
 *      and `.toISOString()` can then report the previous day.
 *   2. Entities declare `date: string`, and every raw query compares it as a string.
 *      `getRawMany()` bypasses TypeORM's hydration and returns the driver's value, so a
 *      Date key silently fails every `map.get('2026-09-06')` lookup. That is not an error:
 *      the weekly trend simply rendered every day as 0.
 *
 * SQLite stored these as TEXT, so string is also what the code was always written against.
 *
 * ⚠️ Must run before the first query. It is a process-wide setting on the pg driver, which
 * is why it lives here and not in a module.
 */
export const configurePgDateParser = (): void => {
  types.setTypeParser(PG_OID_DATE, (value: string) => value);
};
