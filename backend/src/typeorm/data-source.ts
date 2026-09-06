import 'dotenv/config';
import { DataSource } from 'typeorm';
import { configurePgDateParser } from '../bootstrap/configure-pg-date-parser';

configurePgDateParser();

// Must describe the same database as app.module.ts, or generated migrations
// will not match what the app actually talks to.
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
