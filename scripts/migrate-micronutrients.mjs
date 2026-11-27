/**
 * Idempotent migration script for additive micronutrient & workout caloriesBurned fields.
 * Run with: node scripts/migrate-micronutrients.mjs
 * Safe to run multiple times; never deletes or overwrites existing user data.
 */
import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^MONGODB_URI=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

async function main() {
  const uri = loadEnvUri();
  if (!uri) {
    console.error('MONGODB_URI not found in environment or .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const dietResult = await db.collection('dietlogs').updateMany(
    { totalMicronutrients: { $exists: false } },
    {
      $set: {
        totalMicronutrients: {
          fiber_g: 0,
          iron_mg: 0,
          calcium_mg: 0,
          vitaminC_mg: 0,
          vitaminD_mcg: 0,
          vitaminB12_mcg: 0,
          potassium_mg: 0,
          sodium_mg: 0,
        },
      },
    }
  );

  const sessionResult = await db.collection('workoutsessions').updateMany(
    { caloriesBurned: { $exists: false } },
    { $set: { caloriesBurned: 0 } }
  );

  console.log(
    `Migration complete. DietLogs updated: ${dietResult.modifiedCount}, WorkoutSessions updated: ${sessionResult.modifiedCount}`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
