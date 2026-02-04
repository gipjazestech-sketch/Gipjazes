import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (rawConnectionString) {
    // 1. Clean the database URL to remove potential quoting or whitespace issues
    let connectionString = rawConnectionString.replace(/['"]/g, '').trim();

    // 2. Validate it looks like a URL
    if (!connectionString.includes('://')) {
        console.error(`[DB] ERROR: DATABASE_URL does not contain a protocol (://). Found: ${connectionString.substring(0, 15)}...`);
        // We throw here so the error handler in the routes can catch it
        throw new Error(`Cloud DB connection string is malformed (missing protocol). Please check your environment variables.`);
    }

    console.log(`[DB] Connecting to database (Protocol: ${connectionString.split('://')[0]})`);

    try {
        pool = new Pool({
            connectionString,
            ssl: isProduction ? {
                rejectUnauthorized: false
            } : false,
            // Add some timeouts to prevent hanging
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 30000,
        });

        // Test connection immediately
        pool.query('SELECT 1').then(() => {
            console.log('📦 Database Connection Verified');
        }).catch((err: any) => {
            console.error('❌ Database Verification Failed:', err.message);
        });

    } catch (err: any) {
        console.error('[DB] Pool Creation Error:', err.message);
        throw err;
    }

    pool.on('error', (err: any) => {
        console.error('❌ Unexpected error on idle client', err.message);
    });
} else {
    console.warn('⚠️ No database connection string found (DATABASE_URL/POSTGRES_URL). Database operations will fail.');
}

export { pool };
export default pool;
