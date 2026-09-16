import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const DEMO_USERS = [
  {
    title: 'Student',
    email: 'student@demo.edu',
    role: 'Student',
    path: '/student',
    name: 'Aarav Sharma',
    badge: 'Room 302 • Block B'
  },
  {
    title: 'Room Lead',
    email: 'roomlead@demo.edu',
    role: 'Room Lead',
    path: '/room-lead',
    name: 'Alex Rivers (Lead)',
    badge: 'Lead • Room 302'
  },
  {
    title: 'Floor',
    email: 'floor@demo.edu',
    role: 'Floor Incharge',
    path: '/floor-incharge',
    name: 'Prof. Sharma',
    badge: 'Floor 2 Incharge'
  },
  {
    title: 'Block',
    email: 'block@demo.edu',
    role: 'Block Coordinator',
    path: '/block-coordinator',
    name: 'Dr. Mukerjee',
    badge: 'Block B Coordinator'
  },
  {
    title: 'Mess',
    email: 'mess@demo.edu',
    role: 'Mess Incharge',
    path: '/mess-incharge',
    name: 'Chef Sundaram',
    badge: 'Main Mess Kitchen'
  },
  {
    title: 'Principal',
    email: 'principal@demo.edu',
    role: 'Principal',
    path: '/principal',
    name: 'Dr. Sunita Rao',
    badge: 'Executive Command'
  },
  {
    title: 'KFC Staff',
    email: 'kfc@demo.edu',
    role: 'KFC Staff',
    path: '/kfc-staff',
    name: 'KFC Kitchen Counter',
    badge: 'Canteen Fulfillment'
  },
  {
    title: 'Admin',
    email: 'karthiksuru06@gmail.com',
    role: 'Admin',
    path: '/dashboards',
    name: 'Karthik Suru',
    badge: 'Campus Superadmin'
  }
];

export const AppProvider = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_current_user');
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Student Meal Selection State
  const [studentMealPlan, setStudentMealPlan] = useState({
    date: 'Thursday, Sep 17',
    dateSubtitle: "Toggle meals you'll eat. Locks daily at 21:00.",
    cutoff: '21:00',
    streak: 0,
    selections: {
      breakfast: false,
      lunch: true,
      snacks: true,
      dinner: true
    },
    meals: {
      breakfast: {
        title: 'Breakfast',
        optionsCount: '2 options',
        items: [
          {
            name: 'Masala Dosa & Sambar',
            tags: 'south • vegetarian',
            image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80'
          },
          {
            name: 'Poha with Chai',
            tags: 'light • vegetarian',
            image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80'
          }
        ]
      },
      lunch: {
        title: 'Lunch',
        optionsCount: '3 options',
        items: [
          {
            name: 'Rajma Chawal Thali',
            tags: 'north • vegetarian • protein',
            image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=200&auto=format&fit=crop&q=80'
          },
          {
            name: 'Paneer Butter Masala',
            tags: 'vegetarian • rich',
            image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80'
          },
          {
            name: 'Test Dish',
            tags: 'test',
            image: ''
          }
        ]
      },
      snacks: {
        title: 'Snacks',
        optionsCount: '1 option',
        items: [
          {
            name: 'Samosa & Chai',
            tags: 'snack • vegetarian',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80'
          }
        ]
      },
      dinner: {
        title: 'Dinner',
        optionsCount: '2 options',
        items: [
          {
            name: 'Roti, Dal, Sabzi',
            tags: 'healthy • vegetarian',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80'
          },
          {
            name: 'Chicken Curry & Rice',
            tags: 'non-veg • protein',
            image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop&q=80'
          }
        ]
      }
    }
  });

  const toggleStudentMeal = (mealKey) => {
    setStudentMealPlan((prev) => {
      const updated = {
        ...prev,
        selections: {
          ...prev.selections,
          [mealKey]: !prev.selections[mealKey]
        }
      };
      return updated;
    });
  };

  const confirmStudentMealSelection = () => {
    addToast('Meal selection confirmed for Thursday, Sep 17!', 'success');
  };

  // Student Meal History (last 8 days)
  const [mealHistory, setMealHistory] = useState([
    { id: '1', date: 'Thu, Sep 17', dateCode: '2026-09-17', breakfast: false, lunch: true, snacks: true, dinner: true },
    { id: '2', date: 'Tue, Sep 15', dateCode: '2026-09-15', breakfast: false, lunch: true, snacks: true, dinner: true },
    { id: '3', date: 'Mon, Sep 14', dateCode: '2026-09-14', breakfast: true, lunch: true, snacks: true, dinner: true },
    { id: '4', date: 'Sun, Sep 13', dateCode: '2026-09-13', breakfast: true, lunch: true, snacks: true, dinner: true },
    { id: '5', date: 'Sat, Sep 12', dateCode: '2026-09-12', breakfast: true, lunch: true, snacks: true, dinner: true },
    { id: '6', date: 'Fri, Sep 11', dateCode: '2026-09-11', breakfast: true, lunch: true, snacks: false, dinner: true },
    { id: '7', date: 'Thu, Sep 10', dateCode: '2026-09-10', breakfast: true, lunch: true, snacks: true, dinner: true },
    { id: '8', date: 'Wed, Sep 9',  dateCode: '2026-09-09', breakfast: true, lunch: true, snacks: true, dinner: true },
  ]);

  // Student Notifications / Inbox
  const [studentNotifications, setStudentNotifications] = useState([]);
  const markAllNotificationsRead = () => {
    setStudentNotifications([]);
    addToast('All notifications marked as read', 'success');
  };

  // Legacy student selection compatibility
  const [studentSelections, setStudentSelections] = useState({
    breakfast: 'will_not_eat',
    lunch: 'will_eat',
    snacks: 'will_eat',
    dinner: 'will_eat',
  });
  const [studentSubmitted, setStudentSubmitted] = useState(true);

  // 2. KFC Menu & Pre-Orders
  const [kfcMenu, setKfcMenu] = useState([
    {
      id: 1,
      name: 'Zinger Burger',
      price: 179,
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      image: '🍔',
      isAvailable: true
    },
    {
      id: 2,
      name: 'Chicken Popcorn',
      price: 149,
      category: 'Snacks',
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
      image: '🍿',
      isAvailable: true
    },
    {
      id: 3,
      name: 'Hot Wings (6 pc)',
      price: 229,
      category: 'Chicken',
      imageUrl: 'https://images.unsplash.com/photo-1527477248705-200752240e3a?w=500&auto=format&fit=crop&q=80',
      image: '🍗',
      isAvailable: true
    },
    {
      id: 4,
      name: 'Crispy Tenders (4 pc)',
      price: 199,
      category: 'Chicken',
      imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
      image: '🍗',
      isAvailable: true
    },
    {
      id: 5,
      name: 'Zinger Meal Combo',
      price: 299,
      category: 'Combos',
      imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
      image: '🍔',
      isAvailable: true
    },
    {
      id: 6,
      name: 'Veg Rice Bowl',
      price: 149,
      category: 'Rice Bowls',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      image: '🥗',
      isAvailable: true
    },
    {
      id: 7,
      name: 'French Fries',
      price: 99,
      category: 'Snacks',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
      image: '🍟',
      isAvailable: true
    },
    {
      id: 8,
      name: 'Choco Lava Cake',
      price: 99,
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      image: '🍰',
      isAvailable: true
    },
    {
      id: 9,
      name: 'Pepsi 500ml',
      price: 60,
      category: 'Drinks',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
      image: '🥤',
      isAvailable: true
    }
  ]);

  const [kfcOrders, setKfcOrders] = useState([
    {
      id: 'ORD-65006',
      token: 'KFC65006',
      studentName: 'Aarav Sharma',
      room: 'Room 302',
      items: [{ name: 'Hot Wings (6 pc)', qty: 1, price: 229 }],
      totalAmount: 229,
      orderTime: '06:45 PM',
      status: 'Ready' // Pending, Preparing, Ready, Collected
    },
    {
      id: 'ORD-8819',
      token: 'KFC20403',
      studentName: 'Rohan Sharma',
      room: 'Room 204',
      items: [{ name: 'Crispy Tenders (4 pc)', qty: 1, price: 199 }],
      totalAmount: 199,
      orderTime: '07:10 PM',
      status: 'Preparing'
    }
  ]);

  // 3. Room Lead Data (Room 302, Group 3)
  const [roomMembers, setRoomMembers] = useState([
    { id: 1, name: 'Alex Rivers (You)', status: 'Submitted', time: '08:30 AM', choices: { b: 'Yes', l: 'Yes', s: 'No', d: 'Yes' } },
    { id: 2, name: 'Rahul Verma', status: 'Submitted', time: '09:15 AM', choices: { b: 'Yes', l: 'Yes', s: 'Yes', d: 'Yes' } },
    { id: 3, name: 'Priya Sundaram', status: 'Submitted', time: '11:40 AM', choices: { b: 'No', l: 'Yes', s: 'No', d: 'Yes' } },
    { id: 4, name: 'Vikram Sethi', status: 'Submitted', time: '02:10 PM', choices: { b: 'Yes', l: 'Yes', s: 'Yes', d: 'No' } },
    { id: 5, name: 'Ananya Gupta', status: 'Pending', time: '-', choices: { b: '-', l: '-', s: '-', d: '-' } }
  ]);

  // 4. Floor Incharge Data (Floor 2)
  const [floorRooms, setFloorRooms] = useState([
    { roomNo: 'F-201', lead: 'Karan Mehra', members: 5, submitted: 2, pending: 3, rate: 40, status: 'Low', flagged: false },
    { roomNo: 'F-202', lead: 'Deepak Roy', members: 5, submitted: 5, pending: 0, rate: 100, status: 'High', flagged: false },
    { roomNo: 'F-203', lead: 'Tarun Josh', members: 6, submitted: 3, pending: 3, rate: 50, status: 'Low', flagged: false },
    { roomNo: 'F-204', lead: 'Nikhil Paul', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false },
    { roomNo: 'F-205', lead: 'Siddharth V', members: 5, submitted: 5, pending: 0, rate: 100, status: 'High', flagged: false },
    { roomNo: 'F-206', lead: 'Aman Deep', members: 6, submitted: 5, pending: 1, rate: 83, status: 'Good', flagged: false },
    { roomNo: 'F-207', lead: 'Vikas Kumar', members: 5, submitted: 3, pending: 2, rate: 60, status: 'Medium', flagged: false },
    { roomNo: 'Room 302', lead: 'Alex Rivers', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false }
  ]);

  // 5. Block Coordinator Data (Block B)
  const [blockData, setBlockData] = useState([
    { floor: 'Floor 1', rooms: 12, totalStudents: 60, submitted: 54, pending: 6, rate: 90, status: 'High' },
    { floor: 'Floor 2', rooms: 8, totalStudents: 42, submitted: 31, pending: 11, rate: 74, status: 'Medium' },
    { floor: 'Floor 3', rooms: 10, totalStudents: 50, submitted: 46, pending: 4, rate: 92, status: 'High' },
    { floor: 'Floor 4', rooms: 10, totalStudents: 48, submitted: 38, pending: 10, rate: 79, status: 'Good' }
  ]);
  const [blockConsolidatedSent, setBlockConsolidatedSent] = useState(false);

  // 6. Mess Incharge Data & Menu
  const [menu, setMenu] = useState({
    date: 'Tomorrow (Sept 14)',
    breakfast: 'Idli, Sambar, Coconut Chutney, Masala Tea, Boiled Eggs',
    lunch: 'Paneer Butter Masala, Dal Tadka, Chapati, Steamed Rice, Salad, Curd',
    snacks: 'Samosa, Mint Chutney, Coffee / Milk',
    dinner: 'Kadai Chicken / Veg Korma, Jeera Rice, Butter Roti, Gulab Jamun'
  });

  const [headcount, setHeadcount] = useState([
    { meal: 'Breakfast', selected: 169, predicted: 175, actual: 172, variance: '+3' },
    { meal: 'Lunch', selected: 185, predicted: 192, actual: 189, variance: '+4' },
    { meal: 'Snacks', selected: 140, predicted: 148, actual: 145, variance: '+5' },
    { meal: 'Dinner', selected: 178, predicted: 184, actual: 180, variance: '+2' }
  ]);

  // 7. Principal Executive Datasets (Matching Reference Screenshots)
  const [principalAnalytics, setPrincipalAnalytics] = useState({
    avgWastage: '0.0%',
    messRating: '4.2',
    kfcOrders14d: 2,
    kfcRevenue: 328,
    predictedVsActual: [
      { date: '09-03', actual: 0, predicted: 0 },
      { date: '09-04', actual: 0, predicted: 0 },
      { date: '09-05', actual: 0, predicted: 0 },
      { date: '09-06', actual: 0, predicted: 0 },
      { date: '09-07', actual: 0, predicted: 0 },
      { date: '09-08', actual: 0, predicted: 0.05 },
      { date: '09-09', actual: 0, predicted: 1 },
      { date: '09-10', actual: 0, predicted: 1 },
      { date: '09-11', actual: 0, predicted: 1 },
      { date: '09-12', actual: 0, predicted: 1 },
      { date: '09-13', actual: 0, predicted: 1 },
      { date: '09-14', actual: 0, predicted: 1 },
      { date: '09-15', actual: 0, predicted: 1 },
      { date: '09-16', actual: 0, predicted: 0 }
    ],
    blockRates: [
      { block: 'Block A', ratio: '0/2', rate: 0 },
      { block: 'Block B', ratio: '0/4', rate: 0 },
      { block: 'Block Z', ratio: '0/1', rate: 0 }
    ],
    kfcFootfall: [
      { date: '09-16', count: 2 }
    ],
    escalations: []
  });

  const [principalRollups, setPrincipalRollups] = useState({
    date: '2026-09-17',
    rate: 14.3,
    submitted: 1,
    total: 7,
    pending: 6,
    cutoff: '21:00',
    flagged: false,
    mealCounts: {
      breakfast: 0,
      lunch: 1,
      snacks: 1,
      dinner: 1
    },
    pendingStudents: [
      { id: '2', initial: 'P', name: 'Priya Nair', email: 'student2@demo.edu', room: 'Room 304' },
      { id: '3', initial: 'R', name: 'Rohan Patel', email: 'student3@demo.edu', room: 'Room 305' },
      { id: '4', initial: 'I', name: 'Ishita Rao', email: 'student4@demo.edu', room: 'Room 401' },
      { id: '5', initial: 'K', name: 'Kabir Mehta', email: 'student5@demo.edu', room: 'Room 102' },
      { id: '6', initial: 'A', name: 'Ananya Iyer', email: 'student6@demo.edu', room: 'Room 103' },
      { id: '7', initial: 'T', name: 'Test CSV', email: 'testcsv@demo.edu', room: 'Room 999' }
    ]
  });

  const togglePrincipalRollupFlag = () => {
    setPrincipalRollups((prev) => {
      const next = !prev.flagged;
      addToast(next ? 'Campus rollup flagged for escalation' : 'Campus rollup unflagged', next ? 'warning' : 'info');
      return { ...prev, flagged: next };
    });
  };

  const remindPendingStudentPrincipal = (studentName) => {
    addToast(`Reminder sent to ${studentName}`, 'success');
  };

  const remindAllPendingPrincipal = () => {
    addToast('Reminders sent to all 6 pending students!', 'success');
  };

  const [principalMess, setPrincipalMess] = useState({
    date: '2026-09-17',
    buffers: {
      breakfast: '0 ~',
      lunch: '0 ~',
      snacks: '0 ~',
      dinner: '0 ~'
    },
    lockedHeadcount: [
      { block: 'A', students: 2, breakfast: 0, lunch: 0, snacks: 0, dinner: 0 },
      { block: 'B', students: 4, breakfast: 0, lunch: 1, snacks: 1, dinner: 1 },
      { block: 'Z', students: 1, breakfast: 0, lunch: 0, snacks: 0, dinner: 0 }
    ],
    suggestedCook: [
      { meal: 'BREAKFAST', name: 'Masala Dosa & Sambar', formula: 'Portion 1 • cook ~0', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80' },
      { meal: 'BREAKFAST', name: 'Poha with Chai', formula: 'Portion 0.8 • cook ~0', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80' },
      { meal: 'DINNER', name: 'Roti, Dal, Sabzi', formula: 'Portion 1.1 • cook ~0', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80' },
      { meal: 'DINNER', name: 'Chicken Curry & Rice', formula: 'Portion 1.2 • cook ~0', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop&q=80' },
      { meal: 'LUNCH', name: 'Rajma Chawal Thali', formula: 'Portion 1.2 • cook ~0', image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=200&auto=format&fit=crop&q=80' },
      { meal: 'LUNCH', name: 'Paneer Butter Masala', formula: 'Portion 1 • cook ~0', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80' }
    ]
  });

  const [principalNotifications, setPrincipalNotifications] = useState([]);
  const markAllPrincipalNotificationsRead = () => {
    setPrincipalNotifications([]);
    addToast('All notifications marked as read', 'success');
  };

  const [principalWastageTrend, setPrincipalWastageTrend] = useState([
    { day: 'Mon', actualKg: 18.2, targetKg: 10.0, savedKg: 1.8 },
    { day: 'Tue', actualKg: 14.5, targetKg: 10.0, savedKg: 3.5 },
    { day: 'Wed', actualKg: 11.2, targetKg: 10.0, savedKg: 5.8 },
    { day: 'Thu', actualKg: 9.1, targetKg: 10.0, savedKg: 8.9 },
    { day: 'Fri', actualKg: 8.0, targetKg: 10.0, savedKg: 10.0 },
    { day: 'Sat', actualKg: 6.2, targetKg: 10.0, savedKg: 11.8 },
    { day: 'Sun (Pred)', actualKg: 5.4, targetKg: 10.0, savedKg: 12.6 }
  ]);

  const [blockPerformance, setBlockPerformance] = useState([
    { block: 'Block A (Boys)', total: 120, submitted: 116, pending: 4, rate: 96.6, status: 'Optimal', incharge: 'Prof. Sharma' },
    { block: 'Block B (Lateral)', total: 140, submitted: 134, pending: 6, rate: 95.7, status: 'Optimal', incharge: 'Dr. Mukerjee' },
    { block: 'Block C (Girls)', total: 110, submitted: 101, pending: 9, rate: 91.8, status: 'Good', incharge: 'Mrs. Jayanti' },
    { block: 'Block D (Senior)', total: 110, submitted: 104, pending: 6, rate: 94.5, status: 'Good', incharge: 'Er. R. Rao' }
  ]);

  const [kfcHourlyFootfall, setKfcHourlyFootfall] = useState([
    { time: '11:00 AM', orders: 12, revenue: 1450 },
    { time: '01:00 PM', orders: 46, revenue: 5680 },
    { time: '04:30 PM', orders: 62, revenue: 7390 },
    { time: '07:00 PM', orders: 32, revenue: 3890 },
    { time: '09:00 PM', orders: 12, revenue: 1490 }
  ]);

  const [aiAnomalies, setAiAnomalies] = useState([
    {
      id: 1,
      title: 'Low Participation Anomaly',
      scope: 'Hostel Block B • Floor 2 (Room F-201)',
      desc: 'Room submission rate is 40% (2/5 students). Automated escalation to Floor Incharge triggered.',
      severity: 'high',
      time: '12m ago',
      status: 'Active'
    },
    {
      id: 2,
      title: 'KFC Demand Surge Forecast',
      scope: 'Evening Snacks Shift • Food Court',
      desc: 'Zinger Burger Duo orders forecasted +28% over 7-day average. Kitchen prep notice sent.',
      severity: 'medium',
      time: '35m ago',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Institutional Wastage Milestone',
      scope: 'Campus Kitchen Hub',
      desc: 'Daily food waste decreased to 6.2 kg, beating the 10 kg target for 3 consecutive days.',
      severity: 'low',
      time: '1h ago',
      status: 'Resolved'
    }
  ]);

  // Actions
  const updateStudentSelection = (meal, value) => {
    setStudentSelections((prev) => ({ ...prev, [meal]: value }));
  };

  const submitStudentMealPlan = () => {
    setStudentSubmitted(true);
    addToast("Tomorrow's meal plan submitted successfully!", 'success');
  };

  const placeKfcOrder = (items, totalAmount) => {
    const randomNum = Math.floor(10 + Math.random() * 90);
    const token = `KFC-302-${randomNum}`;
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      token,
      studentName: 'Alex Rivers',
      room: 'Room 302',
      items,
      totalAmount,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };

    setKfcOrders((prev) => [newOrder, ...prev]);
    addToast(`KFC Order Placed! Token: ${token}`, 'success');
    return newOrder;
  };

  const updateKfcOrderStatus = (orderId, newStatus) => {
    setKfcOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    addToast(`Order ${orderId} updated to ${newStatus}`, 'info');
  };

  const advanceKfcOrderStatus = (orderId) => {
    setKfcOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        let nextStatus = 'Pending';
        if (ord.status === 'Pending') nextStatus = 'Preparing';
        else if (ord.status === 'Preparing') nextStatus = 'Ready';
        else if (ord.status === 'Ready') nextStatus = 'Collected';
        else return ord;
        addToast(`Order ${ord.token} status updated to ${nextStatus}`, 'success');
        return { ...ord, status: nextStatus };
      })
    );
  };

  const toggleKfcItemAvailability = (itemId) => {
    setKfcMenu((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newStatus = !item.isAvailable;
        addToast(`${item.name} marked as ${newStatus ? 'In Stock' : 'Sold Out'}`, newStatus ? 'success' : 'warning');
        return { ...item, isAvailable: newStatus };
      })
    );
  };

  const addKfcMenuItem = (newItem) => {
    const item = {
      id: Date.now(),
      name: newItem.name.trim(),
      price: Number(newItem.price),
      category: newItem.category || 'Snacks',
      image: newItem.image || '🍗',
      isAvailable: newItem.isAvailable !== undefined ? newItem.isAvailable : true
    };
    setKfcMenu((prev) => [...prev, item]);
    addToast(`${item.name} added to KFC Menu!`, 'success');
    return item;
  };

  const removeKfcMenuItem = (itemId) => {
    const itemToRemove = kfcMenu.find((i) => i.id === itemId);
    setKfcMenu((prev) => prev.filter((item) => item.id !== itemId));
    addToast(`${itemToRemove ? itemToRemove.name : 'Item'} removed from menu`, 'info');
  };

  const resolveAnomaly = (anomalyId) => {
    setAiAnomalies((prev) =>
      prev.map((a) => (a.id === anomalyId ? { ...a, status: 'Resolved' } : a))
    );
    addToast('Anomaly acknowledged and flagged as resolved.', 'info');
  };

  const remindStudent = (studentName) => {
    addToast(`Reminder sent to ${studentName}!`, 'info');
  };

  const remindAllPendingInRoom = () => {
    addToast('Reminders sent to all pending students in Room 302!', 'info');
  };

  const remindRoomLead = (roomNo, leadName) => {
    addToast(`Notification sent to Room Lead (${leadName} - ${roomNo})!`, 'info');
  };

  const flagRoom = (roomNo) => {
    setFloorRooms((prev) =>
      prev.map((r) => (r.roomNo === roomNo ? { ...r, flagged: !r.flagged } : r))
    );
    addToast(`Room ${roomNo} status updated.`, 'warning');
  };

  const sendBlockConsolidatedCount = () => {
    setBlockConsolidatedSent(true);
    addToast('Block-wise meal count sent successfully to Mess Incharge!', 'success');
  };

  const updateMenu = (newMenu) => {
    setMenu(newMenu);
    addToast("Tomorrow's menu updated successfully!", 'success');
  };

  const login = (email, password = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Find matching demo user by exact email match
    let matchedUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If not exact match, infer by role keywords in email
    if (!matchedUser) {
      if (cleanEmail.includes('student')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Student');
      } else if (cleanEmail.includes('room')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Room Lead');
      } else if (cleanEmail.includes('floor')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Floor Incharge');
      } else if (cleanEmail.includes('block')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Block Coordinator');
      } else if (cleanEmail.includes('mess') || cleanEmail.includes('kitchen')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Mess Incharge');
      } else if (cleanEmail.includes('principal') || cleanEmail.includes('director')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Principal');
      } else if (cleanEmail.includes('kfc') || cleanEmail.includes('staff')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'KFC Staff');
      } else if (cleanEmail.includes('admin') || cleanEmail.includes('karthik')) {
        matchedUser = DEMO_USERS.find((u) => u.role === 'Admin');
      } else {
        // Fallback default user
        matchedUser = {
          title: 'Guest User',
          email: cleanEmail || 'user@campus.edu',
          role: 'Student',
          path: '/student',
          name: cleanEmail.split('@')[0] || 'Campus User',
          badge: 'Campus Resident'
        };
      }
    }

    const sessionUser = {
      ...matchedUser,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCurrentUser(sessionUser);
    try {
      localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }

    addToast(`Signed in as ${sessionUser.name} (${sessionUser.role})`, 'success');
    return sessionUser;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smart_mess_current_user');
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    addToast('Signed out successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        demoUsers: DEMO_USERS,
        toasts,
        addToast,
        removeToast,
        studentMealPlan,
        toggleStudentMeal,
        confirmStudentMealSelection,
        mealHistory,
        studentNotifications,
        markAllNotificationsRead,
        studentSelections,
        updateStudentSelection,
        studentSubmitted,
        submitStudentMealPlan,
        kfcMenu,
        toggleKfcItemAvailability,
        addKfcMenuItem,
        removeKfcMenuItem,
        kfcOrders,
        placeKfcOrder,
        updateKfcOrderStatus,
        advanceKfcOrderStatus,
        roomMembers,
        remindStudent,
        remindAllPendingInRoom,
        floorRooms,
        remindRoomLead,
        flagRoom,
        blockData,
        blockConsolidatedSent,
        sendBlockConsolidatedCount,
        menu,
        updateMenu,
        headcount,
        principalAnalytics,
        principalRollups,
        togglePrincipalRollupFlag,
        remindPendingStudentPrincipal,
        remindAllPendingPrincipal,
        principalMess,
        principalNotifications,
        markAllPrincipalNotificationsRead,
        principalWastageTrend,
        blockPerformance,
        kfcHourlyFootfall,
        aiAnomalies,
        resolveAnomaly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
