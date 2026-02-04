import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (rawConnectionString) {
    // 1. Clean the database URL: remove quotes, spaces, and NON-PRINTABLE characters (common in bad env copies)
    let connectionString = rawConnectionString.replace(/['"]/g, '').trim();
    connectionString = connectionString.replace(/[^\x21-\x7E]/g, ''); // Keep only printable ASCII, no spaces

    // 2. Validate basic structure
    if (!connectionString.includes('://')) {
        console.error(`[DB] ERROR: Connection string missing protocol.`);
        throw new Error(`Cloud DB connection string is malformed (missing ://).`);
    }

    console.log(`[DB] Initializing pool (Length: ${connectionString.length})`);

    try {
        pool = new Pool({
            connectionString,
            ssl: isProduction ? {
                rejectUnauthorized: false
            } : false,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
        });

        // Test connection immediately to trigger the "Invalid URL" error here if any
        pool.query('SELECT 1').then(() => {
            console.log('📦 Database Connection Verified');
        }).catch((err: any) => {
            console.error('❌ Database Query Failure:', err.message);
        });

    } catch (err: any) {
        console.error('[DB] CRITICAL: Pool constructor failed:', err.message);
        // We set pool to null so index.ts knows it failed
        pool = null;
        throw err;
    }

    pool.on('error', (err: any) => {
        console.error('❌ Unexpected error on idle client:', err.message);
    });
} else {
    console.warn('⚠️ No database connection string found.');
}

export { pool };
export default pool;
