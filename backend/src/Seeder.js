import { runIdempotentSeed } from './seederService.js';

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
