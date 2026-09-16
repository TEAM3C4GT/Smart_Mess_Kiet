import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
  const [studentSelections, setStudentSelections] = useState({
    breakfast: 'will_eat',
    lunch: 'will_eat',
    snacks: 'will_not_eat',
    dinner: 'will_eat',
  });
  const [studentSubmitted, setStudentSubmitted] = useState(true);

  // 2. KFC Menu & Pre-Orders
  const [kfcMenu, setKfcMenu] = useState([
    { id: 1, name: 'Hot & Crispy Bucket (4 Pcs)', price: 449, category: 'Buckets', image: '🍗', isAvailable: true },
    { id: 2, name: 'Zinger Burger Duo', price: 299, category: 'Burgers', image: '🍔', isAvailable: true },
    { id: 3, name: 'Popcorn Chicken (Large)', price: 229, category: 'Snacks', image: '🍿', isAvailable: true },
    { id: 4, name: 'Peri Peri Fries', price: 119, category: 'Sides', image: '🍟', isAvailable: true },
    { id: 5, name: 'Choco Lava Cake', price: 99, category: 'Desserts', image: '🍰', isAvailable: true },
    { id: 6, name: 'Chilled Pepsi 500ml', price: 60, category: 'Beverages', image: '🥤', isAvailable: true }
  ]);

  const [kfcOrders, setKfcOrders] = useState([
    {
      id: 'ORD-8821',
      token: 'KFC-302-01',
      studentName: 'Alex Rivers',
      room: 'Room 302',
      items: [{ name: 'Zinger Burger Duo', qty: 1, price: 299 }],
      totalAmount: 299,
      orderTime: '06:45 PM',
      status: 'Ready' // Pending, Preparing, Ready, Collected
    },
    {
      id: 'ORD-8819',
      token: 'KFC-204-03',
      studentName: 'Rohan Sharma',
      room: 'Room 204',
      items: [{ name: 'Hot & Crispy Bucket (4 Pcs)', qty: 1, price: 449 }, { name: 'Chilled Pepsi 500ml', qty: 2, price: 120 }],
      totalAmount: 569,
      orderTime: '07:10 PM',
      status: 'Preparing'
    },
    {
      id: 'ORD-8815',
      token: 'KFC-105-02',
      studentName: 'Sneha Patel',
      room: 'Room 105',
      items: [{ name: 'Popcorn Chicken (Large)', qty: 1, price: 229 }],
      totalAmount: 229,
      orderTime: '07:25 PM',
      status: 'Pending'
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

  // 7. Principal Executive Datasets
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

  return (
    <AppContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
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
