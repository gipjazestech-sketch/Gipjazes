import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (rawConnectionString) {
    // Clean the database URL to remove potential quoting or whitespace issues
    const connectionString = rawConnectionString.replace(/['"]/g, '').trim();

    console.log(`[DB] Connecting to database...`);
    // Safe logging: show length and protocol only
    if (connectionString.startsWith('postgres://')) {
        console.log(`[DB] URL Protocol: postgres:// detected. Length: ${connectionString.length}`);
    } else if (connectionString.startsWith('postgresql://')) {
        console.log(`[DB] URL Protocol: postgresql:// detected. Length: ${connectionString.length}`);
    } else {
        console.warn(`[DB] URL does NOT start with standard postgres protocol. First 10 chars: ${connectionString.substring(0, 10)}`);
    }

    pool = new Pool({
        connectionString,
        ssl: isProduction ? {
            rejectUnauthorized: false
        } : false
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
