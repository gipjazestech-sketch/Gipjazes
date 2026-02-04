import pool from './apps/api/src/db';

async function checkTables() {
    if (!pool) {
        console.error('No database pool');
        return;
    }
    try {
        const { rows: tables } = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log('Tables found:', tables.map(t => t.tablename));

        if (tables.length === 0) {
            console.log('No tables found in public schema. Database might be empty.');
        } else {
            const userTable = tables.find(t => t.tablename === 'users');
            if (userTable) {
                const { rows: userCount } = await pool.query('SELECT COUNT(*) FROM users');
                console.log(`Users count: ${userCount[0].count}`);
            }
        }
    } catch (err) {
        console.error('Error checking tables:', err);
    } finally {
        process.exit();
    }
}

checkTables();
