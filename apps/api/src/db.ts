import { Pool } from 'pg';

let pool: any;

// Use a fallback to prevent "Cannot read properties of undefined (reading 'query')"
const mockPool = {
    query: async () => ({ rows: [] }),
    on: () => { },
    connect: async () => ({ release: () => { } })
};

try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        pool.on('error', (err: any) => {
            console.error('Unexpected error on idle client', err);
        });
    } else {
        console.warn('DATABASE_URL is not defined. Queries will use mock data.');
        pool = mockPool;
    }
} catch (error) {
    console.error('Failed to initialize postgres pool:', error);
    pool = mockPool;
}

export { pool };
export default pool;
