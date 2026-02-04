import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let pool: any;

const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

if (rawConnectionString) {
    let connectionString = rawConnectionString.replace(/['"]/g, '').trim();
    connectionString = connectionString.replace(/[^\x21-\x7E]/g, '');

    console.log(`[DB] Testing connection string compatibility...`);

    let poolConfig: any = null;

    try {
        // Test if native URL parser likes this string
        new URL(connectionString);
        poolConfig = {
            connectionString,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 10000,
        };
        console.log('[DB] URL is valid for native parser.');
    } catch (err: any) {
        console.warn('[DB] Native URL parser rejected string. Falling back to manual parse.');

        // Manual Regex Parse for "postgres://user:pass@host:port/database"
        const regex = /postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
        const match = connectionString.match(regex);

        if (match) {
            const [_, user, password, host, port, database] = match;
            poolConfig = {
                user: decodeURIComponent(user),
                password: decodeURIComponent(password),
                host: host,
                port: port ? parseInt(port) : 5432,
                database: database.split('?')[0], // Remove query params
                ssl: isProduction ? { rejectUnauthorized: false } : false,
                connectionTimeoutMillis: 10000,
            };
            console.log('[DB] Manual parse successful.');
        } else {
            console.error('[DB] CRITICAL: Connection string does not match postgres pattern.');
        }
    }

    if (poolConfig) {
        try {
            pool = new Pool(poolConfig);

            // Verify connection
            pool.query('SELECT 1').then(() => {
                console.log('📦 Database Connection Verified');
            }).catch((err: any) => {
                console.error('❌ Database Query Failure:', err.message);
            });

            pool.on('error', (err: any) => {
                console.error('❌ Unexpected error on idle client:', err.message);
            });
        } catch (poolErr: any) {
            console.error('[DB] Failed to create pool with config:', poolErr.message);
            pool = null;
        }
    }
} else {
    console.warn('⚠️ No database connection string found.');
}

export { pool };
export default pool;
