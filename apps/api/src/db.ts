import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// 1. Get the raw connection string
const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

let poolConfig: any = null;

if (rawConnectionString) {
    let connectionString = rawConnectionString.replace(/['"]/g, '').trim();
    connectionString = connectionString.replace(/[^\x21-\x7E]/g, '');

    try {
        // Try to validate with native URL parser
        new URL(connectionString);
        poolConfig = {
            connectionString,
            ssl: (isProduction || connectionString.includes('supabase')) ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 10000,
        };
    } catch (err) {
        // Manual Parse Fallback
        try {
            const protocolPart = connectionString.split('://');
            const rest = protocolPart[1];
            const lastAtIndex = rest.lastIndexOf('@');

            if (lastAtIndex !== -1) {
                const credentials = rest.substring(0, lastAtIndex);
                const hostAndDb = rest.substring(lastAtIndex + 1);
                const [user, password] = credentials.split(':');
                const [hostPort, databasePart] = hostAndDb.split('/');
                const [host, port] = hostPort.split(':');

                poolConfig = {
                    user: decodeURIComponent(user),
                    password: decodeURIComponent(password || ''),
                    host: host,
                    port: port ? parseInt(port) : 5432,
                    database: databasePart ? databasePart.split('?')[0] : 'postgres',
                    ssl: (isProduction || host.includes('supabase')) ? { rejectUnauthorized: false } : false,
                    connectionTimeoutMillis: 10000,
                };
            }
        } catch (e) {
            console.error('[DB] Manual parse failure');
        }
    }
}

// 2. Initialize the pool
let sharedPool: Pool;

function getPool(): Pool {
    if (!sharedPool) {
        sharedPool = poolConfig
            ? new Pool(poolConfig)
            : new Pool({ connectionString: 'postgres://invalid:invalid@localhost:5432/invalid' });

        if (poolConfig) {
            sharedPool.query('SELECT 1')
                .then(() => console.log('📦 Database Connected and Verified'))
                .catch(err => console.error('❌ Database Connection Error:', err.message));

            sharedPool.on('error', (err: any) => {
                console.error('❌ Unexpected DB error:', err.message);
            });
        }
    }
    return sharedPool;
}

export const pool = getPool();
export default pool;
