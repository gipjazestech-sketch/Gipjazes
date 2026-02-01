import { Pool } from 'pg';

let pool: any;

try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        // Add error listener to prevent process exit
        pool.on('error', (err: any) => {
            console.error('Unexpected error on idle client', err);
        });
    } else {
        console.warn('DATABASE_URL is not defined. Queries will fail.');
    }
} catch (error) {
    console.error('Failed to initialize postgres pool:', error);
}

export { pool };
export default pool;
