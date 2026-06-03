require('dotenv').config();
const dbConnect = require('./config/database');
const mongoose = require('mongoose');
const Catagory = require('./models/Catagory');

const categories = [
  { name: 'Programming', description: 'Courses on software development, languages, and frameworks.' },
  { name: 'Data Science', description: 'Statistics, machine learning, data analysis, and visualization.' },
  { name: 'Design', description: 'UI/UX, graphic design, prototyping, and design systems.' },
  { name: 'Business', description: 'Entrepreneurship, management, finance, and strategy.' },
  { name: 'Mathematics', description: 'Algebra, calculus, discrete math, and applied math.' },
  { name: 'Languages', description: 'Spoken and programming language learning courses.' },
  { name: 'Marketing', description: 'Digital marketing, SEO, content strategy, and analytics.' },
  { name: 'Photography', description: 'Photography techniques, editing, and composition.' },
  { name: 'Health & Fitness', description: 'Wellness, exercise, nutrition, and lifestyle.' },
  { name: 'Personal Development', description: 'Productivity, career skills, and soft skills.' },
];

async function seed() {
  try {
    dbConnect();
    // Wait for mongoose to connect
    await new Promise((resolve, reject) => {
      mongoose.connection.once('open', resolve);
      mongoose.connection.on('error', reject);
    });

    for (const cat of categories) {
      await Catagory.updateOne(
        { name: cat.name },
        { $set: { description: cat.description } },
        { upsert: true }
      );
      console.log(`Upserted category: ${cat.name}`);
    }

    console.log('Category seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
