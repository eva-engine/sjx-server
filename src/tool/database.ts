import { createPool } from "mysql2/promise";

import config from "../secret.json";

export const pool = createPool({
  ...config,
  charset: 'utf8'
});