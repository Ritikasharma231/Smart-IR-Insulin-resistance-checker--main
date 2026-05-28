/**
 * Remove all admin users so seedAdmin can provision from .env on next startup.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { initDb, run, all } = require('../db');

async function main() {
  await initDb();
  const admins = await all(`SELECT id, email FROM users WHERE role = 'admin'`);
  for (const a of admins) {
    await run('DELETE FROM users WHERE id = ?', [a.id]);
    console.log(`Removed admin: ${a.email} (id ${a.id})`);
  }
  if (!admins.length) console.log('No admin accounts found in database.');
  else console.log(`Provision new admin on next "npm run server" using ADMIN_EMAIL from .env`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
