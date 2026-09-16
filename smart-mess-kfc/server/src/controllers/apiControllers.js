// In-Memory Fallback Seed Data
let mockMenu = {
  date: '2026-09-14',
  breakfast: 'Idli, Sambar, Coconut Chutney, Masala Tea, Boiled Eggs',
  lunch: 'Paneer Butter Masala, Dal Tadka, Chapati, Steamed Rice, Salad, Curd',
  snacks: 'Samosa, Mint Chutney, Coffee / Milk',
  dinner: 'Kadai Chicken / Veg Korma, Jeera Rice, Butter Roti, Gulab Jamun'
};

let mockKfcOrders = [
  {
    id: 'ORD-8821',
    token: 'KFC-302-01',
    studentName: 'Alex Rivers',
    room: 'Room 302',
    items: [{ name: 'Zinger Burger Duo', qty: 1, price: 299 }],
    totalAmount: 299,
    orderTime: '06:45 PM',
    status: 'Ready'
  },
  {
    id: 'ORD-8819',
    token: 'KFC-204-03',
    studentName: 'Rohan Sharma',
    room: 'Room 204',
    items: [{ name: 'Hot & Crispy Bucket (4 Pcs)', qty: 1, price: 449 }],
    totalAmount: 449,
    orderTime: '07:10 PM',
    status: 'Preparing'
  }
];

export const getMenu = (req, res) => {
  res.json({ success: true, menu: mockMenu });
};

export const updateMenu = (req, res) => {
  mockMenu = { ...mockMenu, ...req.body };
  res.json({ success: true, message: 'Menu updated successfully', menu: mockMenu });
};

export const postSelections = (req, res) => {
  res.json({ success: true, message: "Student meal plan saved successfully", selections: req.body });
};

export const getFloorAggregation = (req, res) => {
  const { floorId } = req.params;
  res.json({
    success: true,
    floorId,
    totalRooms: 8,
    avgParticipation: 74,
    rooms: [
      { roomNo: 'F-201', rate: 40, status: 'Low' },
      { roomNo: 'F-202', rate: 100, status: 'High' },
      { roomNo: 'F-203', rate: 50, status: 'Low' },
      { roomNo: 'F-204', rate: 80, status: 'Good' }
    ]
  });
};

export const getBlockAggregation = (req, res) => {
  const { blockId } = req.params;
  res.json({
    success: true,
    blockId,
    totalFloors: 4,
    totalSubmissions: 169,
    overallRate: 84.5,
    mealCounts: { breakfast: 169, lunch: 185, snacks: 140, dinner: 178 }
  });
};

export const getMessAggregation = (req, res) => {
  res.json({
    success: true,
    date: req.params.date,
    headcount: [
      { meal: 'Breakfast', selected: 169, predicted: 175, variance: '+3' },
      { meal: 'Lunch', selected: 185, predicted: 192, variance: '+4' },
      { meal: 'Snacks', selected: 140, predicted: 148, variance: '+5' },
      { meal: 'Dinner', selected: 178, predicted: 184, variance: '+2' }
    ]
  });
};

export const flagRoom = (req, res) => {
  const { id } = req.params;
  res.json({ success: true, message: `Room ${id} flagged status toggled.` });
};

export const getKfcOrders = (req, res) => {
  res.json({ success: true, orders: mockKfcOrders });
};

export const createKfcOrder = (req, res) => {
  const newOrder = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    token: req.body.token || `KFC-302-${Math.floor(10 + Math.random() * 90)}`,
    studentName: req.body.studentName || 'Alex Rivers',
    room: req.body.room || 'Room 302',
    items: req.body.items || [],
    totalAmount: req.body.totalAmount || 0,
    orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending'
  };
  mockKfcOrders.unshift(newOrder);
  res.status(201).json({ success: true, order: newOrder });
};

export const updateKfcOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  mockKfcOrders = mockKfcOrders.map((o) => (o.id === id ? { ...o, status } : o));
  res.json({ success: true, message: `Order ${id} status updated to ${status}` });
};

export const getAIForecast = (req, res) => {
  res.json({
    meal: 'Lunch',
    selectedCount: 185,
    predictedCount: 192,
    confidence: 0.91,
    scope: req.params.scope || 'mess',
    date: req.params.date || '2026-09-14'
  });
};

export const getAIAnomalies = (req, res) => {
  res.json({
    anomalies: [
      {
        id: 1,
        title: 'Low Participation Warning',
        scope: 'Floor 2 - Room F-201',
        description: 'Only 40% submission rate detected prior to cutoff.',
        severity: 'high'
      },
      {
        id: 2,
        title: 'High KFC Demand Forecast',
        scope: 'Snacks Shift',
        description: 'Zinger Burger Duo orders expected to exceed 45 units.',
        severity: 'medium'
      }
    ]
  });
};
