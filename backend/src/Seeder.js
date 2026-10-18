import dns from 'node:dns';
import dotenv from 'dotenv';
import { runIdempotentSeed } from './seederService.js';

dotenv.config();

// Match server.js: use alternate resolvers when the network blocks SRV lookups.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()).filter(Boolean));
}

export async function seedDatabase(mongoUri) {
  return await runIdempotentSeed(mongoUri);
}

// Auto-run when file is executed directly with Node
if (process.argv[1] && /seeder\.js$/i.test(process.argv[1])) {
  runIdempotentSeed()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
