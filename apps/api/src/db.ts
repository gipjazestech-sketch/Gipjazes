import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

if (process.env.DATABASE_URL) {
    // Clean the database URL to remove potential quoting or whitespace issues
    const connectionString = process.env.DATABASE_URL.replace(/['"]/g, '').trim();

    pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    pool.on('connect', () => {
        console.log('📦 Database Connected');
    });

    pool.on('error', (err: any) => {
        console.error('❌ Unexpected error on idle client', err);
    });
} else {
    console.warn('⚠️ DATABASE_URL is not set. Database operations will fail.');
}

export { pool };
export default pool;
