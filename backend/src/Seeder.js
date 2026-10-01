import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import {
  Student,
  Room,
  MealSelection,
  Menu,
  KFCOrder,
  KFCMenuItem,
  User,
  Notification,
  Wastage,
  BlockPerformance,
  Attendance,
  Aggregation,
  Anomaly
} from './models/Schemas.js';

/* ==========================================================================
   STUDENT ROSTER (ONLY TWO BLOCKS: BLOCK D & BLOCK E)
   Total: 40 Students (20 in Block D, 20 in Block E)
   ========================================================================== */

export const dummyStudents = [
  // =============================================================
  // HOSTEL BLOCK D (SENIOR HOSTEL - 20 STUDENTS ACROSS 4 ROOMS)
  // =============================================================

  // --- FLOOR 1 (BLOCK D) ---
  // Room D-101 (5 students)
  { studentId: '23B21A4501', name: 'Alex Rivers', email: 'alex.rivers@kiet.edu', roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21A4225', name: 'NITHIN', email: '23b21a4225@kiet.edu', roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23JN1A4543', name: 'VISALYA', email: '23jn1a4543@kiet.edu', roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A4502', name: 'Rahul Verma', email: 'rahul.verma@kiet.edu', roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A4503', name: 'Priya Sundaram', email: 'priya.sundaram@kiet.edu', roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },

  // Room D-102 (5 students)
  { studentId: '23B21D0101', name: 'Abhishek Tiwari', email: 'abhishek.tiwari@kiet.edu', roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21D0102', name: 'Saurabh Mishra', email: 'saurabh.mishra@kiet.edu', roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21D0103', name: 'Harshit Srivastava', email: 'harshit.s@kiet.edu', roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21D0104', name: 'Mohit Pandey', email: 'mohit.pandey@kiet.edu', roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21D0105', name: 'Anurag Yadav', email: 'anurag.yadav@kiet.edu', roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', status: 'Submitted', isRoomLead: false },

  // --- FLOOR 2 (BLOCK D) ---
  // Room D-201 (5 students)
  { studentId: '23B21D0201', name: 'Prashant Singh', email: 'prashant.singh@kiet.edu', roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21D0202', name: 'Utkarsh Shukla', email: 'utkarsh.shukla@kiet.edu', roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21D0203', name: 'Deepanshu Bhatt', email: 'deepanshu.b@kiet.edu', roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A4504', name: 'Vikram Sethi', email: 'vikram.sethi@kiet.edu', roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A4505', name: 'Ananya Gupta', email: 'ananya.gupta@kiet.edu', roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', status: 'Pending', isRoomLead: false },

  // Room D-202 (5 students)
  { studentId: '23B21D0204', name: 'Vaibhav Goyal', email: 'vaibhav.goyal@kiet.edu', roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21D0205', name: 'Ayush Saxena', email: 'ayush.saxena@kiet.edu', roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21D0206', name: 'Rishabh Dubey', email: 'rishabh.dubey@kiet.edu', roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', status: 'Pending', isRoomLead: false },
  { studentId: '23B21D0106', name: 'Shivam Dixit', email: 'shivam.dixit@kiet.edu', roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', status: 'Pending', isRoomLead: false },
  { studentId: '23B21A0201', name: 'Karan Mehra', email: 'karan.mehra@kiet.edu', roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', status: 'Submitted', isRoomLead: false },

  // =============================================================
  // HOSTEL BLOCK E (INTERNATIONAL & PG - 20 STUDENTS ACROSS 4 ROOMS)
  // =============================================================

  // --- FLOOR 1 (BLOCK E) ---
  // Room E-101 (5 students)
  { studentId: '23B21A4538', name: 'SRIRAM', email: '23b21a4538@kiet.edu', roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21A45A1', name: 'KEERTHI', email: '23b21a45a1@kiet.edu', roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23JN1A4316', name: 'SUPRIYA', email: '23jn1a4316@kiet.edu', roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '24B21A4576', name: 'SRK', email: '24b21a4576@kiet.edu', roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A4661', name: 'KARTHIK', email: '23b21a4661@kiet.edu', roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },

  // Room E-102 (5 students)
  { studentId: '23B21E0101', name: 'Aaditya Nair', email: 'aaditya.nair@kiet.edu', roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21E0102', name: 'Tanvi Sharma', email: 'tanvi.sharma@kiet.edu', roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0103', name: 'Rhea Sen', email: 'rhea.sen@kiet.edu', roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0104', name: 'Chaitanya Pillai', email: 'chaitanya.p@kiet.edu', roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0105', name: 'Aditi Deshmukh', email: 'aditi.deshmukh@kiet.edu', roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', status: 'Pending', isRoomLead: false },

  // --- FLOOR 2 (BLOCK E) ---
  // Room E-201 (5 students)
  { studentId: '23B21E0201', name: 'Kavya Madhavan', email: 'kavya.m@kiet.edu', roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21E0202', name: 'Siddharth Menon', email: 'siddharth.m@kiet.edu', roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0203', name: 'Arvind Swaminathan', email: 'arvind.s@kiet.edu', roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0106', name: 'Meera Chawla', email: 'meera.chawla@kiet.edu', roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', status: 'Pending', isRoomLead: false },
  { studentId: '24B21A43A1', name: 'NITHIN (PG)', email: '24b21a43a1@kiet.edu', roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false },

  // Room E-202 (5 students)
  { studentId: '23B21E0204', name: 'Pooja Hegde', email: 'pooja.hegde@kiet.edu', roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: true },
  { studentId: '23B21E0205', name: 'Divya Krishnan', email: 'divya.krishnan@kiet.edu', roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21E0206', name: 'Raghavan Iyer', email: 'raghavan.iyer@kiet.edu', roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', status: 'Pending', isRoomLead: false },
  { studentId: '23B21A0206', name: 'Deepak Roy', email: 'deepak.roy@kiet.edu', roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false },
  { studentId: '23B21A0211', name: 'Tarun Josh', email: 'tarun.josh@kiet.edu', roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', status: 'Submitted', isRoomLead: false }
];

// Helper mapping to generate user accounts for all 40 students
const studentUsers = dummyStudents.map((s, idx) => {
  const blockTitle = s.blockId === 'block-d' ? 'Block D' : 'Block E';
  return {
    id: `USR-S${String(idx + 1).padStart(2, '0')}`,
    name: s.name,
    rollNo: s.studentId,
    email: s.email,
    role: 'Student',
    path: '/student',
    badge: `${s.studentId} • ${s.roomNo} • ${blockTitle}`,
    status: 'Active',
    lastActive: idx % 3 === 0 ? 'Active now' : (idx % 2 === 0 ? '15m ago' : 'Today'),
    password: s.studentId
  };
});

// Staff Accounts covering all dashboards (Block D and Block E focused)
export const dummyStaffUsers = [
  {
    id: 'USR-ST01',
    name: 'Nithin (KFC Staff)',
    email: 'nithin.kfcstaff@gmail.com',
    role: 'KFC Staff',
    path: '/kfc-staff',
    badge: 'Canteen Fulfillment',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST02',
    name: 'Nithin (Room Lead)',
    email: 'nithin.roomlead@gmail.com',
    role: 'Room Lead',
    path: '/room-lead',
    badge: 'Lead • Room D-101 • Block D',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST03',
    name: 'Prof. Sharma (Floor D-1 Incharge)',
    email: 'nithin.floor@gmail.com',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block D',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST03A',
    name: 'Prof. Sharma (Floor D-1 Incharge)',
    email: 'nithin.floord1@gmail.com',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block D',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST03B',
    name: 'Prof. R. Verma (Floor D-2 Incharge)',
    email: 'nithin.floord2@gmail.com',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    badge: 'Floor 2 Incharge • Block D',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST03C',
    name: 'Dr. Ananya Roy (Floor E-1 Incharge)',
    email: 'nithin.floore1@gmail.com',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block E',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST03D',
    name: 'Dr. K. Swaminathan (Floor E-2 Incharge)',
    email: 'nithin.floore2@gmail.com',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    badge: 'Floor 2 Incharge • Block E',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST04',
    name: 'Nithin (Block Coordinator)',
    email: 'nithin.block@gmail.com',
    role: 'Block Coordinator',
    path: '/block-coordinator',
    badge: 'Block D Coordinator',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST05',
    name: 'Nithin (Mess Incharge)',
    email: 'nithin.mess@gmail.com',
    role: 'Mess Incharge',
    path: '/mess-incharge',
    badge: 'Main Mess Kitchen',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST06',
    name: 'Nithin (Principal)',
    email: 'nithin.principal@gmail.com',
    role: 'Principal',
    path: '/principal',
    badge: 'Executive Command',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST07',
    name: 'Admin',
    email: 'admin@gmail.com',
    role: 'Admin',
    path: '/dashboards',
    badge: 'Campus Superadmin',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST08',
    name: 'Er. R. Rao (Block D Coordinator)',
    email: 'nithin.blockd@gmail.com',
    role: 'Block Coordinator',
    path: '/block-coordinator',
    badge: 'Block D Senior Coordinator',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  },
  {
    id: 'USR-ST09',
    name: 'Dr. P. Sen (Block E Coordinator)',
    email: 'nithin.blocke@gmail.com',
    role: 'Block Coordinator',
    path: '/block-coordinator',
    badge: 'Block E PG Coordinator',
    status: 'Active',
    lastActive: 'Active now',
    password: '123456789'
  }
];

// Unified users array: 40 Students + 9 Staff = 49 Campus Users
export const dummyUsers = [
  ...studentUsers,
  ...dummyStaffUsers
];

/* ==========================================================================
   HOSTEL ROOMS (ONLY TWO BLOCKS: BLOCK D & BLOCK E - 8 ROOMS TOTAL)
   ========================================================================== */
export const dummyRooms = [
  // --- HOSTEL BLOCK D (SENIOR HOSTEL - 4 ROOMS) ---
  { roomNo: 'Room D-101', floorId: 'floor-d1', blockId: 'block-d', leadName: 'Alex Rivers', totalMembers: 5, submittedMembers: 5, pendingMembers: 0, rate: 100, status: 'High', flagged: false },
  { roomNo: 'Room D-102', floorId: 'floor-d1', blockId: 'block-d', leadName: 'Abhishek Tiwari', totalMembers: 5, submittedMembers: 5, pendingMembers: 0, rate: 100, status: 'High', flagged: false },
  { roomNo: 'Room D-201', floorId: 'floor-d2', blockId: 'block-d', leadName: 'Prashant Singh', totalMembers: 5, submittedMembers: 4, pendingMembers: 1, rate: 80, status: 'Good', flagged: false },
  { roomNo: 'Room D-202', floorId: 'floor-d2', blockId: 'block-d', leadName: 'Vaibhav Goyal', totalMembers: 5, submittedMembers: 3, pendingMembers: 2, rate: 60, status: 'Medium', flagged: false },

  // --- HOSTEL BLOCK E (INTERNATIONAL & PG HOSTEL - 4 ROOMS) ---
  { roomNo: 'Room E-101', floorId: 'floor-e1', blockId: 'block-e', leadName: 'SRIRAM', totalMembers: 5, submittedMembers: 5, pendingMembers: 0, rate: 100, status: 'High', flagged: false },
  { roomNo: 'Room E-102', floorId: 'floor-e1', blockId: 'block-e', leadName: 'Aaditya Nair', totalMembers: 5, submittedMembers: 4, pendingMembers: 1, rate: 80, status: 'Good', flagged: false },
  { roomNo: 'Room E-201', floorId: 'floor-e2', blockId: 'block-e', leadName: 'Kavya Madhavan', totalMembers: 5, submittedMembers: 4, pendingMembers: 1, rate: 80, status: 'Good', flagged: false },
  { roomNo: 'Room E-202', floorId: 'floor-e2', blockId: 'block-e', leadName: 'Pooja Hegde', totalMembers: 5, submittedMembers: 4, pendingMembers: 1, rate: 80, status: 'Good', flagged: false }
];

/* ==========================================================================
   DAILY MESS MENUS
   ========================================================================== */
export const dummyMenus = [
  {
    date: '2026-09-30',
    breakfast: 'Idli & Sambar, Medu Vada, Filter Coffee',
    lunch: 'Chole Bhature, Steamed Rice, Dal Tadka, Boondi Raita',
    snacks: 'Veg Cutlet, Masala Chai',
    dinner: 'Paneer Butter Masala, Phulka, Jeera Rice, Gulab Jamun'
  },
  {
    date: '2026-10-01',
    breakfast: 'Masala Dosa & Sambar, Poha with Chai',
    lunch: 'Rajma Chawal Thali, Paneer Butter Masala',
    snacks: 'Samosa & Chai',
    dinner: 'Roti, Dal, Sabzi, Chicken Curry & Rice'
  },
  {
    date: 'Tomorrow (Sept 17)',
    breakfast: 'Masala Dosa & Sambar, Poha with Chai',
    lunch: 'Rajma Chawal Thali, Paneer Butter Masala',
    snacks: 'Samosa & Chai',
    dinner: 'Roti, Dal, Sabzi, Chicken Curry & Rice'
  }
];

/* ==========================================================================
   MEAL SELECTIONS (TODAY & TOMORROW BY STUDENTS)
   ========================================================================== */
export const dummyMealSelections = dummyStudents.map((s) => ({
  studentId: s.studentId,
  date: '2026-10-01',
  breakfast: s.status === 'Submitted' ? (s.studentId.endsWith('1') || s.studentId.endsWith('3') || s.studentId.endsWith('5') ? 'will_eat' : 'will_not_eat') : 'will_eat',
  lunch: s.status === 'Submitted' ? 'will_eat' : 'will_not_eat',
  snacks: s.status === 'Submitted' ? (s.studentId.endsWith('2') || s.studentId.endsWith('4') ? 'will_eat' : 'will_not_eat') : 'will_not_eat',
  dinner: s.status === 'Submitted' ? 'will_eat' : 'will_not_eat'
}));

/* ==========================================================================
   KFC CANTEEN MENU ITEMS (9 ITEMS ACROSS 6 CATEGORIES)
   ========================================================================== */
export const dummyKfcMenu = [
  {
    id: 1,
    name: 'Zinger Burger',
    price: 179,
    category: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    image: '🍔',
    stock: 25,
    isAvailable: true
  },
  {
    id: 2,
    name: 'Chicken Popcorn',
    price: 149,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    image: '🍿',
    stock: 18,
    isAvailable: true
  },
  {
    id: 3,
    name: 'Hot Wings (6 pc)',
    price: 229,
    category: 'Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1527477248705-200752240e3a?w=500&auto=format&fit=crop&q=80',
    image: '🍗',
    stock: 15,
    isAvailable: true
  },
  {
    id: 4,
    name: 'Crispy Tenders (4 pc)',
    price: 199,
    category: 'Chicken',
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    image: '🍗',
    stock: 12,
    isAvailable: true
  },
  {
    id: 5,
    name: 'Zinger Meal Combo',
    price: 299,
    category: 'Combos',
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
    image: '🍔',
    stock: 20,
    isAvailable: true
  },
  {
    id: 6,
    name: 'Veg Rice Bowl',
    price: 149,
    category: 'Rice Bowls',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    image: '🥗',
    stock: 10,
    isAvailable: true
  },
  {
    id: 7,
    name: 'French Fries',
    price: 99,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    image: '🍟',
    stock: 30,
    isAvailable: true
  },
  {
    id: 8,
    name: 'Choco Lava Cake',
    price: 99,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    image: '🍰',
    stock: 14,
    isAvailable: true
  },
  {
    id: 9,
    name: 'Pepsi 500ml',
    price: 60,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    image: '🥤',
    stock: 40,
    isAvailable: true
  }
];

/* ==========================================================================
   KFC LIVE ORDERS (10 ORDERS ACROSS BLOCK D & BLOCK E)
   ========================================================================== */
export const dummyKfcOrders = [
  {
    orderId: 'ORD-8412',
    token: 'KFC-D101-14',
    studentName: 'Nithin',
    room: 'Room D-101',
    items: [
      { name: 'Zinger Burger', qty: 1, price: 179 },
      { name: 'French Fries', qty: 1, price: 99 },
      { name: 'Pepsi 500ml', qty: 1, price: 60 }
    ],
    totalAmount: 338,
    orderTime: '06:45 PM',
    status: 'Pending'
  },
  {
    orderId: 'ORD-8411',
    token: 'KFC-D102-89',
    studentName: 'Abhishek Tiwari',
    room: 'Room D-102',
    items: [
      { name: 'Hot Wings (6 pc)', qty: 1, price: 229 },
      { name: 'Choco Lava Cake', qty: 1, price: 99 }
    ],
    totalAmount: 328,
    orderTime: '06:40 PM',
    status: 'Preparing'
  },
  {
    orderId: 'ORD-8410',
    token: 'KFC-D101-09',
    studentName: 'Alex Rivers',
    room: 'Room D-101',
    items: [
      { name: 'Zinger Meal Combo', qty: 1, price: 299 }
    ],
    totalAmount: 299,
    orderTime: '06:32 PM',
    status: 'Preparing'
  },
  {
    orderId: 'ORD-8409',
    token: 'KFC-E101-45',
    studentName: 'SRIRAM',
    room: 'Room E-101',
    items: [
      { name: 'Chicken Popcorn', qty: 2, price: 149 },
      { name: 'Pepsi 500ml', qty: 2, price: 60 }
    ],
    totalAmount: 418,
    orderTime: '06:20 PM',
    status: 'Ready'
  },
  {
    orderId: 'ORD-8408',
    token: 'KFC-E102-18',
    studentName: 'Aaditya Nair',
    room: 'Room E-102',
    items: [
      { name: 'Veg Rice Bowl', qty: 1, price: 149 },
      { name: 'French Fries', qty: 1, price: 99 }
    ],
    totalAmount: 248,
    orderTime: '06:15 PM',
    status: 'Ready'
  },
  {
    orderId: 'ORD-8407',
    token: 'KFC-E101-31',
    studentName: 'KEERTHI',
    room: 'Room E-101',
    items: [
      { name: 'Crispy Tenders (4 pc)', qty: 1, price: 199 },
      { name: 'Choco Lava Cake', qty: 1, price: 99 }
    ],
    totalAmount: 298,
    orderTime: '05:50 PM',
    status: 'Collected'
  },
  {
    orderId: 'ORD-8406',
    token: 'KFC-E101-72',
    studentName: 'SUPRIYA',
    room: 'Room E-101',
    items: [
      { name: 'Zinger Burger', qty: 2, price: 179 }
    ],
    totalAmount: 358,
    orderTime: '05:30 PM',
    status: 'Collected'
  },
  {
    orderId: 'ORD-8405',
    token: 'KFC-D201-55',
    studentName: 'Prashant Singh',
    room: 'Room D-201',
    items: [
      { name: 'Chicken Popcorn', qty: 1, price: 149 },
      { name: 'Pepsi 500ml', qty: 1, price: 60 }
    ],
    totalAmount: 209,
    orderTime: '05:10 PM',
    status: 'Collected'
  },
  {
    orderId: 'ORD-8404',
    token: 'KFC-D101-01',
    studentName: 'Rahul Verma',
    room: 'Room D-101',
    items: [
      { name: 'Zinger Meal Combo', qty: 1, price: 299 },
      { name: 'French Fries', qty: 1, price: 99 }
    ],
    totalAmount: 398,
    orderTime: '04:45 PM',
    status: 'Archived'
  },
  {
    orderId: 'ORD-8403',
    token: 'KFC-D202-12',
    studentName: 'Vaibhav Goyal',
    room: 'Room D-202',
    items: [
      { name: 'Hot Wings (6 pc)', qty: 1, price: 229 }
    ],
    totalAmount: 229,
    orderTime: '04:15 PM',
    status: 'Archived'
  }
];

/* ==========================================================================
   ATTENDANCE, AGGREGATIONS, ANOMALIES, NOTIFICATIONS & WASTAGE
   ========================================================================== */
export const dummyAttendance = [
  { date: '2026-10-01', meal: 'Breakfast', actualCount: 193 },
  { date: '2026-10-01', meal: 'Lunch', actualCount: 205 },
  { date: '2026-10-01', meal: 'Snacks', actualCount: 166 },
  { date: '2026-10-01', meal: 'Dinner', actualCount: 198 }
];

export const dummyAggregations = [
  {
    scope: 'floor',
    scopeId: 'floor-d1',
    date: '2026-10-01',
    breakfastCount: 10,
    lunchCount: 10,
    snacksCount: 8,
    dinnerCount: 10,
    participationRate: 100
  },
  {
    scope: 'floor',
    scopeId: 'floor-d2',
    date: '2026-10-01',
    breakfastCount: 7,
    lunchCount: 8,
    snacksCount: 6,
    dinnerCount: 7,
    participationRate: 70
  },
  {
    scope: 'floor',
    scopeId: 'floor-e1',
    date: '2026-10-01',
    breakfastCount: 9,
    lunchCount: 10,
    snacksCount: 7,
    dinnerCount: 9,
    participationRate: 90
  },
  {
    scope: 'floor',
    scopeId: 'floor-e2',
    date: '2026-10-01',
    breakfastCount: 8,
    lunchCount: 8,
    snacksCount: 6,
    dinnerCount: 8,
    participationRate: 80
  },
  {
    scope: 'block',
    scopeId: 'block-d',
    date: '2026-10-01',
    breakfastCount: 104,
    lunchCount: 110,
    snacksCount: 88,
    dinnerCount: 106,
    participationRate: 94.5
  },
  {
    scope: 'block',
    scopeId: 'block-e',
    date: '2026-10-01',
    breakfastCount: 89,
    lunchCount: 95,
    snacksCount: 78,
    dinnerCount: 92,
    participationRate: 93.7
  },
  {
    scope: 'mess',
    scopeId: 'main-kitchen',
    date: '2026-10-01',
    breakfastCount: 193,
    lunchCount: 205,
    snacksCount: 166,
    dinnerCount: 198,
    participationRate: 94.1
  }
];

export const dummyAnomalies = [
  {
    title: 'Block D Floor 2 Submission Alert',
    type: 'low_participation',
    scope: 'floor',
    scopeId: 'Block D • Floor 2 (Room D-202)',
    description: 'Room D-202 submission rate is 60% (3/5 students). Automated reminder sent to room members.',
    severity: 'medium'
  },
  {
    title: 'High KFC Demand Forecast',
    type: 'variance_alert',
    scope: 'kfc',
    scopeId: 'Snacks Shift (04:30 PM - 06:00 PM)',
    description: 'Zinger Burger Duo & Chicken Popcorn orders predicted to surge by 45% based on exam week patterns.',
    severity: 'medium'
  },
  {
    title: 'Block E Waste Reduction Milestone',
    type: 'high_wastage',
    scope: 'mess',
    scopeId: 'Block E International Kitchen Wing',
    description: 'Daily unconsumed plate wastage dropped by 32% (from 18.2kg Mon down to 5.4kg Sun).',
    severity: 'low'
  }
];

export const dummyNotifications = [
  {
    id: 'NOTIF-01',
    title: 'Daily Cutoff Notice from Block D Incharge',
    message: 'Er. R. Rao: Please verify all 5 Room D-101 members have selected their meals before tonight\'s 10:00 PM cutoff.',
    sender: 'Er. R. Rao (Block D Coordinator)',
    roomNo: 'Room D-101',
    time: '10:15 AM',
    timestamp: Date.now() - 3600000,
    read: false,
    type: 'reminder'
  },
  {
    id: 'NOTIF-02',
    title: 'KFC Canteen Order Ready',
    message: 'Token KFC-D101-14 is hot and ready for collection at the counter.',
    sender: 'KFC Kitchen Express',
    roomNo: 'Room D-101',
    time: '06:21 PM',
    timestamp: Date.now() - 1800000,
    read: false,
    type: 'order'
  },
  {
    id: 'NOTIF-03',
    title: 'Block D Consolidated Roster Sent',
    message: '104 student headcounts successfully consolidated and transmitted to Main Mess Kitchen.',
    sender: 'Er. R. Rao (Block D Coordinator)',
    roomNo: 'Hostel Block D',
    time: '07:00 PM',
    timestamp: Date.now() - 900000,
    read: true,
    type: 'status'
  },
  {
    id: 'NOTIF-04',
    title: 'Block E International Hostel Update',
    message: 'Dr. P. Sen: Block E headcount verified. 89 students eating.',
    sender: 'Dr. P. Sen (Block E Coordinator)',
    roomNo: 'Hostel Block E',
    time: '08:45 PM',
    timestamp: Date.now() - 200000,
    read: false,
    type: 'status'
  }
];

export const dummyWastage = [
  { day: 'Mon', date: '2026-09-24', actualKg: 18.2, targetKg: 10.0, savedKg: 1.8 },
  { day: 'Tue', date: '2026-09-25', actualKg: 14.5, targetKg: 10.0, savedKg: 3.5 },
  { day: 'Wed', date: '2026-09-26', actualKg: 11.2, targetKg: 10.0, savedKg: 5.8 },
  { day: 'Thu', date: '2026-09-27', actualKg: 9.1, targetKg: 10.0, savedKg: 8.9 },
  { day: 'Fri', date: '2026-09-28', actualKg: 8.0, targetKg: 10.0, savedKg: 10.0 },
  { day: 'Sat', date: '2026-09-29', actualKg: 6.2, targetKg: 10.0, savedKg: 11.8 },
  { day: 'Sun', date: '2026-09-30', actualKg: 5.4, targetKg: 10.0, savedKg: 12.6 }
];

// ONLY TWO BLOCKS: BLOCK D AND BLOCK E
export const dummyBlockPerformance = [
  { block: 'Block D (Senior Wing)', total: 110, submitted: 104, pending: 6, rate: 94.5, status: 'Optimal', incharge: 'Er. R. Rao' },
  { block: 'Block E (International/PG Wing)', total: 95, submitted: 89, pending: 6, rate: 93.7, status: 'Good', incharge: 'Dr. P. Sen' }
];

/* ==========================================================================
   SEED FUNCTION TO POPULATE MONGODB COLLECTIONS
   ========================================================================== */
export async function seedDatabase(mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc') {
  console.log('\n========================================================');
  console.log('🌱 Starting Smart Mess & KFC Multi-Dashboard Seeder...');
  console.log('🏢 SCOPE: ONLY TWO BLOCKS (BLOCK D & BLOCK E)');
  console.log(`🔗 Connecting to MongoDB: ${mongoUri}`);
  console.log('========================================================\n');

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }
    console.log('✅ Connected to MongoDB successfully.\n');

    // 1. Clear existing collections
    console.log('🧹 Purging old records from collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Room.deleteMany({}),
      MealSelection.deleteMany({}),
      Menu.deleteMany({}),
      KFCMenuItem.deleteMany({}),
      KFCOrder.deleteMany({}),
      Attendance.deleteMany({}),
      Aggregation.deleteMany({}),
      Anomaly.deleteMany({}),
      Notification.deleteMany({}),
      Wastage.deleteMany({}),
      BlockPerformance.deleteMany({})
    ]);
    console.log('✨ All target collections cleared.\n');

    // 2. Insert dummy datasets
    console.log('📦 Seeding fresh dummy data across all 7 dashboards for Block D & Block E...');

    const [
      usersRes,
      studentsRes,
      roomsRes,
      menusRes,
      selectionsRes,
      kfcMenuRes,
      kfcOrdersRes,
      attendanceRes,
      aggregationsRes,
      anomaliesRes,
      notificationsRes,
      wastageRes,
      blockPerfRes
    ] = await Promise.all([
      User.insertMany(dummyUsers),
      Student.insertMany(dummyStudents),
      Room.insertMany(dummyRooms),
      Menu.insertMany(dummyMenus),
      MealSelection.insertMany(dummyMealSelections),
      KFCMenuItem.insertMany(dummyKfcMenu),
      KFCOrder.insertMany(dummyKfcOrders),
      Attendance.insertMany(dummyAttendance),
      Aggregation.insertMany(dummyAggregations),
      Anomaly.insertMany(dummyAnomalies),
      Notification.insertMany(dummyNotifications),
      Wastage.insertMany(dummyWastage),
      BlockPerformance.insertMany(dummyBlockPerformance)
    ]);

    console.log(`  👤 Campus Users & Logins : ${usersRes.length} inserted (40 students + 9 staff/admins)`);
    console.log(`  🎓 Student Records        : ${studentsRes.length} inserted (Exclusively Block D & Block E)`);
    console.log(`  🚪 Hostel Rooms           : ${roomsRes.length} inserted (8 Rooms across Blocks D & E)`);
    console.log(`  🍽️ Mess Daily Menus       : ${menusRes.length} inserted (Breakfast, Lunch, Snacks, Dinner)`);
    console.log(`  📋 Meal Selections        : ${selectionsRes.length} inserted (Today & Tomorrow)`);
    console.log(`  🍗 KFC Menu Items         : ${kfcMenuRes.length} inserted (Burgers, Wings, Combos, etc.)`);
    console.log(`  🧾 KFC Live Orders        : ${kfcOrdersRes.length} inserted (Pending, Preparing, Ready, Collected)`);
    console.log(`  📊 Attendance Records     : ${attendanceRes.length} inserted`);
    console.log(`  📈 Scope Aggregations     : ${aggregationsRes.length} inserted (Block D, Block E, Floors, Mess Kitchen)`);
    console.log(`  ⚠️ AI Anomaly Insights    : ${anomaliesRes.length} inserted`);
    console.log(`  🔔 System Notifications   : ${notificationsRes.length} inserted (Block D & E alerts)`);
    console.log(`  ♻️ Wastage Trend Records  : ${wastageRes.length} inserted (-32% weekly drop)`);
    console.log(`  🏢 Block Performance Data : ${blockPerfRes.length} inserted (Exclusively Blocks D & E)`);

    console.log('\n========================================================');
    console.log('🎉 SEEDING COMPLETE! Only Blocks D & E are loaded with rich dummy data.');
    console.log('========================================================\n');

    return {
      success: true,
      counts: {
        users: usersRes.length,
        students: studentsRes.length,
        rooms: roomsRes.length,
        menus: menusRes.length,
        mealSelections: selectionsRes.length,
        kfcMenu: kfcMenuRes.length,
        kfcOrders: kfcOrdersRes.length,
        attendance: attendanceRes.length,
        aggregations: aggregationsRes.length,
        anomalies: anomaliesRes.length,
        notifications: notificationsRes.length,
        wastage: wastageRes.length,
        blockPerformance: blockPerfRes.length
      }
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Auto-run when file is executed directly with Node
if (process.argv[1] && /seeder\.js$/i.test(process.argv[1])) {
  seedDatabase()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
