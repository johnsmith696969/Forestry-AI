// backend/cron.js
import { exec } from 'child_process';

exec('node fetchAndEmbed.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Cron job failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ Stderr: ${stderr}`);
    return;
  }
  console.log(`📦 Cron job success:\n${stdout}`);
});
