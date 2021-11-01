import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: '47.93.8.254',
  user: 'root',
  password: 'aspsnd',
  database: 'sjx',
  charset: 'utf8'
});