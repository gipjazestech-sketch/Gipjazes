const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
    const projectRef = 'lrvfemrratrhkxoveood';
    const pass = '0916samgold$22';
    const encodedPass = encodeURIComponent(pass);

    // We will test the most likely regions first
    const regions = [
        'eu-central-1', // Frankfurt (Identified by IP)
        'eu-west-1',    // Ireland
        'us-east-1',    // N. Virginia
        'us-west-1',    // N. California
        'ap-southeast-1', // Singapore
        'us-east-2',    // Ohio
        'eu-west-2',    // London
        'eu-west-3',    // Paris
    ];

    // Supabase can use aws-0 or aws-1
    const subdomains = ['aws-0', 'aws-1'];

    console.log('🔍 Searching for your project region (this might take a few seconds)...');

    for (const region of regions) {
        for (const subdomain of subdomains) {
            const poolerHost = `${subdomain}-${region}.pooler.supabase.com`;
            const connectionString = `postgresql://postgres.${projectRef}:${encodedPass}@${poolerHost}:6543/postgres`;

            const client = new Client({
                connectionString: connectionString,
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 5000,
            });

            try {
                await client.connect();
                console.log(`✅ SUCCESS! Found your project in ${region} (${subdomain})`);

                // Initialize database
                const schemaPath = path.join(__dirname, '../../database/schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                console.log('🚀 Creating tables...');
                await client.query(schema);

                // Update .env
                console.log('📝 Updating apps/api/.env...');
                const envPath = path.join(__dirname, '.env');
                let envContent = fs.readFileSync(envPath, 'utf8');
                envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${connectionString}`);
                fs.writeFileSync(envPath, envContent);

                await client.end();
                console.log('✨ Setup Complete!');
                console.log('You can now run: npm run dev');
                return;
            } catch (err) {
                // If it's a "Tenant not found" or "Timeout", just try next one
                // console.log(`   - Tried ${region} (${subdomain}): ${err.message}`);
                try { await client.end(); } catch (e) { }
            }
        }
    }

    console.error('\n❌ Could not find your project automatically.');
    console.log('Please check your Supabase dashboard (Project Settings -> Database) for the "Transaction Pooler" hostname.');
}

setup();
