const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps/api/.env');
if (!fs.existsSync(envPath)) {
    console.error('No .env found at', envPath);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
        const [key, ...valParts] = line.split('=');
        const value = valParts.join('=');
        if (key && value) {
            console.log(`Syncing ${key} to Vercel...`);
            try {
                // Remove if exists to avoid interactive prompt
                try {
                    execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
                } catch (e) { }

                // Add env to production
                execSync(`npx vercel env add ${key} production`, { input: value.trim() + '\n', stdio: 'inherit' });
            } catch (e) {
                console.warn(`Could not sync ${key}: ${e.message}`);
            }
        }
    }
}
