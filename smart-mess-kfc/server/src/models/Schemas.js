import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  roomNo: { type: String, required: true },
  floorId: { type: String, required: true },
  blockId: { type: String, required: true },
  isRoomLead: { type: Boolean, default: false }
}, { timestamps: true });

const RoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true, unique: true },
  floorId: { type: String, required: true },
  blockId: { type: String, required: true },
  leadName: { type: String, required: true },
  totalMembers: { type: Number, default: 5 },
  submittedMembers: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false }
}, { timestamps: true });

const MealSelectionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  breakfast: { type: String, enum: ['will_eat', 'will_not_eat'], default: 'will_eat' },
  lunch: { type: String, enum: ['will_eat', 'will_not_eat'], default: 'will_eat' },
  snacks: { type: String, enum: ['will_eat', 'will_not_eat'], default: 'will_not_eat' },
  dinner: { type: String, enum: ['will_eat', 'will_not_eat'], default: 'will_eat' }
}, { timestamps: true });

const MenuSchema = new mongoose.Schema({
  date: { type: String, required: true },
  breakfast: String,
  lunch: String,
  snacks: String,
  dinner: String
}, { timestamps: true });

const KFCOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  studentName: { type: String, required: true },
  room: { type: String, required: true },
  items: [{ name: String, qty: Number, price: Number }],
  totalAmount: Number,
  orderTime: String,
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Collected'], default: 'Pending' }
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  meal: { type: String, required: true },
  actualCount: Number
}, { timestamps: true });

const AggregationSchema = new mongoose.Schema({
  scope: { type: String, enum: ['room', 'floor', 'block', 'mess'], required: true },
  scopeId: { type: String, required: true },
  date: { type: String, required: true },
  breakfastCount: Number,
  lunchCount: Number,
  snacksCount: Number,
  dinnerCount: Number,
  participationRate: Number
}, { timestamps: true });

const AnomalySchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['low_participation', 'high_attendance', 'variance_alert', 'high_wastage'] },
  scope: String,
  scopeId: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);
export const MealSelection = mongoose.models.MealSelection || mongoose.model('MealSelection', MealSelectionSchema);
export const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
export const KFCOrder = mongoose.models.KFCOrder || mongoose.model('KFCOrder', KFCOrderSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export const Aggregation = mongoose.models.Aggregation || mongoose.model('Aggregation', AggregationSchema);
export const Anomaly = mongoose.models.Anomaly || mongoose.model('Anomaly', AnomalySchema);
