require('dotenv').config();

const mongoose = require('mongoose');
const config = require('../src/config');
const User = require('../src/models/User');

async function run() {
  await mongoose.connect(config.mongoUri);

  const result = await User.updateMany(
    { role: 'moderator' },
    { $set: { role: 'learner' } },
    { runValidators: false },
  );

  console.log(
    `Migrated ${result.modifiedCount || 0} moderator user(s) to learner.`,
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
