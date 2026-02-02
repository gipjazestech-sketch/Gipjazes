import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
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
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
}

export { pool };
export default pool;
