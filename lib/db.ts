import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export { pool };
export default pool;