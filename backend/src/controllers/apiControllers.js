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
  BlockPerformance,
  Notification,
  Wastage,
  FloorRequisition,
  DietaryRequest
} from '../models/Schemas.js';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runIdempotentSeed } from '../seederService.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is mandatory in production mode.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'production-grade-smart-mess-kiet-secure-jwt-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/* ==========================================================================
   KFC MENU CONTROLLERS
   ========================================================================== */
export const getKfcMenu = async (req, res) => {
  try {
    const items = await KFCMenuItem.find().sort({ id: 1 }).lean();
    return res.json({ success: true, menu: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching KFC menu', error: err.message });
  }
};

export const updateKfcMenu = async (req, res) => {
  try {
    if (Array.isArray(req.body.menu)) {
      for (const item of req.body.menu) {
        await KFCMenuItem.updateOne(
          { id: item.id },
          { $set: item },
          { upsert: true }
        );
      }
      const updatedMenu = await KFCMenuItem.find().sort({ id: 1 }).lean();
      return res.json({ success: true, message: 'KFC Menu updated in database', menu: updatedMenu });
    }
    return res.status(400).json({ success: false, message: 'Invalid menu data provided' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error updating KFC menu', error: err.message });
  }
};

export const deleteKfcMenuItem = async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  try {
    await KFCMenuItem.deleteOne({ $or: [{ id: numId }, { id: id }] });
    const remaining = await KFCMenuItem.find().sort({ id: 1 }).lean();
    return res.json({ success: true, message: `Item ${id} removed from menu`, menu: remaining });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error deleting item', error: err.message });
  }
};

export const addKfcMenuItem = async (req, res) => {
  try {
    const newItem = {
      id: req.body.id || Date.now(),
      name: (req.body.name || '').trim(),
      price: Number(req.body.price) || 99,
      category: req.body.category || 'Snacks',
      image: req.body.image || '🍗',
      imageUrl: req.body.imageUrl || '',
      stock: Number(req.body.stock) || 20,
      isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true
    };
    if (!newItem.name) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }
    const created = await KFCMenuItem.create(newItem);
    const menu = await KFCMenuItem.find().sort({ id: 1 }).lean();
    return res.status(201).json({ success: true, item: created, menu });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating item', error: err.message });
  }
};

/* ==========================================================================
   MESS MENU & SELECTION CONTROLLERS
   ========================================================================== */
export const getMenu = async (req, res) => {
  try {
    const reqDate = req.params.date;
    const query = reqDate ? { date: reqDate } : {};
    let menuDoc = await Menu.findOne(query).sort({ createdAt: -1 }).lean();
    if (!menuDoc) {
      menuDoc = await Menu.findOne().sort({ createdAt: -1 }).lean();
    }
    if (!menuDoc) {
      return res.status(404).json({ success: false, message: 'No menu found in database' });
    }
    return res.json({ success: true, menu: menuDoc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching menu', error: err.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, snacks, dinner } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required for menu' });
    }
    const updated = await Menu.findOneAndUpdate(
      { date },
      { $set: { breakfast, lunch, snacks, dinner } },
      { upsert: true, new: true }
    );
    return res.json({ success: true, message: 'Menu saved to database', menu: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error saving menu', error: err.message });
  }
};

export const postSelections = async (req, res) => {
  try {
    let { studentId, studentName, date, breakfast, lunch, snacks, dinner, selections, meal, selected } = req.body;
    
    // Resolve studentId if not provided directly
    if (!studentId && studentName) {
      const s = await Student.findOne({ name: new RegExp(studentName, 'i') }).lean();
      studentId = s ? s.studentId : studentName;
    }

    if (!studentId || !date) {
      return res.status(400).json({ success: false, message: 'studentId and date are required' });
    }

    const parseChoice = (val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'boolean') return val ? 'will_eat' : 'will_not_eat';
      if (typeof val === 'object') return val.opted ? 'will_eat' : 'will_not_eat';
      if (typeof val === 'string') {
        const v = val.toLowerCase();
        return (v === 'will_eat' || v === 'yes' || v === 'true') ? 'will_eat' : 'will_not_eat';
      }
      return 'will_eat';
    };

    const updateFields = {};

    if (selections && typeof selections === 'object') {
      if (selections.breakfast !== undefined) updateFields.breakfast = parseChoice(selections.breakfast);
      if (selections.lunch !== undefined) updateFields.lunch = parseChoice(selections.lunch);
      if (selections.snacks !== undefined) updateFields.snacks = parseChoice(selections.snacks);
      if (selections.dinner !== undefined) updateFields.dinner = parseChoice(selections.dinner);
    }

    if (breakfast !== undefined) updateFields.breakfast = parseChoice(breakfast);
    if (lunch !== undefined) updateFields.lunch = parseChoice(lunch);
    if (snacks !== undefined) updateFields.snacks = parseChoice(snacks);
    if (dinner !== undefined) updateFields.dinner = parseChoice(dinner);

    if (meal && selected !== undefined) {
      const mealKey = meal.toLowerCase();
      if (['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealKey)) {
        updateFields[mealKey] = parseChoice(selected);
      }
    }

    // Default any undefined fields to 'will_eat' for standard defaults
    if (!updateFields.breakfast) updateFields.breakfast = 'will_eat';
    if (!updateFields.lunch) updateFields.lunch = 'will_eat';
    if (!updateFields.snacks) updateFields.snacks = 'will_not_eat';
    if (!updateFields.dinner) updateFields.dinner = 'will_eat';

    const selection = await MealSelection.findOneAndUpdate(
      { studentId, date },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    const formattedSelection = {
      ...selection.toObject(),
      selections: {
        breakfast: { opted: selection.breakfast === 'will_eat' },
        lunch: { opted: selection.lunch === 'will_eat' },
        snacks: { opted: selection.snacks === 'will_eat' },
        dinner: { opted: selection.dinner === 'will_eat' }
      }
    };

    return res.json({ success: true, message: 'Student meal plan saved to database', selection: formattedSelection });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error saving selections', error: err.message });
  }
};

export const getStudentSelection = async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const selection = await MealSelection.findOne({ studentId, date }).lean();
    if (!selection) {
      return res.json({ success: true, selection: null });
    }
    const formattedSelection = {
      ...selection,
      selections: {
        breakfast: { opted: selection.breakfast === 'will_eat' },
        lunch: { opted: selection.lunch === 'will_eat' },
        snacks: { opted: selection.snacks === 'will_eat' },
        dinner: { opted: selection.dinner === 'will_eat' }
      }
    };
    return res.json({ success: true, selection: formattedSelection });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching selection', error: err.message });
  }
};

export const getStudentMealHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const history = await MealSelection.find({ studentId }).sort({ date: -1 }).limit(14).lean();
    const formatted = history.map((h, idx) => ({
      id: h._id ? String(h._id) : String(idx + 1),
      date: h.date,
      dateCode: h.date,
      breakfast: h.breakfast === 'will_eat',
      lunch: h.lunch === 'will_eat',
      snacks: h.snacks === 'will_eat',
      dinner: h.dinner === 'will_eat',
      status: 'Submitted'
    }));
    return res.json({ success: true, history: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching meal history', error: err.message });
  }
};

/* ==========================================================================
   ROOMS, ATTENDANCE & ROOM MEMBERS
   ========================================================================== */
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ roomNo: 1 }).lean();
    const formatted = rooms.map((r) => ({
      roomNo: r.roomNo,
      lead: r.leadName,
      members: r.totalMembers || 5,
      submitted: r.submittedMembers || 0,
      pending: r.pendingMembers !== undefined ? r.pendingMembers : Math.max(0, (r.totalMembers || 5) - (r.submittedMembers || 0)),
      rate: r.rate || Math.round(((r.submittedMembers || 0) / (r.totalMembers || 5)) * 100),
      status: r.status || 'Good',
      flagged: Boolean(r.flagged)
    }));
    return res.json({ success: true, rooms: formatted, fromMongo: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching rooms', error: err.message });
  }
};

export const getRoomMembers = async (req, res) => {
  try {
    const { roomNo } = req.params;
    const targetRoom = decodeURIComponent(roomNo);
    const date = req.query.date || '2026-10-01';

    const students = await Student.find({
      $or: [{ roomNo: targetRoom }, { roomNo: `Room ${targetRoom}` }]
    }).sort({ studentId: 1 }).lean();

    const selections = await MealSelection.find({
      studentId: { $in: students.map(s => s.studentId) },
      date
    }).lean();

    const selectionMap = new Map();
    selections.forEach(sel => selectionMap.set(sel.studentId, sel));

    const members = students.map((s, idx) => {
      const sel = selectionMap.get(s.studentId);
      return {
        id: idx + 1,
        studentId: s.studentId,
        name: s.name + (s.isRoomLead ? ' (Lead)' : ''),
        status: s.status || (sel ? 'Submitted' : 'Pending'),
        time: s.status === 'Submitted' ? '09:15 AM' : '--',
        choices: sel ? {
          b: sel.breakfast === 'will_eat' ? 'Yes' : 'No',
          l: sel.lunch === 'will_eat' ? 'Yes' : 'No',
          s: sel.snacks === 'will_eat' ? 'Yes' : 'No',
          d: sel.dinner === 'will_eat' ? 'Yes' : 'No'
        } : { b: 'Yes', l: 'Yes', s: 'No', d: 'Yes' }
      };
    });

    return res.json({ success: true, roomNo: targetRoom, members });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching room members', error: err.message });
  }
};

export const updateRoomMemberMeal = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { date = '2026-10-01', choices, mealType, opted, status = 'Submitted' } = req.body;
    
    let b = 'Yes', l = 'Yes', s = 'No', d = 'Yes';
    if (choices) {
      b = choices.b !== undefined ? choices.b : (choices.breakfast ? 'Yes' : 'No');
      l = choices.l !== undefined ? choices.l : (choices.lunch ? 'Yes' : 'No');
      s = choices.s !== undefined ? choices.s : (choices.snacks ? 'Yes' : 'No');
      d = choices.d !== undefined ? choices.d : (choices.dinner ? 'Yes' : 'No');
    } else if (mealType) {
      const choiceVal = (opted !== false && opted !== 'No') ? 'Yes' : 'No';
      if (mealType === 'breakfast' || mealType === 'b') b = choiceVal;
      if (mealType === 'lunch' || mealType === 'l') l = choiceVal;
      if (mealType === 'snacks' || mealType === 's') s = choiceVal;
      if (mealType === 'dinner' || mealType === 'd') d = choiceVal;
    }

    const update = {
      studentId,
      date,
      breakfast: b === 'Yes' ? 'will_eat' : 'will_not_eat',
      lunch: l === 'Yes' ? 'will_eat' : 'will_not_eat',
      snacks: s === 'Yes' ? 'will_eat' : 'will_not_eat',
      dinner: d === 'Yes' ? 'will_eat' : 'will_not_eat'
    };
    await MealSelection.findOneAndUpdate({ studentId, date }, { $set: update }, { upsert: true });
    await Student.updateOne(
      { $or: [{ studentId }, { name: new RegExp(studentId, 'i') }] },
      { $set: { status } }
    );
    return res.json({ success: true, message: 'Room member meal updated', choices: { b, l, s, d } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error updating member meal', error: err.message });
  }
};

export const getFloorAttendance = async (req, res) => {
  try {
    const { floorId } = req.params;
    const cleanFloor = (floorId || '').toLowerCase().trim();
    const students = await Student.find({
      $or: [
        { floorId: cleanFloor },
        { floorId: `floor-d${cleanFloor.replace(/\D/g, '')}` },
        { floorId: `floor-e${cleanFloor.replace(/\D/g, '')}` },
        { floorId: new RegExp(cleanFloor.replace(/floor-?/i, ''), 'i') }
      ]
    }).sort({ roomNo: 1, studentId: 1 }).lean();

    const rooms = {};
    students.forEach((s) => {
      if (!rooms[s.roomNo]) {
        rooms[s.roomNo] = { verified: s.status === 'Submitted', students: [] };
      }
      rooms[s.roomNo].students.push({
        id: s.studentId,
        name: s.name + (s.isRoomLead ? ' (Lead)' : ''),
        status: s.status === 'Pending' ? 'Absent' : 'Present'
      });
    });
    return res.json({ success: true, floorId, rooms });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching floor attendance', error: err.message });
  }
};

export const saveRoomAttendance = async (req, res) => {
  try {
    const { roomNo } = req.params;
    const { verified = true } = req.body;
    await Room.updateOne({ roomNo }, { $set: { status: verified ? 'High' : 'Pending' } });
    return res.json({ success: true, message: `Attendance verified for ${roomNo}`, verified });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error saving room attendance', error: err.message });
  }
};

export const flagRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findOne({ roomNo: id });
    if (!room) {
      return res.status(404).json({ success: false, message: `Room ${id} not found` });
    }
    room.flagged = !room.flagged;
    await room.save();
    return res.json({ success: true, message: `Room ${id} flagged status toggled`, flagged: room.flagged });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error toggling flag', error: err.message });
  }
};

/* ==========================================================================
   AGGREGATIONS & FLOOR / BLOCK / MESS
   ========================================================================== */
export const getFloorAggregation = async (req, res) => {
  const { floorId } = req.params;
  const targetFloor = floorId || 'floor-d1';
  try {
    const roomDocs = await Room.find({ floorId: targetFloor }).lean();
    if (!roomDocs || roomDocs.length === 0) {
      return res.status(404).json({ success: false, message: `No rooms found for floor ${targetFloor}` });
    }
    const rooms = roomDocs.map(r => ({
      roomNo: r.roomNo,
      lead: r.leadName,
      members: r.totalMembers || 5,
      submitted: r.submittedMembers || 0,
      pending: r.pendingMembers !== undefined ? r.pendingMembers : Math.max(0, (r.totalMembers || 5) - (r.submittedMembers || 0)),
      rate: r.rate || Math.round(((r.submittedMembers || 0) / (r.totalMembers || 5)) * 100),
      status: r.status || 'Good',
      flagged: Boolean(r.flagged)
    }));

    const totalStudents = rooms.reduce((acc, r) => acc + (r.members || 0), 0);
    const submittedStudents = rooms.reduce((acc, r) => acc + (r.submitted || 0), 0);
    const pendingStudents = Math.max(0, totalStudents - submittedStudents);
    const avgParticipation = totalStudents > 0 ? Math.round((submittedStudents / totalStudents) * 100) : 0;

    return res.json({
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
        breakfast: { selected: Math.round(submittedStudents * 0.9), total: totalStudents, percentage: totalStudents ? Math.round((submittedStudents * 0.9 / totalStudents) * 100) : 0 },
        lunch: { selected: submittedStudents, total: totalStudents, percentage: totalStudents ? Math.round((submittedStudents / totalStudents) * 100) : 0 },
        snacks: { selected: Math.round(submittedStudents * 0.8), total: totalStudents, percentage: totalStudents ? Math.round((submittedStudents * 0.8 / totalStudents) * 100) : 0 },
        dinner: { selected: submittedStudents, total: totalStudents, percentage: totalStudents ? Math.round((submittedStudents / totalStudents) * 100) : 0 }
      },
      rooms
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching floor aggregation', error: err.message });
  }
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
        totalFloors: 2,
        totalSubmissions: agg.lunchCount || (targetBlock === 'block-d' ? 104 : 89),
        overallRate: agg.participationRate || 94.5,
        mealCounts: {
          breakfast: agg.breakfastCount,
          lunch: agg.lunchCount,
          snacks: agg.snacksCount,
          dinner: agg.dinnerCount
        }
      });
    }
    return res.status(404).json({ success: false, message: `Block aggregation not found for ${targetBlock}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching block aggregation', error: err.message });
  }
};

export const getMessAggregation = async (req, res) => {
  try {
    const date = req.params.date || '2026-10-01';
    const agg = await Aggregation.findOne({ scope: 'mess', date }).lean();
    const breakfast = agg?.breakfastCount || 169;
    const lunch = agg?.lunchCount || 185;
    const snacks = agg?.snacksCount || 140;
    const dinner = agg?.dinnerCount || 178;

    return res.json({
      success: true,
      date,
      headcount: [
        { meal: 'Breakfast', selected: breakfast, predicted: breakfast + 6, actual: breakfast + 3, variance: '+6' },
        { meal: 'Lunch', selected: lunch, predicted: lunch + 7, actual: lunch + 4, variance: '+7' },
        { meal: 'Snacks', selected: snacks, predicted: snacks + 8, actual: snacks + 5, variance: '+8' },
        { meal: 'Dinner', selected: dinner, predicted: dinner + 6, actual: dinner + 2, variance: '+6' }
      ]
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching mess aggregation', error: err.message });
  }
};

/* ==========================================================================
   KFC ORDERS CONTROLLERS
   ========================================================================== */
export const getKfcOrders = async (req, res) => {
  try {
    const orders = await KFCOrder.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 }).lean();
    const formatted = orders.map((o) => ({
      id: o.orderId || o.id,
      orderId: o.orderId,
      token: o.token,
      studentName: o.studentName,
      studentRoll: o.studentRoll,
      room: o.room,
      items: o.items,
      totalAmount: o.totalAmount,
      orderTime: o.orderTime,
      placedAt: o.placedAt || o.createdAt,
      status: o.status,
      feedback: o.feedback
    }));
    return res.json({ success: true, orders: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching KFC orders', error: err.message });
  }
};

export const getStudentKfcOrders = async (req, res) => {
  try {
    const { rollNo } = req.params;
    const studentName = req.query.name;
    const filter = [];
    if (rollNo) {
      filter.push({ studentRoll: new RegExp(rollNo, 'i') });
      filter.push({ token: new RegExp(rollNo, 'i') });
      filter.push({ studentName: new RegExp(rollNo, 'i') });
    }
    if (studentName) {
      filter.push({ studentName: new RegExp(studentName, 'i') });
    }

    // If rollNo matches a student in DB, also match their student name
    if (rollNo && !studentName) {
      const student = await Student.findOne({ studentId: new RegExp(`^${rollNo}$`, 'i') }).lean();
      if (student?.name) {
        filter.push({ studentName: new RegExp(student.name, 'i') });
      }
    }

    const query = filter.length > 0 ? { $or: filter } : {};
    const orders = await KFCOrder.find(query).sort({ createdAt: -1 }).lean();
    const formatted = orders.map((o) => ({
      id: o.orderId || o.id,
      orderId: o.orderId,
      token: o.token,
      studentName: o.studentName,
      studentRoll: o.studentRoll,
      room: o.room,
      items: o.items,
      totalAmount: o.totalAmount,
      orderTime: o.orderTime,
      placedAt: o.placedAt || o.createdAt,
      status: o.status,
      feedback: o.feedback,
      date: 'Recent'
    }));
    return res.json({ success: true, orders: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching student orders', error: err.message });
  }
};

export const clearKfcOrders = async (req, res) => {
  try {
    await KFCOrder.updateMany({ status: { $ne: 'Archived' } }, { $set: { status: 'Archived' } });
    return res.json({ success: true, message: 'Active KFC orders archived in database', orders: [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error archiving orders', error: err.message });
  }
};

export const createKfcOrder = async (req, res) => {
  try {
    const orderDoc = {
      orderId: req.body.id || req.body.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      token: req.body.token || `KFC-${Math.floor(10 + Math.random() * 90)}`,
      studentName: req.body.studentName || 'Student',
      studentRoll: req.body.studentRoll || req.body.rollNo || '',
      room: req.body.room || req.body.studentRoom || 'Room D-101',
      items: req.body.items || [],
      totalAmount: req.body.totalAmount || 0,
      orderTime: req.body.orderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: req.body.status || 'Pending'
    };
    const created = await KFCOrder.create(orderDoc);
    const activeOrders = await KFCOrder.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 }).lean();
    const formatted = activeOrders.map(o => ({
      id: o.orderId || o.id,
      orderId: o.orderId,
      token: o.token,
      studentName: o.studentName,
      studentRoll: o.studentRoll,
      room: o.room,
      items: o.items,
      totalAmount: o.totalAmount,
      orderTime: o.orderTime,
      placedAt: o.placedAt || o.createdAt,
      status: o.status,
      feedback: o.feedback
    }));
    return res.status(201).json({
      success: true,
      order: {
        id: created.orderId,
        orderId: created.orderId,
        token: created.token,
        studentName: created.studentName,
        studentRoll: created.studentRoll,
        room: created.room,
        items: created.items,
        totalAmount: created.totalAmount,
        orderTime: created.orderTime,
        placedAt: created.placedAt || created.createdAt,
        status: created.status,
        feedback: created.feedback
      },
      orders: formatted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating KFC order', error: err.message });
  }
};

export const updateKfcOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, feedback, rating, comment } = req.body;
  try {
    const updateDoc = {};
    if (status) updateDoc.status = status;
    if (feedback) {
      updateDoc.feedback = feedback;
    } else if (rating !== undefined && rating !== null) {
      updateDoc.feedback = {
        rating: Number(rating) || 5,
        comment: (comment || '').trim(),
        submittedAt: new Date()
      };
    }

    const orList = [
      { orderId: id },
      { token: id }
    ];
    if (req.body.token) orList.push({ token: req.body.token });
    if (req.body.orderId) orList.push({ orderId: req.body.orderId });
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      orList.push({ _id: id });
    }
    const query = { $or: orList };
    await KFCOrder.updateOne(query, { $set: updateDoc });
    const updated = await KFCOrder.findOne(query).lean();
    const activeOrders = await KFCOrder.find({ status: { $ne: 'Archived' } }).sort({ createdAt: -1 }).lean();
    const formatted = activeOrders.map(o => ({
      id: o.orderId || o.id,
      orderId: o.orderId,
      token: o.token,
      studentName: o.studentName,
      studentRoll: o.studentRoll,
      room: o.room,
      items: o.items,
      totalAmount: o.totalAmount,
      orderTime: o.orderTime,
      placedAt: o.placedAt || o.createdAt,
      status: o.status,
      feedback: o.feedback
    }));
    return res.json({
      success: true,
      message: `Order status updated to ${status || 'updated'}`,
      order: updated ? {
        id: updated.orderId,
        orderId: updated.orderId,
        token: updated.token,
        studentName: updated.studentName,
        studentRoll: updated.studentRoll,
        room: updated.room,
        items: updated.items,
        totalAmount: updated.totalAmount,
        orderTime: updated.orderTime,
        placedAt: updated.placedAt || updated.createdAt,
        status: updated.status,
        feedback: updated.feedback
      } : null,
      orders: formatted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error updating order status', error: err.message });
  }
};

/* ==========================================================================
   NOTIFICATIONS, REQUISITIONS & DIETARY REQUESTS
   ========================================================================== */
export const getNotifications = async (req, res) => {
  try {
    const { roomNo, role } = req.query;
    const query = {};
    if (roomNo) query.roomNo = roomNo;
    const notifs = await Notification.find(query).sort({ timestamp: -1 }).lean();
    return res.json({ success: true, notifications: notifs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching notifications', error: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notif = await Notification.create({
      id: req.body.id || `NOTIF-${Date.now()}`,
      title: req.body.title,
      message: req.body.message,
      sender: req.body.sender,
      roomNo: req.body.roomNo || '',
      time: req.body.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: req.body.timestamp || Date.now(),
      read: false,
      type: req.body.type || 'reminder'
    });
    return res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating notification', error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.updateOne({ id }, { $set: { read: true } });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error updating notification', error: err.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    const { roomNo } = req.query;
    const query = roomNo ? { roomNo } : {};
    await Notification.updateMany(query, { $set: { read: true, cleared: true } });
    return res.json({ success: true, message: 'Notifications cleared' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error clearing notifications', error: err.message });
  }
};

export const getFloorRequisitions = async (req, res) => {
  try {
    const reqs = await FloorRequisition.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, requisitions: reqs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching requisitions', error: err.message });
  }
};

export const createFloorRequisition = async (req, res) => {
  try {
    const reqDoc = await FloorRequisition.create(req.body);
    return res.status(201).json({ success: true, requisition: reqDoc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating requisition', error: err.message });
  }
};

export const getDietaryRequests = async (req, res) => {
  try {
    const { studentId } = req.query;
    const query = studentId ? { studentId } : {};
    const requests = await DietaryRequest.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, requests });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching dietary requests', error: err.message });
  }
};

export const createDietaryRequest = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.role === 'Student') {
      payload.studentRoll = req.user.rollNo || req.user.id;
      payload.studentName = req.user.name || payload.studentName;
    }
    const doc = await DietaryRequest.create(payload);
    return res.status(201).json({ success: true, request: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating dietary request', error: err.message });
  }
};

/* ==========================================================================
   PRINCIPAL ANALYTICS & WASTAGE
   ========================================================================== */
export const getPrincipalAnalytics = async (req, res) => {
  try {
    const [wastageDocs, blockDocs, orderCount, kfcOrders] = await Promise.all([
      Wastage.find().sort({ date: 1 }).lean(),
      BlockPerformance.find().lean(),
      KFCOrder.countDocuments({ status: { $ne: 'Archived' } }),
      KFCOrder.find().limit(10).lean()
    ]);

    const revenue = kfcOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgWastage = wastageDocs.length > 0
      ? (wastageDocs.reduce((sum, w) => sum + (w.actualKg || 0), 0) / wastageDocs.length).toFixed(1) + ' kg/day'
      : '5.2 kg/day';

    return res.json({
      success: true,
      analytics: {
        avgWastage,
        messRating: '4.4',
        kfcOrders14d: orderCount,
        kfcRevenue: revenue || 3420,
        predictedVsActual: wastageDocs.map((w) => ({
          date: (w.date || '').slice(5) || w.day,
          actual: w.actualKg,
          predicted: w.targetKg
        })),
        blockRates: blockDocs.map((b) => ({
          block: b.block,
          ratio: `${b.submitted}/${b.total}`,
          rate: b.rate
        }))
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching principal analytics', error: err.message });
  }
};

export const getWastageAnalytics = async (req, res) => {
  try {
    const wastage = await Wastage.find().sort({ date: 1 }).lean();
    return res.json({ success: true, wastage, wastageTrend: wastage });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching wastage analytics', error: err.message });
  }
};

export const getBlockPerformance = async (req, res) => {
  try {
    const perf = await BlockPerformance.find().lean();
    return res.json({ success: true, blockPerformance: perf });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching block performance', error: err.message });
  }
};

/* ==========================================================================
   AI FORECAST & ANOMALIES
   ========================================================================== */
export const calculateAIPrediction = (historicalList, meal = 'Lunch', currentSelections = 185, options = {}) => {
  const { scenario = 'standard', dayOfWeek = 'Thu' } = options;

  const mealHistory = (historicalList || [])
    .filter((h) => (h.meal || '').toLowerCase() === meal.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const recent7 = mealHistory.slice(0, 7);

  const wmaWeights = [0.30, 0.22, 0.16, 0.12, 0.09, 0.06, 0.05];
  let weightedTurnoutSum = 0;
  let totalWeight = 0;
  let totalSelected = 0;
  let totalActual = 0;
  let absPercentageErrors = [];

  recent7.forEach((item, idx) => {
    const w = wmaWeights[idx] || 0.05;
    const actual = item.actualCount || 190;
    const selected = item.selectedCount || 185;
    const pred = item.predictedCount || actual;

    weightedTurnoutSum += actual * w;
    totalWeight += w;
    totalSelected += selected;
    totalActual += actual;

    const err = Math.abs(actual - pred) / (actual || 1);
    absPercentageErrors.push(err);
  });

  const wma = totalWeight > 0 ? weightedTurnoutSum / totalWeight : 190;
  const historicalTurnoutRatio = totalSelected > 0 ? (totalActual / totalSelected) : 1.035;

  const dowFactors = { Mon: 1.01, Tue: 1.00, Wed: 1.03, Thu: 1.01, Fri: 0.99, Sat: 0.85, Sun: 0.92 };
  const dowFactor = dowFactors[dayOfWeek] || 1.01;

  const scenarioMultipliers = {
    standard: 1.00,
    rainy: 1.08,
    exam: 1.12,
    weekend_leave: 0.82,
    festival_feast: 1.15
  };
  const scenarioMultiplier = scenarioMultipliers[scenario] || 1.00;

  const baseForecast = (0.65 * (currentSelections * historicalTurnoutRatio)) + (0.35 * wma);
  const predictedCount = Math.round(baseForecast * dowFactor * scenarioMultiplier);

  const meanAbsPercError = absPercentageErrors.length > 0
    ? (absPercentageErrors.reduce((a, b) => a + b, 0) / absPercentageErrors.length) * 100
    : 2.8;
  const confidence = Math.max(88.0, Math.min(97.8, parseFloat((100 - (meanAbsPercError * 1.35)).toFixed(1))));

  const margin = Math.max(3, Math.round(predictedCount * ((100 - confidence) / 100)));
  const confidenceInterval = { min: predictedCount - margin, max: predictedCount + margin };

  const bufferPortions = Math.max(5, Math.ceil(predictedCount * 0.042));
  const prepTarget = predictedCount + bufferPortions;

  const kitchenBatch = {
    rawRiceKg: parseFloat((prepTarget * 0.16).toFixed(1)),
    dalLiters: parseFloat((prepTarget * 0.14).toFixed(1)),
    vegPaneerKg: parseFloat((prepTarget * 0.16).toFixed(1)),
    rotisPcs: prepTarget * 3,
    oilSpicesKg: parseFloat((prepTarget * 0.022).toFixed(1)),
    bufferKg: parseFloat((bufferPortions * 0.28).toFixed(1)),
    prepTarget,
    bufferPortions
  };

  const staticPrepCount = 205;
  const staticWasteKg = parseFloat(((staticPrepCount - predictedCount) * 0.38 + 5.2).toFixed(1));
  const aiWasteKg = parseFloat((bufferPortions * 0.38 + 1.6).toFixed(1));
  const wasteSavedKg = Math.max(0, parseFloat((staticWasteKg - aiWasteKg).toFixed(1)));
  const costSavedRs = Math.round(wasteSavedKg * 180);

  const pastTrend = recent7.map((item) => ({
    date: item.date,
    day: item.day || 'Thu',
    selected: item.selectedCount || 0,
    actual: item.actualCount || 0,
    predicted: item.predictedCount || item.actualCount || 0,
    variance: (item.actualCount || 0) - (item.selectedCount || 0),
    accuracy: item.accuracy || 97.2,
    wastageKg: item.wastageKg || 5.0,
    event: item.event || 'Regular Dining'
  })).reverse();

  return {
    meal,
    dayOfWeek,
    scenario,
    selectedCount: currentSelections,
    predictedCount,
    confidence,
    confidenceInterval,
    bufferPortions,
    prepTarget,
    historicalTurnoutRatio: parseFloat(historicalTurnoutRatio.toFixed(3)),
    wma: Math.round(wma),
    kitchenBatch,
    wastageMetrics: {
      staticWasteKg,
      aiWasteKg,
      wasteSavedKg,
      costSavedRs,
      wasteReductionPct: Math.round((wasteSavedKg / (staticWasteKg || 1)) * 100)
    },
    pastTrend
  };
};

export const getAIForecast = async (req, res) => {
  const meal = req.query.meal || 'Lunch';
  const scope = req.params.scope || 'mess';
  const date = req.params.date || '2026-10-01';
  const scenario = req.query.scenario || 'standard';
  const customSelected = req.query.customSelected ? parseInt(req.query.customSelected, 10) : null;

  try {
    const dbAttendance = await Attendance.find().lean();
    if (!dbAttendance || dbAttendance.length === 0) {
      return res.status(500).json({ success: false, message: 'No attendance records found in MongoDB for AI forecasting' });
    }

    let currentSelections = customSelected;
    if (!currentSelections) {
      const defaultMealSelections = { Breakfast: 169, Lunch: 185, Snacks: 140, Dinner: 178 };
      currentSelections = defaultMealSelections[meal] || 185;
    }

    let dayOfWeek = 'Thu';
    const d = new Date(date);
    if (!isNaN(d.getDay())) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayOfWeek = days[d.getDay()];
    }

    const forecast = calculateAIPrediction(dbAttendance, meal, currentSelections, { scenario, dayOfWeek });
    return res.json({ success: true, scope, date, ...forecast });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error calculating AI forecast', error: err.message });
  }
};

export const getAIHistoricalData = async (req, res) => {
  const meal = req.query.meal;
  try {
    const dbAttendance = await Attendance.find().lean();
    const filtered = meal
      ? dbAttendance.filter((h) => (h.meal || '').toLowerCase() === meal.toLowerCase())
      : dbAttendance;
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.json({
      success: true,
      meal: meal || 'All',
      count: filtered.length,
      history: filtered,
      records: dbAttendance
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching historical data', error: err.message });
  }
};

export const simulateAIForecast = async (req, res) => {
  const { meal = 'Lunch', scenario = 'standard', customSelected = 185, date = '2026-10-01' } = req.body;
  try {
    const dbAttendance = await Attendance.find().lean();
    let dayOfWeek = 'Thu';
    const d = new Date(date);
    if (!isNaN(d.getDay())) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayOfWeek = days[d.getDay()];
    }
    const forecast = calculateAIPrediction(dbAttendance, meal, Number(customSelected) || 185, { scenario, dayOfWeek });
    return res.json({ success: true, ...forecast });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error simulating forecast', error: err.message });
  }
};

export const getAIAnomalies = async (req, res) => {
  try {
    const anomalies = await Anomaly.find().lean();
    return res.json({
      success: true,
      anomalies: anomalies.map((a, idx) => ({
        id: a._id ? String(a._id) : idx + 1,
        title: a.title,
        scope: a.scopeId || a.scope,
        description: a.description,
        severity: a.severity,
        actionRequired: 'Apply Policy'
      }))
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching anomalies', error: err.message });
  }
};

/* ==========================================================================
   USER AUTHENTICATION & MANAGEMENT
   ========================================================================== */
export const getDemoUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching users', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const rawId = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!rawId) {
    return res.status(400).json({ success: false, message: 'Roll number or campus email is required' });
  }

  const roomLeadShorthands = {
    'd101': 'nithin.roomlead@gmail.com',
    'd-101': 'nithin.roomlead@gmail.com',
    'room d-101': 'nithin.roomlead@gmail.com',
    'roomd101': 'nithin.roomlead@gmail.com',
    'alex.lead@kiet.edu': 'nithin.roomlead@gmail.com',
    'd101.lead@kiet.edu': 'nithin.roomlead@gmail.com',
    'nithin.roomd101@gmail.com': 'nithin.roomlead@gmail.com',
    'lead.d101': 'nithin.roomlead@gmail.com',
    'd102': 'abhishek.lead@kiet.edu',
    'd-102': 'abhishek.lead@kiet.edu',
    'room d-102': 'abhishek.lead@kiet.edu',
    'roomd102': 'abhishek.lead@kiet.edu',
    'lead.d102': 'abhishek.lead@kiet.edu',
    'd201': 'prashant.lead@kiet.edu',
    'd-201': 'prashant.lead@kiet.edu',
    'room d-201': 'prashant.lead@kiet.edu',
    'roomd201': 'prashant.lead@kiet.edu',
    'lead.d201': 'prashant.lead@kiet.edu',
    'd202': 'vaibhav.lead@kiet.edu',
    'd-202': 'vaibhav.lead@kiet.edu',
    'room d-202': 'vaibhav.lead@kiet.edu',
    'roomd202': 'vaibhav.lead@kiet.edu',
    'lead.d202': 'vaibhav.lead@kiet.edu',
    'e101': 'sriram.lead@kiet.edu',
    'e-101': 'sriram.lead@kiet.edu',
    'room e-101': 'sriram.lead@kiet.edu',
    'roome101': 'sriram.lead@kiet.edu',
    'lead.e101': 'sriram.lead@kiet.edu',
    'e102': 'aaditya.lead@kiet.edu',
    'e-102': 'aaditya.lead@kiet.edu',
    'room e-102': 'aaditya.lead@kiet.edu',
    'roome102': 'aaditya.lead@kiet.edu',
    'lead.e102': 'aaditya.lead@kiet.edu',
    'e201': 'kavya.lead@kiet.edu',
    'e-201': 'kavya.lead@kiet.edu',
    'room e-201': 'kavya.lead@kiet.edu',
    'roome201': 'kavya.lead@kiet.edu',
    'lead.e201': 'kavya.lead@kiet.edu',
    'e202': 'pooja.lead@kiet.edu',
    'e-202': 'pooja.lead@kiet.edu',
    'room e-202': 'pooja.lead@kiet.edu',
    'roome202': 'pooja.lead@kiet.edu',
    'lead.e202': 'pooja.lead@kiet.edu'
  };

  const roleShorthands = {
    'admin': 'admin@gmail.com',
    'admin@kiet.edu': 'admin@gmail.com',
    'admin@gmail.com': 'admin@gmail.com',
    'kfc': 'nithin.kfcstaff@gmail.com',
    'kfcstaff': 'nithin.kfcstaff@gmail.com',
    'kfc.staff@kiet.edu': 'nithin.kfcstaff@gmail.com',
    'mess': 'nithin.mess@gmail.com',
    'messincharge': 'nithin.mess@gmail.com',
    'mess.incharge@kiet.edu': 'nithin.mess@gmail.com',
    'principal': 'nithin.principal@gmail.com',
    'principal@kiet.edu': 'nithin.principal@gmail.com',
    'floor': 'nithin.floor@gmail.com',
    'floorincharge': 'nithin.floor@gmail.com',
    'floor.d1@kiet.edu': 'nithin.floor@gmail.com',
    'block': 'nithin.block@gmail.com',
    'blockcoordinator': 'nithin.block@gmail.com',
    'block.d@kiet.edu': 'nithin.block@gmail.com'
  };

  const targetEmailOrRoll = roomLeadShorthands[rawId] || roleShorthands[rawId] || rawId;

  try {
    let dbUser = await User.findOne({
      $or: [
        { email: new RegExp(`^${targetEmailOrRoll}$`, 'i') },
        { rollNo: new RegExp(`^${targetEmailOrRoll}$`, 'i') },
        { id: new RegExp(`^${targetEmailOrRoll}$`, 'i') }
      ]
    }).lean();

    if (!dbUser && rawId.length >= 3) {
      dbUser = await User.findOne({
        $or: [
          { email: new RegExp(`^${rawId}`, 'i') },
          { rollNo: new RegExp(rawId, 'i') },
          { name: new RegExp(`^${rawId}$`, 'i') },
          { badge: new RegExp(rawId, 'i') }
        ]
      }).lean();
    }

    if (!dbUser) {
      const dbStudent = await Student.findOne({
        $or: [
          { studentId: new RegExp(`^${targetEmailOrRoll}$`, 'i') },
          { email: new RegExp(`^${targetEmailOrRoll}$`, 'i') },
          { name: new RegExp(`^${targetEmailOrRoll}$`, 'i') }
        ]
      }).lean();

      if (dbStudent) {
        dbUser = {
          id: dbStudent.studentId,
          name: dbStudent.name,
          email: dbStudent.email,
          rollNo: dbStudent.studentId,
          role: 'Student',
          path: '/student',
          badge: `${dbStudent.roomNo} • ${dbStudent.blockId === 'block-e' ? 'Block E' : 'Block D'}`,
          status: dbStudent.status || 'Active',
          lastActive: 'Just now',
          password: ''
        };
      }
    }

    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'Account not found in database. Check credentials.' });
    }

    if (dbUser.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by campus administration.' });
    }

    // Bcrypt Password Verification + Safe Progressive Hash Migration
    let passwordMatches = false;
    const userHash = dbUser.password || '';
    const isBcryptHash = userHash.startsWith('$2a$') || userHash.startsWith('$2b$');

    if (isBcryptHash) {
      passwordMatches = await bcrypt.compare(cleanPass, userHash);
      // Student fallback if needed (rollNo or 123456789)
      if (!passwordMatches && dbUser.role === 'Student') {
        const studentRoll = (dbUser.rollNo || '').toLowerCase();
        if ((studentRoll && cleanPass.toLowerCase() === studentRoll) || cleanPass === '123456789') {
          passwordMatches = true;
          try {
            const newHash = await bcrypt.hash(cleanPass, 10);
            await User.updateOne({ _id: dbUser._id }, { $set: { password: newHash } });
          } catch (migErr) {}
        }
      }
    } else {
      // Plaintext fallback for unmigrated user records
      const expectedPass = dbUser.role === 'Student'
        ? (dbUser.rollNo || '').toLowerCase()
        : (dbUser.password || '123456789');

      if (
        cleanPass.toLowerCase() === expectedPass.toLowerCase() ||
        cleanPass === '123456789' ||
        (dbUser.password && cleanPass === dbUser.password)
      ) {
        passwordMatches = true;
        // Progressively upgrade to bcrypt hash in database
        try {
          const newHash = await bcrypt.hash(cleanPass, 10);
          await User.updateOne(
            { $or: [{ id: dbUser.id }, { email: dbUser.email }, { rollNo: dbUser.rollNo }] },
            { $set: { password: newHash } }
          );
        } catch (migErr) {
          console.error('Progressive password upgrade error:', migErr.message);
        }
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: dbUser.role === 'Student'
          ? 'Invalid password. For students, default password is your Roll Number or 123456789.'
          : 'Invalid credentials. Please verify your password.'
      });
    }

    // Issue signed JWT
    const tokenPayload = {
      id: dbUser.id || (dbUser._id ? dbUser._id.toString() : dbUser.rollNo),
      email: dbUser.email,
      role: dbUser.role,
      rollNo: dbUser.rollNo || dbUser.id,
      name: dbUser.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const { password: _, ...safeUser } = dbUser;
    return res.json({
      success: true,
      user: safeUser,
      token
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error during authentication', error: err.message });
  }
};

export const switchUserToken = async (req, res) => {
  try {
    const { id, email, role, rollNo, name } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const orConditions = [];
    if (email) orConditions.push({ email: new RegExp(`^${email}$`, 'i') });
    if (rollNo) orConditions.push({ rollNo: new RegExp(`^${rollNo}$`, 'i') });
    if (id) orConditions.push({ id: new RegExp(`^${id}$`, 'i') });

    let dbUser = null;
    if (orConditions.length > 0) {
      dbUser = await User.findOne({ $or: orConditions }).lean();
    }

    if (!dbUser && role === 'Student' && (rollNo || id)) {
      const targetRoll = rollNo || id;
      const dbStudent = await Student.findOne({ studentId: new RegExp(`^${targetRoll}$`, 'i') }).lean();
      if (dbStudent) {
        dbUser = {
          id: dbStudent.studentId,
          name: dbStudent.name,
          email: dbStudent.email,
          rollNo: dbStudent.studentId,
          role: 'Student',
          path: '/student',
          badge: `${dbStudent.roomNo} • ${dbStudent.blockId === 'block-e' ? 'Block E' : 'Block D'}`
        };
      }
    }

    const resolvedUser = dbUser || {
      id: id || rollNo || `USR-${Date.now()}`,
      email: email || '',
      role: role || 'Student',
      rollNo: rollNo || id || '',
      name: name || 'Campus User',
      path: role === 'KFC Staff' ? '/kfc-staff' : '/student'
    };

    const tokenPayload = {
      id: resolvedUser.id || (resolvedUser._id ? resolvedUser._id.toString() : resolvedUser.rollNo),
      email: resolvedUser.email,
      role: resolvedUser.role,
      rollNo: resolvedUser.rollNo || resolvedUser.id,
      name: resolvedUser.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' });
    const { password: _, ...safeUser } = resolvedUser;
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error generating switch session token', error: err.message });
  }
};


export const getUsers = async (req, res) => {
  try {
    const roleFilter = req.query.role;
    const query = roleFilter ? { role: roleFilter } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching users', error: err.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, role, badge, status, rollNo, password } = req.body;
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

  try {
    const rawPass = (password || (rollNo ? rollNo : '123456789')).trim();
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rollNo: rollNo || '',
      role: role || 'Student',
      path: rolePaths[role] || '/student',
      badge: badge || 'Campus Resident',
      status: status || 'Active',
      lastActive: 'Just registered',
      password: hashedPassword
    };

    const created = await User.create(newUser);
    const { password: _, ...safeCreated } = created.toObject ? created.toObject() : created;
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.status(201).json({ success: true, message: 'User created successfully', user: safeCreated, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error creating user', error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };
    if (updateData.password && updateData.password.trim()) {
      updateData.password = await bcrypt.hash(updateData.password.trim(), 10);
    } else {
      delete updateData.password;
    }
    const updated = await User.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updateData },
      { new: true }
    ).select('-password');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const safeUpdated = updated.toObject ? updated.toObject() : updated;
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'User updated successfully', user: safeUpdated, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error updating user', error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.deleteOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, message: 'User deleted successfully', users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error deleting user', error: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ studentId: 1 }).lean();
    const formatted = students.map((s) => ({
      rollNo: s.studentId,
      name: s.name,
      email: s.email,
      room: `${s.roomNo} • ${s.blockId === 'block-e' ? 'Block E' : 'Block D'}`,
      status: s.status,
      isRoomLead: s.isRoomLead
    }));
    return res.json({ success: true, students: formatted, fromMongo: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching students', error: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: 1 }).lean();
    return res.json({ success: true, attendance: records, fromMongo: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error fetching attendance', error: err.message });
  }
};

export const saveAttendance = async (req, res) => {
  try {
    const { date, day, meal, actualCount, selectedCount, predictedCount, wastageKg, event } = req.body;
    if (!date || !meal) {
      return res.status(400).json({ success: false, message: 'Both date and meal are required to record attendance.' });
    }

    const updateDoc = { date, meal };
    if (day !== undefined) updateDoc.day = day;
    if (selectedCount !== undefined) updateDoc.selectedCount = selectedCount;
    if (predictedCount !== undefined) {
      updateDoc.predictedCount = predictedCount;
      if (predictedCount) {
        updateDoc.accuracy = Math.max(
          0,
          Math.round((1 - Math.abs((actualCount || 0) - predictedCount) / predictedCount) * 1000) / 10
        );
      }
    }
    if (actualCount !== undefined) updateDoc.actualCount = actualCount;
    if (wastageKg !== undefined) updateDoc.wastageKg = wastageKg;
    if (event !== undefined) updateDoc.event = event;

    const doc = await Attendance.findOneAndUpdate(
      { date, meal },
      { $set: updateDoc },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({ success: true, message: `Attendance recorded for ${meal} on ${date}`, attendance: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Database error saving attendance', error: err.message });
  }
};

export const runSeederApi = async (req, res) => {
  try {
    const result = await runIdempotentSeed();
    return res.json({ success: true, message: 'MongoDB idempotent seed completed successfully!', ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to seed database: ' + err.message });
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
      attendanceCount,
      anomaliesCount,
      blockPerfCount
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Room.countDocuments(),
      Menu.countDocuments(),
      KFCMenuItem.countDocuments(),
      KFCOrder.countDocuments(),
      Attendance.countDocuments(),
      Anomaly.countDocuments(),
      BlockPerformance.countDocuments()
    ]);

    return res.json({
      success: true,
      connectedToMongo: true,
      counts: {
        users: usersCount,
        students: studentsCount,
        rooms: roomsCount,
        menus: menusCount,
        kfcMenuItems: kfcMenuCount,
        kfcOrders: kfcOrdersCount,
        attendance: attendanceCount,
        anomalies: anomaliesCount,
        blockPerformance: blockPerfCount
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      connectedToMongo: false,
      error: err.message
    });
  }
};
