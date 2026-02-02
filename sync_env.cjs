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
            console.log(`Adding ${key} to Vercel...`);
            try {
                // Add env to production
                execSync(`npx vercel env add ${key} production`, { input: value + '\n', stdio: 'inherit' });
            } catch (e) {
                console.warn(`Could not add ${key}: ${e.message}`);
            }
        }
    }
}
