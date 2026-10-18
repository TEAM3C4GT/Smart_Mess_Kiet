import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidateSeedDirs = [
  path.resolve(__dirname, '../../seed-data'),
  path.resolve(__dirname, '../seed-data'),
  path.resolve(process.cwd(), 'seed-data'),
  path.resolve(process.cwd(), '../seed-data'),
  path.resolve('/opt/render/project/src/seed-data')
];
const seedDir = candidateSeedDirs.find((dir) => fs.existsSync(dir)) || candidateSeedDirs[0];

function readSeedJson(fileName) {
  const filePath = path.join(seedDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Seed file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function runIdempotentSeed(mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-mess-kfc') {
  console.log('\n========================================================');
  console.log('🌱 Starting Non-Destructive Idempotent Seeder...');
  console.log(`📂 Source Directory: ${seedDir}`);
  console.log(`🔗 Connecting to MongoDB: ${mongoUri}`);
  console.log('========================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  }

  const results = {};

  // 1. Users (Key: id or email) - Upsert without overwriting custom user modifications or passwords
  const usersData = readSeedJson('users.json');
  let userCount = 0;
  for (const u of usersData) {
    const existing = await User.findOne({
      $or: [{ id: u.id }, { email: u.email.toLowerCase() }]
    });
    if (!existing) {
      await User.create({
        id: u.id,
        name: u.name,
        rollNo: u.rollNo,
        email: u.email.toLowerCase(),
        role: u.role,
        path: u.path,
        badge: u.badge,
        status: u.status || 'Active',
        lastActive: u.lastActive || 'Today',
        password: u.password || (u.rollNo ? u.rollNo : '123456789')
      });
    } else {
      await User.updateOne(
        { _id: existing._id },
        {
          $set: {
            role: u.role,
            path: u.path,
            badge: existing.badge || u.badge
          }
        }
      );
    }
    userCount++;
  }
  results.users = await User.countDocuments();
  console.log(`👤 Users: Processed ${userCount} seed users (Total in DB: ${results.users})`);

  // 2. Students (Key: studentId)
  const studentsData = readSeedJson('students.json');
  for (const s of studentsData) {
    await Student.updateOne(
      { studentId: s.studentId },
      {
        $setOnInsert: {
          studentId: s.studentId,
          name: s.name,
          email: s.email,
          roomNo: s.roomNo,
          floorId: s.floorId,
          blockId: s.blockId,
          status: s.status || 'Submitted',
          isRoomLead: !!s.isRoomLead
        }
      },
      { upsert: true }
    );
  }
  results.students = await Student.countDocuments();
  console.log(`🎓 Students: Processed ${studentsData.length} seed students (Total in DB: ${results.students})`);

  // 3. Rooms (Key: roomNo)
  const roomsData = readSeedJson('rooms.json');
  for (const r of roomsData) {
    await Room.updateOne(
      { roomNo: r.roomNo },
      {
        $setOnInsert: {
          roomNo: r.roomNo,
          floorId: r.floorId,
          blockId: r.blockId,
          leadName: r.leadName,
          totalMembers: r.totalMembers || 5,
          submittedMembers: r.submittedMembers || 0,
          pendingMembers: r.pendingMembers || 0,
          rate: r.rate || 0,
          status: r.status || 'Good',
          flagged: !!r.flagged
        }
      },
      { upsert: true }
    );
  }
  results.rooms = await Room.countDocuments();
  console.log(`🚪 Rooms: Processed ${roomsData.length} seed rooms (Total in DB: ${results.rooms})`);

  // 4. Menus (Key: date)
  const menusData = readSeedJson('menus.json');
  for (const m of menusData) {
    await Menu.updateOne(
      { date: m.date },
      {
        $set: {
          breakfast: m.breakfast,
          lunch: m.lunch,
          snacks: m.snacks,
          dinner: m.dinner
        }
      },
      { upsert: true }
    );
  }
  results.menus = await Menu.countDocuments();
  console.log(`🍽️ Menus: Processed ${menusData.length} daily menus (Total in DB: ${results.menus})`);

  // 5. KFC Menu Items (Key: id)
  const kfcMenuData = readSeedJson('kfc_menu.json');
  for (const k of kfcMenuData) {
    await KFCMenuItem.updateOne(
      { id: k.id },
      {
        $set: {
          name: k.name,
          price: k.price,
          category: k.category,
          imageUrl: k.imageUrl,
          image: k.image,
          stock: k.stock ?? 20,
          isAvailable: k.isAvailable ?? true
        }
      },
      { upsert: true }
    );
  }
  results.kfcMenu = await KFCMenuItem.countDocuments();
  console.log(`🍗 KFC Menu: Processed ${kfcMenuData.length} menu items (Total in DB: ${results.kfcMenu})`);

  // 6. KFC Orders (Key: orderId) - Preserve live orders! Only insert if orderId does not exist
  const kfcOrdersData = readSeedJson('kfc_orders.json');
  let newOrdersAdded = 0;
  for (const ord of kfcOrdersData) {
    const existing = await KFCOrder.findOne({ orderId: ord.orderId });
    if (!existing) {
      await KFCOrder.create(ord);
      newOrdersAdded++;
    }
  }
  results.kfcOrders = await KFCOrder.countDocuments();
  console.log(`🧾 KFC Orders: ${newOrdersAdded} initial seed orders added without overwriting live user orders (Total in DB: ${results.kfcOrders})`);

  // 7. Attendance (Key: date + meal) - Idempotently upsert all 56 records
  const attendanceData = readSeedJson('historical_attendance.json');
  let attUpserted = 0;
  for (const a of attendanceData) {
    await Attendance.updateOne(
      { date: a.date, meal: a.meal },
      {
        $set: {
          day: a.day,
          selectedCount: a.selectedCount,
          actualCount: a.actualCount,
          predictedCount: a.predictedCount,
          wastageKg: a.wastageKg,
          accuracy: a.accuracy,
          event: a.event
        }
      },
      { upsert: true }
    );
    attUpserted++;
  }
  results.attendance = await Attendance.countDocuments();
  console.log(`📊 Attendance: Upserted all ${attUpserted} historical attendance records (Total in DB: ${results.attendance})`);

  // 8. Meal Selections (Key: studentId + date) - Preserve user activity
  const selectionsData = readSeedJson('meal_selections.json');
  for (const sel of selectionsData) {
    await MealSelection.updateOne(
      { studentId: sel.studentId, date: sel.date },
      {
        $setOnInsert: {
          studentId: sel.studentId,
          date: sel.date,
          breakfast: sel.breakfast,
          lunch: sel.lunch,
          snacks: sel.snacks,
          dinner: sel.dinner
        }
      },
      { upsert: true }
    );
  }
  results.mealSelections = await MealSelection.countDocuments();
  console.log(`📋 Meal Selections: Processed ${selectionsData.length} records (Total in DB: ${results.mealSelections})`);

  // 9. Aggregations (Key: scope + scopeId + date)
  const aggregationsData = readSeedJson('aggregations.json');
  for (const agg of aggregationsData) {
    await Aggregation.updateOne(
      { scope: agg.scope, scopeId: agg.scopeId, date: agg.date },
      {
        $set: {
          breakfastCount: agg.breakfastCount,
          lunchCount: agg.lunchCount,
          snacksCount: agg.snacksCount,
          dinnerCount: agg.dinnerCount,
          participationRate: agg.participationRate
        }
      },
      { upsert: true }
    );
  }
  results.aggregations = await Aggregation.countDocuments();
  console.log(`📈 Aggregations: Processed ${aggregationsData.length} scope aggregations (Total in DB: ${results.aggregations})`);

  // 10. Anomalies (Key: title)
  const anomaliesData = readSeedJson('anomalies.json');
  for (const an of anomaliesData) {
    await Anomaly.updateOne(
      { title: an.title },
      {
        $set: {
          type: an.type,
          scope: an.scope,
          scopeId: an.scopeId,
          description: an.description,
          severity: an.severity
        }
      },
      { upsert: true }
    );
  }
  results.anomalies = await Anomaly.countDocuments();
  console.log(`⚠️ Anomalies: Processed ${anomaliesData.length} anomaly records (Total in DB: ${results.anomalies})`);

  // 11. Notifications (Key: id)
  const notificationsData = readSeedJson('notifications.json');
  for (const notif of notificationsData) {
    await Notification.updateOne(
      { id: notif.id },
      {
        $setOnInsert: {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          sender: notif.sender,
          roomNo: notif.roomNo,
          time: notif.time,
          timestamp: notif.timestamp || Date.now(),
          read: !!notif.read,
          type: notif.type || 'reminder'
        }
      },
      { upsert: true }
    );
  }
  results.notifications = await Notification.countDocuments();
  console.log(`🔔 Notifications: Processed ${notificationsData.length} notifications (Total in DB: ${results.notifications})`);

  // 12. Wastage (Key: date)
  const wastageData = readSeedJson('wastage.json');
  for (const w of wastageData) {
    await Wastage.updateOne(
      { date: w.date },
      {
        $set: {
          day: w.day,
          actualKg: w.actualKg,
          targetKg: w.targetKg,
          savedKg: w.savedKg
        }
      },
      { upsert: true }
    );
  }
  results.wastage = await Wastage.countDocuments();
  console.log(`♻️ Wastage: Processed ${wastageData.length} daily wastage entries (Total in DB: ${results.wastage})`);

  // 13. Block Performance (Key: block)
  const blockPerfData = readSeedJson('block_performance.json');
  for (const bp of blockPerfData) {
    await BlockPerformance.updateOne(
      { block: bp.block },
      {
        $set: {
          total: bp.total,
          submitted: bp.submitted,
          pending: bp.pending,
          rate: bp.rate,
          status: bp.status,
          incharge: bp.incharge
        }
      },
      { upsert: true }
    );
  }
  results.blockPerformance = await BlockPerformance.countDocuments();
  console.log(`🏢 Block Performance: Processed ${blockPerfData.length} block performance records (Total in DB: ${results.blockPerformance})`);

  console.log('\n========================================================');
  console.log('🎉 IDEMPOTENT SEED OPERATION COMPLETE!');
  console.log('Collection Summary:', results);
  console.log('========================================================\n');

  return { success: true, counts: results };
}

// Auto-run if executed directly
if (process.argv[1] && /seederService\.js$/i.test(process.argv[1])) {
  runIdempotentSeed()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeder failed:', err);
      process.exit(1);
    });
}
