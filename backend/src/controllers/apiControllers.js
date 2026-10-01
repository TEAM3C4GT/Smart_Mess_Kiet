import {
  KFCMenuItem,
  KFCOrder,
  Menu,
  MealSelection,
  Room,
  Student,
  User,
  Anomaly,
  Attendance,
  Aggregation,
  BlockPerformance
} from '../models/Schemas.js';

import {
  dummyKfcMenu,
  dummyKfcOrders,
  dummyMenus,
  dummyUsers,
  dummyRooms,
  dummyAnomalies,
  seedDatabase
} from '../Seeder.js';

// In-Memory Fallback Datasets (populated from Seeder data)
let mockMenu = dummyMenus[1] || {
  date: '2026-10-01',
  breakfast: 'Masala Dosa & Sambar, Poha with Chai',
  lunch: 'Rajma Chawal Thali, Paneer Butter Masala',
  snacks: 'Samosa & Chai',
  dinner: 'Roti, Dal, Sabzi, Chicken Curry & Rice'
};

let mockKfcOrders = [...dummyKfcOrders];
let mockKfcMenu = [...dummyKfcMenu];
let mockUsers = [...dummyUsers];

export const studentRoster = dummyUsers.filter(u => u.role === 'Student').map(s => ({
  rollNo: s.rollNo,
  name: s.name,
  email: s.email,
  room: s.badge || 'Room D-101 • Block D'
}));

export const staffAccounts = dummyUsers.filter(u => u.role !== 'Student').map(st => ({
  role: st.role,
  email: st.email,
  name: st.name,
  path: st.path,
  badge: st.badge
}));

export const demoAccounts = [
  ...studentRoster.map((s) => ({
    role: 'Student',
    rollNo: s.rollNo,
    email: s.email,
    name: s.name,
    path: '/student',
    badge: `${s.rollNo} • ${s.room}`
  })),
  ...staffAccounts
];

/* ==========================================================================
   KFC MENU CONTROLLERS
   ========================================================================== */
export const getKfcMenu = async (req, res) => {
  try {
    const items = await KFCMenuItem.find().lean();
    if (items && items.length > 0) {
      return res.json({ success: true, menu: items });
    }
  } catch (err) {}
  res.json({ success: true, menu: mockKfcMenu });
};

export const updateKfcMenu = async (req, res) => {
  if (Array.isArray(req.body.menu)) {
    mockKfcMenu = req.body.menu;
    try {
      await KFCMenuItem.deleteMany({});
      await KFCMenuItem.insertMany(mockKfcMenu);
    } catch (err) {}
  }
  res.json({ success: true, message: 'KFC Menu updated', menu: mockKfcMenu });
};

export const deleteKfcMenuItem = async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  mockKfcMenu = mockKfcMenu.filter((item) => item.id !== numId && String(item.id) !== id);
  try {
    await KFCMenuItem.deleteOne({ $or: [{ id: numId }, { id: id }] });
  } catch (err) {}
  res.json({ success: true, message: `Item ${id} removed from menu`, menu: mockKfcMenu });
};

export const addKfcMenuItem = async (req, res) => {
  const newItem = {
    id: Date.now(),
    name: req.body.name || 'New Item',
    price: Number(req.body.price) || 99,
    category: req.body.category || 'Snacks',
    image: req.body.image || '🍗',
    imageUrl: req.body.imageUrl || '',
    stock: Number(req.body.stock) || 20,
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true
  };
  mockKfcMenu.push(newItem);
  try {
    await KFCMenuItem.create(newItem);
  } catch (err) {}
  res.status(201).json({ success: true, item: newItem, menu: mockKfcMenu });
};

/* ==========================================================================
   MESS MENU & SELECTION CONTROLLERS
   ========================================================================== */
export const getMenu = async (req, res) => {
  try {
    const reqDate = req.params.date;
    const query = reqDate ? { date: reqDate } : {};
    const menuDoc = await Menu.findOne(query).sort({ createdAt: -1 }).lean();
    if (menuDoc) {
      return res.json({ success: true, menu: menuDoc });
    }
  } catch (err) {}
  res.json({ success: true, menu: mockMenu });
};

export const updateMenu = async (req, res) => {
  mockMenu = { ...mockMenu, ...req.body };
  try {
    await Menu.findOneAndUpdate(
      { date: mockMenu.date },
      mockMenu,
      { upsert: true, new: true }
    );
  } catch (err) {}
  res.json({ success: true, message: 'Menu updated successfully', menu: mockMenu });
};

export const postSelections = async (req, res) => {
  try {
    if (req.body.studentId && req.body.date) {
      await MealSelection.findOneAndUpdate(
        { studentId: req.body.studentId, date: req.body.date },
        req.body,
        { upsert: true, new: true }
      );
    }
  } catch (err) {}
  res.json({ success: true, message: "Student meal plan saved successfully", selections: req.body });
};

/* ==========================================================================
   AGGREGATION & FLOOR/BLOCK/MESS CONTROLLERS
   ========================================================================== */
export const getFloorAggregation = async (req, res) => {
  const { floorId } = req.params;
  const targetFloor = floorId || 'floor-d1';
  let rooms = [];
  try {
    const roomDocs = await Room.find({ floorId: targetFloor }).lean();
    if (roomDocs && roomDocs.length > 0) {
      rooms = roomDocs.map(r => ({
        roomNo: r.roomNo,
        lead: r.leadName,
        members: r.totalMembers,
        submitted: r.submittedMembers,
        pending: r.pendingMembers !== undefined ? r.pendingMembers : (r.totalMembers - r.submittedMembers),
        rate: r.rate || Math.round((r.submittedMembers / r.totalMembers) * 100),
        status: r.status || 'Good',
        flagged: Boolean(r.flagged)
      }));
    }
  } catch (err) {}

  if (rooms.length === 0) {
    rooms = dummyRooms.filter(r => r.floorId === targetFloor).map(r => ({
      roomNo: r.roomNo,
      lead: r.leadName,
      members: r.totalMembers,
      submitted: r.submittedMembers,
      pending: r.pendingMembers,
      rate: r.rate,
      status: r.status,
      flagged: r.flagged
    }));
    if (rooms.length === 0) {
      rooms = dummyRooms.slice(0, 4);
    }
  }

  const totalStudents = rooms.reduce((acc, r) => acc + (r.members || 0), 0);
  const submittedStudents = rooms.reduce((acc, r) => acc + (r.submitted || 0), 0);
  const pendingStudents = Math.max(0, totalStudents - submittedStudents);
  const avgParticipation = totalStudents > 0 ? Math.round((submittedStudents / totalStudents) * 100) : 90;

  res.json({
    success: true,
    floorId: targetFloor,
    floorName: targetFloor.includes('2') ? 'Floor 2' : 'Floor 1',
    blockName: targetFloor.startsWith('floor-e') ? 'Hostel Block E' : 'Hostel Block D',
    totalRooms: rooms.length,
    totalStudents,
    submittedStudents,
    pendingStudents,
    avgParticipation,
    mealRequirements: {
      breakfast: { selected: Math.round(submittedStudents * 0.9), total: totalStudents, percentage: Math.round((submittedStudents * 0.9 / (totalStudents || 10)) * 100) },
      lunch: { selected: submittedStudents, total: totalStudents, percentage: Math.round((submittedStudents / (totalStudents || 10)) * 100) },
      snacks: { selected: Math.round(submittedStudents * 0.8), total: totalStudents, percentage: Math.round((submittedStudents * 0.8 / (totalStudents || 10)) * 100) },
      dinner: { selected: submittedStudents, total: totalStudents, percentage: Math.round((submittedStudents / (totalStudents || 10)) * 100) }
    },
    rooms
  });
};

export const getBlockAggregation = async (req, res) => {
  const { blockId } = req.params;
  const targetBlock = (blockId || 'block-d').toLowerCase();
  try {
    const agg = await Aggregation.findOne({ scope: 'block', scopeId: targetBlock }).lean();
    if (agg) {
      return res.json({
        success: true,
        blockId: targetBlock,
        totalFloors: targetBlock === 'block-d' || targetBlock === 'block-e' ? 2 : 4,
        totalSubmissions: agg.lunchCount || (targetBlock === 'block-d' ? 110 : (targetBlock === 'block-e' ? 95 : 169)),
        overallRate: agg.participationRate || 94.5,
        mealCounts: {
          breakfast: agg.breakfastCount || 104,
          lunch: agg.lunchCount || 110,
          snacks: agg.snacksCount || 88,
          dinner: agg.dinnerCount || 106
        }
      });
    }
  } catch (err) {}

  res.json({
    success: true,
    blockId: targetBlock,
    totalFloors: targetBlock === 'block-d' || targetBlock === 'block-e' ? 2 : 4,
    totalSubmissions: targetBlock === 'block-d' ? 110 : (targetBlock === 'block-e' ? 95 : 169),
    overallRate: targetBlock === 'block-d' ? 94.5 : (targetBlock === 'block-e' ? 93.7 : 84.5),
    mealCounts: targetBlock === 'block-d'
      ? { breakfast: 104, lunch: 110, snacks: 88, dinner: 106 }
      : (targetBlock === 'block-e'
        ? { breakfast: 89, lunch: 95, snacks: 78, dinner: 92 }
        : { breakfast: 169, lunch: 185, snacks: 140, dinner: 178 })
  });
};

export const getMessAggregation = async (req, res) => {
  res.json({
    success: true,
    date: req.params.date || '2026-10-01',
    headcount: [
      { meal: 'Breakfast', selected: 169, predicted: 175, actual: 172, variance: '+6' },
      { meal: 'Lunch', selected: 185, predicted: 192, actual: 189, variance: '+7' },
      { meal: 'Snacks', selected: 140, predicted: 148, actual: 145, variance: '+8' },
      { meal: 'Dinner', selected: 178, predicted: 184, actual: 180, variance: '+6' }
    ]
  });
};

export const flagRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findOne({ roomNo: id });
    if (room) {
      room.flagged = !room.flagged;
      await room.save();
    }
  } catch (err) {}
  res.json({ success: true, message: `Room ${id} flagged status toggled.` });
};

/* ==========================================================================
   KFC ORDERS CONTROLLERS
   ========================================================================== */
export const getKfcOrders = async (req, res) => {
  try {
    const orders = await KFCOrder.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 }).lean();
    if (orders && orders.length > 0) {
      const formatted = orders.map(o => ({
        id: o.orderId || o.id,
        token: o.token,
        studentName: o.studentName,
        room: o.room,
        items: o.items,
        totalAmount: o.totalAmount,
        orderTime: o.orderTime,
        status: o.status
      }));
      return res.json({ success: true, orders: formatted });
    }
  } catch (err) {}
  const activeOrders = mockKfcOrders.filter((o) => o.status !== 'Archived');
  res.json({ success: true, orders: activeOrders });
};

export const clearKfcOrders = async (req, res) => {
  mockKfcOrders = [];
  try {
    await KFCOrder.deleteMany({});
  } catch (err) {}
  res.json({ success: true, message: 'All KFC orders cleared', orders: [] });
};

export const createKfcOrder = async (req, res) => {
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    token: req.body.token || `KFC-D101-${Math.floor(10 + Math.random() * 90)}`,
    studentName: req.body.studentName || 'Alex Rivers',
    room: req.body.room || 'Room D-101',
    items: req.body.items || [],
    totalAmount: req.body.totalAmount || 0,
    orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending'
  };
  mockKfcOrders.unshift(newOrder);
  try {
    await KFCOrder.create({
      orderId: newOrder.id,
      token: newOrder.token,
      studentName: newOrder.studentName,
      room: newOrder.room,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      orderTime: newOrder.orderTime,
      status: newOrder.status
    });
  } catch (err) {}
  res.status(201).json({ success: true, order: newOrder, orders: mockKfcOrders.filter(o => o.status !== 'Archived') });
};

export const updateKfcOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let updatedOrder = null;
  mockKfcOrders = mockKfcOrders.map((o) => {
    if (o.id === id || o.token === id || o.orderId === id) {
      updatedOrder = { ...o, status };
      return updatedOrder;
    }
    return o;
  });

  try {
    await KFCOrder.updateOne(
      { $or: [{ orderId: id }, { token: id }] },
      { $set: { status } }
    );
  } catch (err) {}

  res.json({ success: true, message: `Order ${id} status updated to ${status}`, order: updatedOrder, orders: mockKfcOrders.filter(o => o.status !== 'Archived') });
};

/* ==========================================================================
   AI FORECAST & ANOMALIES
   ========================================================================== */
export const getAIForecast = (req, res) => {
  res.json({
    meal: 'Lunch',
    selectedCount: 185,
    predictedCount: 192,
    confidence: 0.91,
    scope: req.params.scope || 'mess',
    date: req.params.date || '2026-10-01'
  });
};

export const getAIAnomalies = async (req, res) => {
  try {
    const anomalies = await Anomaly.find().lean();
    if (anomalies && anomalies.length > 0) {
      return res.json({
        anomalies: anomalies.map((a, idx) => ({
          id: a._id || idx + 1,
          title: a.title,
          scope: a.scopeId || a.scope,
          description: a.description,
          severity: a.severity
        }))
      });
    }
  } catch (err) {}

  res.json({
    anomalies: dummyAnomalies.map((a, idx) => ({
      id: idx + 1,
      title: a.title,
      scope: a.scopeId || a.scope,
      description: a.description,
      severity: a.severity
    }))
  });
};

/* ==========================================================================
   USER AUTH & MANAGEMENT CONTROLLERS
   ========================================================================== */
export const getDemoUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    if (users && users.length > 0) {
      return res.json({ success: true, users });
    }
  } catch (err) {}
  res.json({ success: true, users: demoAccounts });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanId = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  // 1. Try finding in MongoDB first
  try {
    const dbUser = await User.findOne({
      $or: [
        { email: cleanId },
        { rollNo: cleanId.toUpperCase() },
        { rollNo: cleanId }
      ]
    }).lean();

    if (dbUser) {
      const expectedPass = dbUser.role === 'Student' ? (dbUser.rollNo || '').toLowerCase() : (dbUser.password || '123456789');
      if (cleanPass.toLowerCase() === expectedPass.toLowerCase() || cleanPass === '123456789') {
        return res.json({
          success: true,
          user: dbUser,
          token: `jwt-token-${dbUser.role.toLowerCase()}`
        });
      } else {
        return res.status(401).json({
          success: false,
          message: dbUser.role === 'Student' ? 'Invalid password. Enter Roll Number.' : 'Invalid password. Enter 123456789.'
        });
      }
    }
  } catch (err) {}

  // 2. Fallback to studentRoster
  const matchedStudent = studentRoster.find(
    (s) => s.rollNo.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId
  );
  if (matchedStudent) {
    if (cleanPass.toLowerCase() !== matchedStudent.rollNo.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Invalid password. Enter Roll Number.' });
    }
    return res.json({
      success: true,
      user: {
        role: 'Student',
        rollNo: matchedStudent.rollNo,
        name: matchedStudent.name,
        email: matchedStudent.email,
        path: '/student',
        badge: `${matchedStudent.rollNo} • ${matchedStudent.room}`
      },
      token: 'jwt-token-student'
    });
  }

  // 3. Fallback to staffAccounts
  let matchedStaff = staffAccounts.find((st) => st.email.toLowerCase() === cleanId);
  if (!matchedStaff && (cleanId === 'admin' || cleanId === 'admin@gmail.com' || cleanId === 'karthiksuru06@gmail.com')) {
    matchedStaff = staffAccounts.find((st) => st.role === 'Admin');
  }

  if (matchedStaff) {
    if (cleanPass !== '123456789') {
      return res.status(401).json({ success: false, message: 'Invalid password. Enter 123456789.' });
    }
    return res.json({
      success: true,
      user: matchedStaff,
      token: 'jwt-token-staff'
    });
  }

  return res.status(404).json({ success: false, message: 'Account not found' });
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    if (users && users.length > 0) {
      return res.json({ success: true, users });
    }
  } catch (err) {}
  res.json({ success: true, users: mockUsers });
};

export const createUser = async (req, res) => {
  const { name, email, role, badge, status } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const rolePaths = {
    'Student': '/student',
    'Room Lead': '/room-lead',
    'Floor Incharge': '/floor-incharge',
    'Block Coordinator': '/block-coordinator',
    'Mess Incharge': '/mess-incharge',
    'Principal': '/principal',
    'KFC Staff': '/kfc-staff',
    'Admin': '/dashboards'
  };

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || 'Student',
    path: rolePaths[role] || '/student',
    badge: badge || 'Campus Resident',
    status: status || 'Active',
    lastActive: 'Just registered'
  };

  mockUsers.unshift(newUser);
  try {
    await User.create(newUser);
  } catch (err) {}
  res.status(201).json({ success: true, message: 'User created successfully', user: newUser, users: mockUsers });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const rolePaths = {
    'Student': '/student',
    'Room Lead': '/room-lead',
    'Floor Incharge': '/floor-incharge',
    'Block Coordinator': '/block-coordinator',
    'Mess Incharge': '/mess-incharge',
    'Principal': '/principal',
    'KFC Staff': '/kfc-staff',
    'Admin': '/dashboards'
  };

  const updatedRole = req.body.role || mockUsers[index].role;
  mockUsers[index] = {
    ...mockUsers[index],
    ...req.body,
    path: rolePaths[updatedRole] || mockUsers[index].path
  };

  try {
    await User.updateOne({ id }, { $set: mockUsers[index] });
  } catch (err) {}

  res.json({ success: true, message: 'User updated successfully', user: mockUsers[index], users: mockUsers });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  mockUsers = mockUsers.filter((u) => u.id !== id);
  try {
    await User.deleteOne({ id });
  } catch (err) {}
  res.json({ success: true, message: 'User deleted successfully', users: mockUsers });
};

/* ==========================================================================
   ROOMS & STUDENTS & SEEDER MANAGEMENT CONTROLLERS (Direct MongoDB Queries)
   ========================================================================== */
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNo: 1 }).lean();
    if (rooms && rooms.length > 0) {
      const formatted = rooms.map((r) => ({
        roomNo: r.roomNo,
        lead: r.leadName,
        members: r.totalMembers,
        submitted: r.submittedMembers,
        pending: r.pendingMembers !== undefined ? r.pendingMembers : (r.totalMembers - r.submittedMembers),
        rate: r.rate || Math.round((r.submittedMembers / r.totalMembers) * 100),
        status: r.status || 'Good',
        flagged: Boolean(r.flagged)
      }));
      return res.json({ success: true, rooms: formatted, fromMongo: true });
    }
  } catch (err) {}
  res.json({ success: true, rooms: dummyRooms, fromMongo: false });
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ studentId: 1 }).lean();
    if (students && students.length > 0) {
      const formatted = students.map((s) => ({
        rollNo: s.studentId,
        name: s.name,
        email: s.email,
        room: `${s.roomNo} • ${s.blockId === 'block-e' ? 'Block E' : 'Block D'}`,
        status: s.status,
        isRoomLead: s.isRoomLead
      }));
      return res.json({ success: true, students: formatted, fromMongo: true });
    }
  } catch (err) {}
  res.json({ success: true, students: studentRoster, fromMongo: false });
};

export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().lean();
    res.json({ success: true, attendance: records, fromMongo: true });
  } catch (err) {
    res.json({ success: true, attendance: [], fromMongo: false });
  }
};

export const runSeederApi = async (req, res) => {
  try {
    const result = await seedDatabase();
    res.json({ success: true, message: 'MongoDB seeded successfully with Block D & E dataset!', ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to seed database: ' + err.message });
  }
};

export const getSeederStatus = async (req, res) => {
  try {
    const [
      usersCount,
      studentsCount,
      roomsCount,
      menusCount,
      kfcMenuCount,
      kfcOrdersCount,
      anomaliesCount,
      blockPerfCount
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Room.countDocuments(),
      Menu.countDocuments(),
      KFCMenuItem.countDocuments(),
      KFCOrder.countDocuments(),
      Anomaly.countDocuments(),
      BlockPerformance.countDocuments()
    ]);

    res.json({
      success: true,
      connectedToMongo: true,
      counts: {
        users: usersCount,
        students: studentsCount,
        rooms: roomsCount,
        menus: menusCount,
        kfcMenuItems: kfcMenuCount,
        kfcOrders: kfcOrdersCount,
        anomalies: anomaliesCount,
        blockPerformance: blockPerfCount
      }
    });
  } catch (err) {
    res.json({
      success: false,
      connectedToMongo: false,
      error: err.message
    });
  }
};

