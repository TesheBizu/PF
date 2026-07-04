require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Experience = require('./models/Experience');


const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Project.deleteMany();
  await Skill.deleteMany();
  await Experience.deleteMany();

  // Seed admin user
  await User.create({
    name: 'Teshome Bizuayehu',
    email: process.env.ADMIN_EMAIL || 'teshelin7@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  });
  console.log('✅ Admin user seeded');

  // Seed skills
  const skills = [
    { name: 'JavaScript', category: 'Programming', proficiency: 88, order: 1 },
    { name: 'Python', category: 'Programming', proficiency: 80, order: 3 },
    { name: 'React', category: 'Frontend', proficiency: 90, order: 4 },
    { name: 'Redux Toolkit', category: 'Frontend', proficiency: 85, order: 5 },
    { name: 'Node.js', category: 'Backend', proficiency: 80, order: 6 },
    { name: 'Express.js', category: 'Backend', proficiency: 82, order: 7 },
    { name: 'REST APIs', category: 'Backend', proficiency: 85, order: 8 },
    { name: 'MongoDB', category: 'Database', proficiency: 78, order: 9 },
    { name: 'Git', category: 'Tools', proficiency: 85, order: 10 },
    { name: 'GitHub', category: 'Tools', proficiency: 85, order: 11 },
    { name: 'Postman', category: 'Tools', proficiency: 80, order: 12 }
  ];
  await Skill.insertMany(skills);
  console.log('✅ Skills seeded');

  // Seed projects
  const projects = [
    {
      title: 'Portfolio Management System',
      description:
        'A full-stack personal portfolio with a React frontend, Node.js/Express backend, and MongoDB database. Features an admin dashboard for managing projects, skills, and contact messages. Secured with JWT authentication.',
      techStack: ['React', 'Redux Toolkit', 'Express.js', 'MongoDB', 'JWT Authentication'],
      githubUrl: 'https://github.com/TesheBizu/PF',
      liveUrl: '',
      featured: true,
      order: 1,
    },
    {
      title: 'Smart Habit Tracker App',
      description:
        'A productivity app that helps users build and track daily habits with streak tracking, progress visualization, and reminders. Built with a modern React interface and persistent backend storage.',
      techStack: ['React', 'Node.js', 'Express.js', 'MongoDB'],
      githubUrl: 'https://github.com/TesheBizu',
      liveUrl: '',
      featured: true,
      order: 2,
    },
  ];
  await Project.insertMany(projects);
  console.log('✅ Projects seeded');

  // Seed experiences
  const experiences = [
    {
      role: 'Computer Science Student',
      company: 'Bahir Dar University',
      period: '2024 - Present',
      location: 'Bahir Dar, Ethiopia',
      description: 'Relevant coursework: Web Dev, Mobile Dev, Databases, Algorithms, Software Engineering',
      iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Bahir_Dar_University_Logo.png',
      type: 'education',
      order: 1
    },
    {
      role: 'Full Stack Developer Intern',
      company: 'Askuala Link',
      period: 'Jun 2026 - Aug 2026',
      location: 'Bahir Dar, Ethiopia',
      description: 'Worked as a Software Engineer Intern developing multiple web applications with React and Express.',
      iconUrl: 'https://img.icons8.com/?size=100&id=t4b1E0Y4b1w8&format=png&color=000000', // A premium professional placeholder
      type: 'work',
      order: 2
    }
  ];
  await Experience.insertMany(experiences);
  console.log('✅ Experiences seeded');


  console.log('\n🎉 Database seeded successfully!');
  console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || 'teshelin7@gmail.com'}`);
  console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
