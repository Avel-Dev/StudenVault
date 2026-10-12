require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Subject = require('../models/Subject');
const Module = require('../models/Module');
const Note = require('../models/Note');
const Lecture = require('../models/Lecture');
const Attendance = require('../models/Attendance');

const seedData = async () => {
  console.log('[Seed] Starting database population...');

  // 1. Clear existing records
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Module.deleteMany({}),
    Note.deleteMany({}),
    Lecture.deleteMany({}),
    Attendance.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing collections.');

  // 2. Create Users
  const admin = await User.create({
    name: 'Dr. Alan Vance',
    email: 'admin@studyvault.edu',
    password: 'password123',
    role: 'admin',
    semester: 3,
  });

  const student1 = await User.create({
    name: 'Aarav Sharma',
    email: 'student@studyvault.edu',
    password: 'password123',
    role: 'student',
    semester: 3,
  });

  const student2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@studyvault.edu',
    password: 'password123',
    role: 'student',
    semester: 3,
  });

  console.log('[Seed] Created default users (admin@studyvault.edu & student@studyvault.edu, password: password123)');

  // 3. Create Subjects across 2 Semesters (Semester 3 and Semester 4)
  // Semester 3 subjects
  const dsa = await Subject.create({
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    semester: 3,
    faculty: admin._id,
    description: 'Core concepts of arrays, linked lists, balanced trees, and graph algorithms.',
  });

  const dms = await Subject.create({
    name: 'Discrete Mathematics',
    code: 'CS302',
    semester: 3,
    faculty: admin._id,
    description: 'Set theory, propositional logic, relations, and combinatorics for computation.',
  });

  const oop = await Subject.create({
    name: 'Object Oriented Programming',
    code: 'CS303',
    semester: 3,
    faculty: admin._id,
    description: 'Design patterns, Java polymorphism, generics, and multithreading.',
  });

  // Semester 4 subjects
  const dbms = await Subject.create({
    name: 'Database Management Systems',
    code: 'CS401',
    semester: 4,
    faculty: admin._id,
    description: 'Relational algebra, normalization (1NF-BCNF), indexing, and ACID transactions.',
  });

  const os = await Subject.create({
    name: 'Operating Systems & Concurrency',
    code: 'CS402',
    semester: 4,
    faculty: admin._id,
    description: 'Process scheduling, deadlocks, virtual memory paging, and file system architectures.',
  });

  console.log('[Seed] Created subjects for Semester 3 and Semester 4.');

  // 4. Create Modules
  const dsaMod1 = await Module.create({
    subject: dsa._id,
    number: 1,
    title: 'Linear Data Structures',
    topics: ['Dynamic Arrays', 'Singly & Doubly Linked Lists', 'Stack Applications', 'Queues & Deques'],
  });

  const dsaMod2 = await Module.create({
    subject: dsa._id,
    number: 2,
    title: 'Trees and Binary Search',
    topics: ['Binary Tree Traversals', 'BST Invariants', 'AVL Tree Rotations', 'Red-Black Trees'],
  });

  const dsaMod3 = await Module.create({
    subject: dsa._id,
    number: 3,
    title: 'Graph Traversals & Shortest Paths',
    topics: ['BFS & DFS', 'Dijkstra Algorithm', 'Bellman-Ford', 'Prim and Kruskal MST'],
  });

  const dmsMod1 = await Module.create({
    subject: dms._id,
    number: 1,
    title: 'Propositional & Predicate Logic',
    topics: ['Truth Tables', 'Logical Equivalences', 'Quantifiers', 'Rules of Inference'],
  });

  const dmsMod2 = await Module.create({
    subject: dms._id,
    number: 2,
    title: 'Set Theory & Combinatorics',
    topics: ['Pigeonhole Principle', 'Permutations & Combinations', 'Recurrence Relations', 'Generating Functions'],
  });

  const oopMod1 = await Module.create({
    subject: oop._id,
    number: 1,
    title: 'Core OOP Principles',
    topics: ['Encapsulation & Abstraction', 'Inheritance & Dynamic Binding', 'Interfaces & Abstract Classes'],
  });

  const dbmsMod1 = await Module.create({
    subject: dbms._id,
    number: 1,
    title: 'Relational Model & Normalization',
    topics: ['Relational Schema', 'Functional Dependencies', '1NF, 2NF, 3NF, BCNF Decomposition'],
  });

  // 5. Create Notes (Midterm & Endsem)
  const notes = await Note.insertMany([
    {
      title: 'Module 2: Binary Search Trees & AVL Rotations Master Sheet',
      fileUrl: '/uploads/dsa-trees-graphs-guide.pdf',
      originalName: 'dsa-trees-graphs-guide.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 420,
      semester: 3,
      subject: dsa._id,
      module: dsaMod2._id,
      examType: 'midterm',
      uploadedBy: admin._id,
    },
    {
      title: 'Graph Traversals & Dijkstra Proofs Comprehensive Guide',
      fileUrl: '/uploads/dsa-trees-graphs-guide.pdf',
      originalName: 'dsa-graph-algorithms.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 780,
      semester: 3,
      subject: dsa._id,
      module: dsaMod3._id,
      examType: 'endsem',
      uploadedBy: admin._id,
    },
    {
      title: 'Pigeonhole Principle & Permutations Exam Cheatsheet',
      fileUrl: '/uploads/discrete-math-combinatorics-cheatsheet.pdf',
      originalName: 'discrete-math-combinatorics-cheatsheet.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 310,
      semester: 3,
      subject: dms._id,
      module: dmsMod2._id,
      examType: 'midterm',
      uploadedBy: admin._id,
    },
    {
      title: 'Java Design Patterns: Factory, Singleton & Observer',
      fileUrl: '/uploads/dsa-trees-graphs-guide.pdf',
      originalName: 'oop-design-patterns.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 512,
      semester: 3,
      subject: oop._id,
      module: oopMod1._id,
      examType: 'endsem',
      uploadedBy: admin._id,
    },
    {
      title: 'DBMS Normalization 3NF vs BCNF Solved Questions',
      fileUrl: '/uploads/dbms-relational-algebra-summary.pdf',
      originalName: 'dbms-relational-algebra-summary.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 640,
      semester: 4,
      subject: dbms._id,
      module: dbmsMod1._id,
      examType: 'midterm',
      uploadedBy: admin._id,
    },
  ]);

  console.log(`[Seed] Created ${notes.length} study notes across modules.`);

  // 6. Create Lectures (Conducted past lectures and upcoming lectures)
  const today = new Date();
  
  // Past dates
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  // Future dates
  const daysAhead = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const lecturesToCreate = [
    // Past lectures for attendance tracking
    {
      subject: dsa._id,
      module: dsaMod1._id,
      topic: 'Introduction to Amortized Complexity and Dynamic Arrays',
      date: daysAgo(14),
      day: dayNames[daysAgo(14).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[0]._id],
    },
    {
      subject: dsa._id,
      module: dsaMod2._id,
      topic: 'Binary Search Tree Rotations and AVL Balancing',
      date: daysAgo(10),
      day: dayNames[daysAgo(10).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[0]._id],
    },
    {
      subject: dsa._id,
      module: dsaMod2._id,
      topic: 'AVL Deletion Invariants and Red-Black Overview',
      date: daysAgo(7),
      day: dayNames[daysAgo(7).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[0]._id],
    },
    {
      subject: dsa._id,
      module: dsaMod3._id,
      topic: 'Graph Representation: Adjacency List vs Matrix',
      date: daysAgo(3),
      day: dayNames[daysAgo(3).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[1]._id],
    },

    // Discrete Math lectures (Student Aarav has missed many here -> low attendance < 75%)
    {
      subject: dms._id,
      module: dmsMod1._id,
      topic: 'Propositional Equivalence and Truth Tables',
      date: daysAgo(13),
      day: dayNames[daysAgo(13).getDay()],
      startTime: '10:15',
      endTime: '11:15',
      room: 'Room 204',
      notes: [notes[2]._id],
    },
    {
      subject: dms._id,
      module: dmsMod1._id,
      topic: 'Predicate Logic Quantifiers and Negation Rules',
      date: daysAgo(9),
      day: dayNames[daysAgo(9).getDay()],
      startTime: '10:15',
      endTime: '11:15',
      room: 'Room 204',
      notes: [notes[2]._id],
    },
    {
      subject: dms._id,
      module: dmsMod2._id,
      topic: 'Generalized Pigeonhole Principle Problem Workshop',
      date: daysAgo(6),
      day: dayNames[daysAgo(6).getDay()],
      startTime: '10:15',
      endTime: '11:15',
      room: 'Room 204',
      notes: [notes[2]._id],
    },
    {
      subject: dms._id,
      module: dmsMod2._id,
      topic: 'Combinatorics: Circular Permutations and Derangements',
      date: daysAgo(2),
      day: dayNames[daysAgo(2).getDay()],
      startTime: '10:15',
      endTime: '11:15',
      room: 'Room 204',
      notes: [notes[2]._id],
    },

    // OOP lectures
    {
      subject: oop._id,
      module: oopMod1._id,
      topic: 'Polymorphism and Dynamic Method Dispatch in JVM',
      date: daysAgo(11),
      day: dayNames[daysAgo(11).getDay()],
      startTime: '11:30',
      endTime: '12:30',
      room: 'Lab 1',
      notes: [notes[3]._id],
    },
    {
      subject: oop._id,
      module: oopMod1._id,
      topic: 'Abstract Classes vs Interfaces & Default Methods',
      date: daysAgo(4),
      day: dayNames[daysAgo(4).getDay()],
      startTime: '11:30',
      endTime: '12:30',
      room: 'Lab 1',
      notes: [notes[3]._id],
    },

    // Upcoming Lectures (for calendar sync & student dashboard)
    {
      subject: dsa._id,
      module: dsaMod3._id,
      topic: 'Breadth-First Search & Bipartite Graph Detection',
      date: daysAhead(1),
      day: dayNames[daysAhead(1).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[1]._id],
    },
    {
      subject: dms._id,
      module: dmsMod2._id,
      topic: 'Recurrence Relations and Master Theorem Basics',
      date: daysAhead(2),
      day: dayNames[daysAhead(2).getDay()],
      startTime: '10:15',
      endTime: '11:15',
      room: 'Room 204',
      notes: [notes[2]._id],
    },
    {
      subject: oop._id,
      module: oopMod1._id,
      topic: 'Multithreading and Synchronized Blocks in Java',
      date: daysAhead(3),
      day: dayNames[daysAhead(3).getDay()],
      startTime: '11:30',
      endTime: '12:30',
      room: 'Lab 1',
      notes: [notes[3]._id],
    },
    {
      subject: dsa._id,
      module: dsaMod3._id,
      topic: 'Dijkstra Algorithm with Priority Queues',
      date: daysAhead(5),
      day: dayNames[daysAhead(5).getDay()],
      startTime: '09:00',
      endTime: '10:00',
      room: 'Hall 301',
      notes: [notes[1]._id],
    },
  ];

  const createdLectures = await Lecture.insertMany(lecturesToCreate);
  console.log(`[Seed] Created ${createdLectures.length} lectures (conducted & upcoming).`);

  // 7. Create Attendance records for Aarav (student1)
  // DSA (4 conducted): 3 Present, 1 Absent => 75%
  // DMS (4 conducted): 2 Present, 2 Absent => 50% (< 75% trigger!)
  // OOP (2 conducted): 2 Present, 0 Absent => 100%
  const pastLectures = createdLectures.filter((l) => l.date < today);

  const attendanceData = [
    // DSA past lectures (3 present, 1 absent)
    { student: student1._id, lecture: pastLectures[0]._id, subject: dsa._id, status: 'present', markedBy: 'faculty' },
    { student: student1._id, lecture: pastLectures[1]._id, subject: dsa._id, status: 'present', markedBy: 'faculty' },
    { student: student1._id, lecture: pastLectures[2]._id, subject: dsa._id, status: 'present', markedBy: 'student' },
    { student: student1._id, lecture: pastLectures[3]._id, subject: dsa._id, status: 'absent', markedBy: 'faculty' },

    // DMS past lectures (2 present, 2 absent -> 50% attendance, triggers warning!)
    { student: student1._id, lecture: pastLectures[4]._id, subject: dms._id, status: 'present', markedBy: 'faculty' },
    { student: student1._id, lecture: pastLectures[5]._id, subject: dms._id, status: 'absent', markedBy: 'faculty' },
    { student: student1._id, lecture: pastLectures[6]._id, subject: dms._id, status: 'absent', markedBy: 'student' },
    { student: student1._id, lecture: pastLectures[7]._id, subject: dms._id, status: 'present', markedBy: 'student' },

    // OOP past lectures (2 present -> 100%)
    { student: student1._id, lecture: pastLectures[8]._id, subject: oop._id, status: 'present', markedBy: 'faculty' },
    { student: student1._id, lecture: pastLectures[9]._id, subject: oop._id, status: 'present', markedBy: 'faculty' },

    // Student 2 records
    { student: student2._id, lecture: pastLectures[0]._id, subject: dsa._id, status: 'present', markedBy: 'faculty' },
    { student: student2._id, lecture: pastLectures[4]._id, subject: dms._id, status: 'present', markedBy: 'faculty' },
  ];

  await Attendance.insertMany(attendanceData);
  console.log(`[Seed] Created ${attendanceData.length} attendance records with real scenarios.`);

  console.log('\n[Seed Complete] Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Account:   admin@studyvault.edu   / password123');
  console.log('Student Account: student@studyvault.edu / password123');
  console.log('----------------------------------------------------');
};

if (require.main === module) {
  connectDB()
    .then(async () => {
      await seedData();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = { seedData };
