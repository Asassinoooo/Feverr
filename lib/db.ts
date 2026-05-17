import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_STRING,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export { pool };
export default pool;