require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

const seedContests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codesync';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB for seeding contests.');

    // Fetch existing problems to link
    const twoSum = await Problem.findOne({ title: 'Two Sum' });
    const revInt = await Problem.findOne({ title: 'Reverse Integer' });
    const median = await Problem.findOne({ title: 'Median of Two Sorted Arrays' });

    const problemIds = [];
    if (twoSum) problemIds.push(twoSum._id);
    if (revInt) problemIds.push(revInt._id);
    if (median) problemIds.push(median._id);

    // Clear existing
    await Contest.deleteMany({});
    console.log('Cleared existing contests.');

    // Seed one active contest
    const activeContest = await Contest.create({
      title: 'CodeSync Weekly Warmup #1',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600 * 1000 * 2), // 2 hours duration
      problems: problemIds.slice(0, 2), // Two Sum & Reverse Integer
      leaderboard: [],
    });

    // Seed one upcoming contest
    const upcomingContest = await Contest.create({
      title: 'CodeSync Grand Master Cup',
      startTime: new Date(Date.now() + 3600 * 1000 * 24 * 3), // Starts in 3 days
      endTime: new Date(Date.now() + 3600 * 1000 * 24 * 3 + 3600 * 1000 * 4), // 4 hours duration
      problems: problemIds,
      leaderboard: [],
    });

    console.log('Seeded contests successfully.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Contest seeding failed:', error);
    process.exit(1);
  }
};

seedContests();
