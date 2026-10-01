import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

const AppContext = createContext();

export const STUDENT_ROSTER = [
  // Block D - Floor 1 - Room D-101
  { rollNo: '23B21A4501', name: 'Alex Rivers', email: 'alex.rivers@kiet.edu', room: 'Room D-101 • Block D' },
  { rollNo: '23B21A4225', name: 'NITHIN', email: '23b21a4225@kiet.edu', room: 'Room D-101 • Block D' },
  { rollNo: '23JN1A4543', name: 'VISALYA', email: '23jn1a4543@kiet.edu', room: 'Room D-101 • Block D' },
  { rollNo: '23B21A4502', name: 'Rahul Verma', email: 'rahul.verma@kiet.edu', room: 'Room D-101 • Block D' },
  { rollNo: '23B21A4503', name: 'Priya Sundaram', email: 'priya.sundaram@kiet.edu', room: 'Room D-101 • Block D' },
  // Block D - Floor 1 - Room D-102
  { rollNo: '23B21D0101', name: 'Abhishek Tiwari', email: 'abhishek.tiwari@kiet.edu', room: 'Room D-102 • Block D' },
  { rollNo: '23B21D0102', name: 'Saurabh Mishra', email: 'saurabh.mishra@kiet.edu', room: 'Room D-102 • Block D' },
  { rollNo: '23B21D0103', name: 'Harshit Srivastava', email: 'harshit.s@kiet.edu', room: 'Room D-102 • Block D' },
  { rollNo: '23B21D0104', name: 'Mohit Pandey', email: 'mohit.pandey@kiet.edu', room: 'Room D-102 • Block D' },
  { rollNo: '23B21D0105', name: 'Anurag Yadav', email: 'anurag.yadav@kiet.edu', room: 'Room D-102 • Block D' },
  // Block D - Floor 2 - Room D-201
  { rollNo: '23B21D0201', name: 'Prashant Singh', email: 'prashant.singh@kiet.edu', room: 'Room D-201 • Block D' },
  { rollNo: '23B21D0202', name: 'Utkarsh Shukla', email: 'utkarsh.shukla@kiet.edu', room: 'Room D-201 • Block D' },
  { rollNo: '23B21D0203', name: 'Deepanshu Bhatt', email: 'deepanshu.b@kiet.edu', room: 'Room D-201 • Block D' },
  { rollNo: '23B21A4504', name: 'Vikram Sethi', email: 'vikram.sethi@kiet.edu', room: 'Room D-201 • Block D' },
  { rollNo: '23B21A4505', name: 'Ananya Gupta', email: 'ananya.gupta@kiet.edu', room: 'Room D-201 • Block D' },
  // Block D - Floor 2 - Room D-202
  { rollNo: '23B21D0204', name: 'Vaibhav Goyal', email: 'vaibhav.goyal@kiet.edu', room: 'Room D-202 • Block D' },
  { rollNo: '23B21D0205', name: 'Ayush Saxena', email: 'ayush.saxena@kiet.edu', room: 'Room D-202 • Block D' },
  { rollNo: '23B21D0206', name: 'Rishabh Dubey', email: 'rishabh.dubey@kiet.edu', room: 'Room D-202 • Block D' },
  { rollNo: '23B21D0106', name: 'Shivam Dixit', email: 'shivam.dixit@kiet.edu', room: 'Room D-202 • Block D' },
  { rollNo: '23B21A0201', name: 'Karan Mehra', email: 'karan.mehra@kiet.edu', room: 'Room D-202 • Block D' },
  // Block E - Floor 1 - Room E-101
  { rollNo: '23B21A4538', name: 'SRIRAM', email: '23b21a4538@kiet.edu', room: 'Room E-101 • Block E' },
  { rollNo: '23B21A45A1', name: 'KEERTHI', email: '23b21a45a1@kiet.edu', room: 'Room E-101 • Block E' },
  { rollNo: '23JN1A4316', name: 'SUPRIYA', email: '23jn1a4316@kiet.edu', room: 'Room E-101 • Block E' },
  { rollNo: '24B21A4576', name: 'SRK', email: '24b21a4576@kiet.edu', room: 'Room E-101 • Block E' },
  { rollNo: '23B21A4661', name: 'KARTHIK', email: '23b21a4661@kiet.edu', room: 'Room E-101 • Block E' },
  // Block E - Floor 1 - Room E-102
  { rollNo: '23B21E0101', name: 'Aaditya Nair', email: 'aaditya.nair@kiet.edu', room: 'Room E-102 • Block E' },
  { rollNo: '23B21E0102', name: 'Tanvi Sharma', email: 'tanvi.sharma@kiet.edu', room: 'Room E-102 • Block E' },
  { rollNo: '23B21E0103', name: 'Rhea Sen', email: 'rhea.sen@kiet.edu', room: 'Room E-102 • Block E' },
  { rollNo: '23B21E0104', name: 'Chaitanya Pillai', email: 'chaitanya.p@kiet.edu', room: 'Room E-102 • Block E' },
  { rollNo: '23B21E0105', name: 'Aditi Deshmukh', email: 'aditi.deshmukh@kiet.edu', room: 'Room E-102 • Block E' },
  // Block E - Floor 2 - Room E-201
  { rollNo: '23B21E0201', name: 'Kavya Madhavan', email: 'kavya.m@kiet.edu', room: 'Room E-201 • Block E' },
  { rollNo: '23B21E0202', name: 'Siddharth Menon', email: 'siddharth.m@kiet.edu', room: 'Room E-201 • Block E' },
  { rollNo: '23B21E0203', name: 'Arvind Swaminathan', email: 'arvind.s@kiet.edu', room: 'Room E-201 • Block E' },
  { rollNo: '23B21E0106', name: 'Meera Chawla', email: 'meera.chawla@kiet.edu', room: 'Room E-201 • Block E' },
  { rollNo: '24B21A43A1', name: 'NITHIN (PG)', email: '24b21a43a1@kiet.edu', room: 'Room E-201 • Block E' },
  // Block E - Floor 2 - Room E-202
  { rollNo: '23B21E0204', name: 'Pooja Hegde', email: 'pooja.hegde@kiet.edu', room: 'Room E-202 • Block E' },
  { rollNo: '23B21E0205', name: 'Divya Krishnan', email: 'divya.krishnan@kiet.edu', room: 'Room E-202 • Block E' },
  { rollNo: '23B21E0206', name: 'Raghavan Iyer', email: 'raghavan.iyer@kiet.edu', room: 'Room E-202 • Block E' },
  { rollNo: '23B21A0206', name: 'Deepak Roy', email: 'deepak.roy@kiet.edu', room: 'Room E-202 • Block E' },
  { rollNo: '23B21A0211', name: 'Tarun Josh', email: 'tarun.josh@kiet.edu', room: 'Room E-202 • Block E' }
];

export const STAFF_ACCOUNTS = [
  {
    role: 'KFC Staff',
    email: 'nithin.kfcstaff@gmail.com',
    name: 'Nithin (KFC Staff)',
    path: '/kfc-staff',
    badge: 'Canteen Fulfillment'
  },
  {
    role: 'Room Lead',
    email: 'nithin.roomlead@gmail.com',
    name: 'Alex Rivers (Room Lead)',
    path: '/room-lead',
    badge: 'Lead • Room D-101'
  },
  {
    role: 'Floor Incharge',
    email: 'nithin.floor@gmail.com',
    name: 'Prof. Sharma (Floor D-1 Incharge)',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block D'
  },
  {
    role: 'Floor Incharge',
    email: 'nithin.floord1@gmail.com',
    name: 'Prof. Sharma (Floor D-1 Incharge)',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block D'
  },
  {
    role: 'Floor Incharge',
    email: 'nithin.floord2@gmail.com',
    name: 'Prof. R. Verma (Floor D-2 Incharge)',
    path: '/floor-incharge',
    badge: 'Floor 2 Incharge • Block D'
  },
  {
    role: 'Floor Incharge',
    email: 'nithin.floore1@gmail.com',
    name: 'Dr. Ananya Roy (Floor E-1 Incharge)',
    path: '/floor-incharge',
    badge: 'Floor 1 Incharge • Block E'
  },
  {
    role: 'Floor Incharge',
    email: 'nithin.floore2@gmail.com',
    name: 'Dr. K. Swaminathan (Floor E-2 Incharge)',
    path: '/floor-incharge',
    badge: 'Floor 2 Incharge • Block E'
  },
  {
    role: 'Block Coordinator',
    email: 'nithin.block@gmail.com',
    name: 'Nithin (Block Coordinator)',
    path: '/block-coordinator',
    badge: 'Block Coordinator • Block D & E'
  },
  {
    role: 'Mess Incharge',
    email: 'nithin.mess@gmail.com',
    name: 'Nithin (Mess Incharge)',
    path: '/mess-incharge',
    badge: 'Main Mess Kitchen'
  },
  {
    role: 'Principal',
    email: 'nithin.principal@gmail.com',
    name: 'Nithin (Principal)',
    path: '/principal',
    badge: 'Executive Command'
  },
  {
    role: 'Admin',
    email: 'admin@gmail.com',
    name: 'Admin',
    path: '/dashboards',
    badge: 'Campus Superadmin'
  }
];

export const DEFAULT_CAMPUS_USERS = [
  ...STUDENT_ROSTER.map((s, idx) => ({
    id: `USR-S${String(idx + 1).padStart(2, '0')}`,
    name: s.name,
    rollNo: s.rollNo,
    email: s.email,
    role: 'Student',
    path: '/student',
    badge: `${s.rollNo} • ${s.room}`,
    status: 'Active',
    lastActive: idx === 0 ? 'Active now' : 'Today'
  })),
  ...STAFF_ACCOUNTS.map((st, idx) => ({
    id: `USR-ST${String(idx + 1).padStart(2, '0')}`,
    name: st.name,
    email: st.email,
    role: st.role,
    path: st.path,
    badge: st.badge,
    status: 'Active',
    lastActive: 'Active now'
  }))
];

export const DEMO_USERS = DEFAULT_CAMPUS_USERS;

export const DEFAULT_MESS_MENU = {
  date: 'Tomorrow (Sept 17)',
  breakfast: 'Masala Dosa & Sambar, Poha with Chai',
  lunch: 'Rajma Chawal Thali, Paneer Butter Masala',
  snacks: 'Samosa & Chai',
  dinner: 'Roti, Dal, Sabzi, Chicken Curry & Rice'
};

export const DEFAULT_HEADCOUNT = [
  { meal: 'Breakfast', selected: 169, predicted: 175, actual: 172, variance: '+6' },
  { meal: 'Lunch', selected: 185, predicted: 192, actual: 189, variance: '+7' },
  { meal: 'Snacks', selected: 140, predicted: 148, actual: 145, variance: '+8' },
  { meal: 'Dinner', selected: 178, predicted: 184, actual: 180, variance: '+6' }
];

const DISH_IMAGE_MAP = {
  dosa: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
  poha: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80',
  idli: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
  sambar: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
  rajma: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=200&auto=format&fit=crop&q=80',
  paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80',
  roti: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80',
  chicken: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop&q=80',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80',
  dal: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=80',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
  chai: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
  curd: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&auto=format&fit=crop&q=80',
  rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&auto=format&fit=crop&q=80',
  chole: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80',
  egg: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop&q=80',
  gulab: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80',
  jamun: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&auto=format&fit=crop&q=80'
};

const getDishImage = (dishName) => {
  const lower = (dishName || '').toLowerCase();
  for (const [key, url] of Object.entries(DISH_IMAGE_MAP)) {
    if (lower.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
};

const getDishTags = (dishName, mealKey) => {
  const lower = (dishName || '').toLowerCase();
  if (lower.includes('chicken') || lower.includes('egg') || lower.includes('fish') || lower.includes('mutton')) {
    return 'non-veg • protein';
  }
  if (lower.includes('tea') || lower.includes('chai') || lower.includes('coffee') || lower.includes('milk')) {
    return 'beverage • hot';
  }
  if (lower.includes('gulab') || lower.includes('halwa') || lower.includes('sweet') || lower.includes('kheer')) {
    return 'dessert • sweet';
  }
  if (mealKey === 'breakfast') {
    return lower.includes('dosa') || lower.includes('idli') ? 'south • vegetarian' : 'breakfast • vegetarian';
  }
  if (mealKey === 'lunch') {
    return 'vegetarian • wholesome';
  }
  if (mealKey === 'snacks') {
    return 'snack • vegetarian';
  }
  return 'dinner • healthy';
};

const convertMenuToMeals = (menuObj, previousMeals = {}) => {
  const meals = {};
  ['breakfast', 'lunch', 'snacks', 'dinner'].forEach((mealKey) => {
    const dishString = (menuObj && menuObj[mealKey]) || '';
    const rawNames = dishString.split(',').map((s) => s.trim()).filter(Boolean);
    const existingList = (previousMeals && previousMeals[mealKey]?.items) || [];

    const items = rawNames.map((name) => {
      const match = existingList.find((ex) => ex.name.toLowerCase() === name.toLowerCase());
      if (match) {
        return { ...match, name };
      }
      return {
        name,
        tags: getDishTags(name, mealKey),
        image: getDishImage(name)
      };
    });

    const title = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
    meals[mealKey] = {
      title,
      optionsCount: `${items.length} ${items.length === 1 ? 'option' : 'options'}`,
      items
    };
  });
  return meals;
};

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

  // 1. Mess Menu & Headcount State
  const [menu, setMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_menu');
      return saved ? JSON.parse(saved) : DEFAULT_MESS_MENU;
    } catch {
      return DEFAULT_MESS_MENU;
    }
  });

  const [headcount, setHeadcount] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_headcount');
      return saved ? JSON.parse(saved) : DEFAULT_HEADCOUNT;
    } catch {
      return DEFAULT_HEADCOUNT;
    }
  });

  // Student Meal Selection State
  const [studentMealPlan, setStudentMealPlan] = useState(() => {
    let savedPlan = null;
    try {
      const raw = localStorage.getItem('smart_mess_student_meal_plan');
      if (raw) savedPlan = JSON.parse(raw);
    } catch {}

    const initialMenu = (() => {
      try {
        const saved = localStorage.getItem('smart_mess_menu');
        return saved ? JSON.parse(saved) : DEFAULT_MESS_MENU;
      } catch {
        return DEFAULT_MESS_MENU;
      }
    })();

    const initialMeals = convertMenuToMeals(initialMenu, savedPlan?.meals);

    return {
      date: savedPlan?.date || 'Thursday, Sep 17',
      dateSubtitle: savedPlan?.dateSubtitle || "Toggle meals you'll eat. Locks daily at 21:00.",
      cutoff: savedPlan?.cutoff || '21:00',
      streak: savedPlan?.streak || 0,
      selections: savedPlan?.selections || {
        breakfast: false,
        lunch: true,
        snacks: true,
        dinner: true
      },
      meals: savedPlan?.meals || initialMeals
    };
  });

  const messBcRef = useRef(null);

  const broadcastMessSync = (type, payload) => {
    try {
      if (messBcRef.current) {
        messBcRef.current.postMessage({ type, ...payload });
      }
    } catch (e) {
      console.warn('Mess BroadcastChannel error:', e);
    }
  };

  // Campus Users Management State
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_users_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 40 && !parsed.some(u => (u.badge || '').includes('Block B'))) {
          return parsed;
        }
      }
      localStorage.setItem('smart_mess_users_v3', JSON.stringify(DEFAULT_CAMPUS_USERS));
      return DEFAULT_CAMPUS_USERS;
    } catch {
      return DEFAULT_CAMPUS_USERS;
    }
  });

  const broadcastUsers = (newUsers) => {
    try {
      localStorage.setItem('smart_mess_users_v3', JSON.stringify(newUsers));
      broadcastMessSync('USERS_SYNC', { users: newUsers });
    } catch (e) {
      console.warn(e);
    }
  };

  const addUser = async (userData) => {
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
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      role: userData.role || 'Student',
      path: rolePaths[userData.role] || '/student',
      badge: userData.badge || `${userData.role} • Campus`,
      status: userData.status || 'Active',
      lastActive: 'Just registered'
    };

    setUsers((prev) => {
      const updated = [newUser, ...prev];
      broadcastUsers(updated);
      return updated;
    });

    addToast(`User ${newUser.name} registered as ${newUser.role}!`, 'success');

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {}

    return newUser;
  };

  const updateUser = async (userId, updatedData) => {
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

    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id !== userId) return u;
        const newRole = updatedData.role || u.role;
        return {
          ...u,
          ...updatedData,
          path: rolePaths[newRole] || u.path
        };
      });
      broadcastUsers(updated);
      return updated;
    });

    addToast('User details updated successfully!', 'success');

    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {}
  };

  const deleteUser = async (userId) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      broadcastUsers(updated);
      return updated;
    });

    addToast(`User account ${target ? target.name : ''} removed`, 'info');

    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const toggleUserStatus = (userId) => {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addToast(`${u.name} marked as ${newStatus}`, newStatus === 'Active' ? 'success' : 'warning');
        return { ...u, status: newStatus };
      });
      broadcastUsers(updated);
      return updated;
    });
  };

  const loginAsUser = (targetUser) => {
    const sessionUser = {
      ...targetUser,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCurrentUser(sessionUser);
    try {
      localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
    } catch (e) {}
    addToast(`Switched portal session to ${sessionUser.name} (${sessionUser.role})`, 'success');
    return sessionUser;
  };

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(data.users)) {
              try {
                localStorage.setItem('smart_mess_users_v3', JSON.stringify(data.users));
              } catch (e) {}
              return data.users;
            }
            return prev;
          });
        }
      }
    } catch (err) {}
  };

  const toggleStudentMeal = (mealKey) => {
    const studentName = currentUser?.name || 'Aarav Sharma';
    const currentStatus = !!studentMealPlan.selections[mealKey];
    const newStatus = !currentStatus;
    const delta = newStatus ? 1 : -1;

    const updatedPlan = {
      ...studentMealPlan,
      selections: {
        ...studentMealPlan.selections,
        [mealKey]: newStatus
      }
    };
    setStudentMealPlan(updatedPlan);

    const updatedHeadcount = headcount.map((row) => {
      if (row.meal.toLowerCase() === mealKey.toLowerCase()) {
        const newSelected = Math.max(0, row.selected + delta);
        const diff = row.predicted - newSelected;
        const variance = (diff >= 0 ? '+' : '') + diff;
        return {
          ...row,
          selected: newSelected,
          variance
        };
      }
      return row;
    });

    setHeadcount(updatedHeadcount);

    try {
      localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
      localStorage.setItem('smart_mess_headcount', JSON.stringify(updatedHeadcount));
    } catch (e) {}

    broadcastMessSync('HEADCOUNT_SYNC', {
      headcount: updatedHeadcount,
      mealKey,
      status: newStatus,
      studentName
    });

    fetch('/api/selections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        meal: mealKey,
        selected: newStatus,
        date: updatedPlan.date
      })
    }).catch(() => {});

    addToast(
      newStatus
        ? `Opted in for ${mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}`
        : `Opted out of ${mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}`,
      newStatus ? 'success' : 'info'
    );
  };

  const confirmStudentMealSelection = () => {
    const studentName = currentUser?.name || 'Aarav Sharma';
    addToast('Meal selection confirmed for Thursday, Sep 17!', 'success');
    broadcastMessSync('STUDENT_MEAL_CONFIRM', {
      studentName,
      selections: studentMealPlan.selections
    });
    fetch('/api/selections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        confirmed: true,
        selections: studentMealPlan.selections,
        date: studentMealPlan.date
      })
    }).catch(() => {});
  };

  const updateMenu = (newMenu) => {
    setMenu(newMenu);
    try {
      localStorage.setItem('smart_mess_menu', JSON.stringify(newMenu));
    } catch (e) {}

    let updatedMeals;
    setStudentMealPlan((prev) => {
      updatedMeals = convertMenuToMeals(newMenu, prev.meals);
      const updatedPlan = {
        ...prev,
        meals: updatedMeals
      };
      try {
        localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
      } catch (e) {}
      return updatedPlan;
    });

    broadcastMessSync('MESS_MENU_SYNC', { menu: newMenu, meals: updatedMeals });

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenu)
    }).catch(() => {});

    addToast("Tomorrow's menu updated and published to student portals!", 'success');
  };

  const removeMessDish = (mealKey, dishName) => {
    const currentMeal = studentMealPlan.meals[mealKey];
    if (!currentMeal) return;

    const updatedItems = currentMeal.items.filter(
      (item) => item.name.toLowerCase() !== dishName.toLowerCase()
    );

    const updatedMeals = {
      ...studentMealPlan.meals,
      [mealKey]: {
        ...currentMeal,
        optionsCount: `${updatedItems.length} ${updatedItems.length === 1 ? 'option' : 'options'}`,
        items: updatedItems
      }
    };

    const newDishString = updatedItems.map((i) => i.name).join(', ');
    const updatedMenu = {
      ...menu,
      [mealKey]: newDishString
    };

    const updatedPlan = {
      ...studentMealPlan,
      meals: updatedMeals
    };

    setMenu(updatedMenu);
    setStudentMealPlan(updatedPlan);

    try {
      localStorage.setItem('smart_mess_menu', JSON.stringify(updatedMenu));
      localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
    } catch (e) {}

    broadcastMessSync('MESS_MENU_SYNC', { menu: updatedMenu, meals: updatedMeals });

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMenu)
    }).catch(() => {});

    addToast(`"${dishName}" removed from ${mealKey} menu`, 'info');
  };

  const addMessDish = (mealKey, dishName, customTag = '', customImage = '') => {
    if (!dishName || !dishName.trim()) return;
    const cleanName = dishName.trim();
    const currentMeal = studentMealPlan.meals[mealKey];
    const existing = currentMeal?.items || [];

    if (existing.some((i) => i.name.toLowerCase() === cleanName.toLowerCase())) {
      addToast(`"${cleanName}" is already on the ${mealKey} menu`, 'warning');
      return;
    }

    const newItem = {
      name: cleanName,
      tags: customTag || getDishTags(cleanName, mealKey),
      image: customImage || getDishImage(cleanName)
    };

    const updatedItems = [...existing, newItem];
    const updatedMeals = {
      ...studentMealPlan.meals,
      [mealKey]: {
        title: mealKey.charAt(0).toUpperCase() + mealKey.slice(1),
        optionsCount: `${updatedItems.length} ${updatedItems.length === 1 ? 'option' : 'options'}`,
        items: updatedItems
      }
    };

    const newDishString = updatedItems.map((i) => i.name).join(', ');
    const updatedMenu = {
      ...menu,
      [mealKey]: newDishString
    };

    const updatedPlan = {
      ...studentMealPlan,
      meals: updatedMeals
    };

    setMenu(updatedMenu);
    setStudentMealPlan(updatedPlan);

    try {
      localStorage.setItem('smart_mess_menu', JSON.stringify(updatedMenu));
      localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
    } catch (e) {}

    broadcastMessSync('MESS_MENU_SYNC', { menu: updatedMenu, meals: updatedMeals });

    fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMenu)
    }).catch(() => {});

    addToast(`"${cleanName}" added to ${mealKey} menu!`, 'success');
  };

  const refreshMessMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.menu) {
          setMenu((prevMenu) => {
            if (JSON.stringify(prevMenu) !== JSON.stringify(data.menu)) {
              try {
                localStorage.setItem('smart_mess_menu', JSON.stringify(data.menu));
              } catch (e) {}
              setStudentMealPlan((prevPlan) => {
                const updatedMeals = convertMenuToMeals(data.menu, prevPlan.meals);
                const updatedPlan = { ...prevPlan, meals: updatedMeals };
                try {
                  localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
                } catch (e) {}
                return updatedPlan;
              });
              return data.menu;
            }
            return prevMenu;
          });
        }
      }
    } catch (err) {}
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
  const DEFAULT_KFC_MENU = [
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

  const [kfcMenu, setKfcMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_kfc_menu');
      return saved ? JSON.parse(saved) : DEFAULT_KFC_MENU;
    } catch {
      return DEFAULT_KFC_MENU;
    }
  });

  const kfcBcRef = useRef(null);

  const broadcastKfcMenu = (newMenu) => {
    try {
      localStorage.setItem('smart_mess_kfc_menu', JSON.stringify(newMenu));
      if (kfcBcRef.current) {
        kfcBcRef.current.postMessage({ type: 'KFC_MENU_SYNC', menu: newMenu });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        kfcBcRef.current = new BroadcastChannel('smart_mess_kfc_channel');
        kfcBcRef.current.onmessage = (event) => {
          if (event.data?.type === 'KFC_MENU_SYNC' && Array.isArray(event.data.menu)) {
            setKfcMenu(event.data.menu);
          } else if (event.data?.type === 'KFC_ORDER_STATUS_SYNC') {
            const { orderId, status } = event.data;
            setKfcOrders((prev) =>
              prev.map((ord) => (ord.id === orderId || ord.token === orderId ? { ...ord, status } : ord))
            );
            addToast(`KFC Order ${orderId} is now ${status}!`, 'info');
          }
        };

        messBcRef.current = new BroadcastChannel('smart_mess_sync_channel');
        messBcRef.current.onmessage = (event) => {
          const { type, menu: newMenu, meals: newMeals, headcount: newHeadcount, studentMealPlan: newPlan } = event.data || {};
          if (type === 'MESS_MENU_SYNC') {
            if (newMenu) setMenu(newMenu);
            if (newMeals) {
              setStudentMealPlan((prev) => ({
                ...prev,
                meals: newMeals
              }));
            }
          } else if (type === 'HEADCOUNT_SYNC') {
            if (newHeadcount) setHeadcount(newHeadcount);
          } else if (type === 'STUDENT_PLAN_SYNC') {
            if (newPlan) setStudentMealPlan(newPlan);
            if (newHeadcount) setHeadcount(newHeadcount);
          } else if (type === 'USERS_SYNC') {
            if (Array.isArray(event.data.users)) setUsers(event.data.users);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }

    const handleStorage = (e) => {
      if (e.key === 'smart_mess_kfc_menu' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setKfcMenu(parsed);
          }
        } catch (err) {
          console.warn('Storage sync error:', err);
        }
      } else if (e.key === 'smart_mess_menu' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMenu(parsed);
          setStudentMealPlan((prev) => ({
            ...prev,
            meals: convertMenuToMeals(parsed, prev.meals)
          }));
        } catch {}
      } else if (e.key === 'smart_mess_student_meal_plan' && e.newValue) {
        try {
          setStudentMealPlan(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === 'smart_mess_headcount' && e.newValue) {
        try {
          setHeadcount(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === 'smart_mess_users_v3' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && !parsed.some(u => (u.badge || '').includes('Block B'))) setUsers(parsed);
        } catch {}
      }
    };

    const handleFocusOrVisibility = () => {
      try {
        const savedKfc = localStorage.getItem('smart_mess_kfc_menu');
        if (savedKfc) {
          const parsed = JSON.parse(savedKfc);
          if (Array.isArray(parsed)) {
            setKfcMenu((prev) => (JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev));
          }
        }
        const savedMenu = localStorage.getItem('smart_mess_menu');
        if (savedMenu) {
          const parsedMenu = JSON.parse(savedMenu);
          setMenu((prev) => (JSON.stringify(prev) !== JSON.stringify(parsedMenu) ? parsedMenu : prev));
        }
        const savedPlan = localStorage.getItem('smart_mess_student_meal_plan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          setStudentMealPlan((prev) => (JSON.stringify(prev) !== JSON.stringify(parsedPlan) ? parsedPlan : prev));
        }
        const savedHeadcount = localStorage.getItem('smart_mess_headcount');
        if (savedHeadcount) {
          const parsedHeadcount = JSON.parse(savedHeadcount);
          setHeadcount((prev) => (JSON.stringify(prev) !== JSON.stringify(parsedHeadcount) ? parsedHeadcount : prev));
        }
        const savedUsers = localStorage.getItem('smart_mess_users_v3');
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          if (Array.isArray(parsedUsers) && !parsedUsers.some(u => (u.badge || '').includes('Block B'))) {
            setUsers((prev) => (JSON.stringify(prev) !== JSON.stringify(parsedUsers) ? parsedUsers : prev));
          }
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      if (kfcBcRef.current) {
        kfcBcRef.current.close();
        kfcBcRef.current = null;
      }
      if (messBcRef.current) {
        messBcRef.current.close();
        messBcRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('smart_mess_kfc_menu', JSON.stringify(kfcMenu));
    } catch (e) {
      console.warn(e);
    }
  }, [kfcMenu]);

  const [kfcOrders, setKfcOrders] = useState([]);

  // Cross-Tab Synchronization Constants
  const NOTIFICATIONS_STORAGE_KEY = 'smart_mess_room_lead_notifications_v3';
  const FLOOR_ROOMS_STORAGE_KEY = 'smart_mess_floor_rooms_v3';
  const FLOOR_ALERTS_STORAGE_KEY = 'smart_mess_floor_alerts_v1';
  const FLOOR_MEAL_SHEETS_STORAGE_KEY = 'smart_mess_floor_meal_sheets_v1';
  const ROOM_MEMBERS_STORAGE_KEY = 'smart_mess_room_members_v1';
  const FLOOR_MEAL_REQS_STORAGE_KEY = 'smart_mess_floor_meal_reqs_v1';

  // 3. Room Lead Data (Room D-101, Block D) (Persisted & Synced across tabs)
  const [roomMembers, setRoomMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(ROOM_MEMBERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      { id: 1, name: 'Alex Rivers (You)', status: 'Submitted', time: '08:30 AM', choices: { b: 'Yes', l: 'Yes', s: 'No', d: 'Yes' } },
      { id: 2, name: 'NITHIN', status: 'Submitted', time: '09:15 AM', choices: { b: 'Yes', l: 'Yes', s: 'Yes', d: 'Yes' } },
      { id: 3, name: 'VISALYA', status: 'Submitted', time: '10:05 AM', choices: { b: 'Yes', l: 'Yes', s: 'No', d: 'Yes' } },
      { id: 4, name: 'Rahul Verma', status: 'Submitted', time: '11:40 AM', choices: { b: 'No', l: 'Yes', s: 'No', d: 'Yes' } },
      { id: 5, name: 'Priya Sundaram', status: 'Submitted', time: '02:10 PM', choices: { b: 'Yes', l: 'Yes', s: 'Yes', d: 'No' } }
    ];
  });
  const INITIAL_ROOM_LEAD_NOTIFICATIONS = [
    {
      id: 1,
      title: 'Daily Cutoff Notice from Floor D-1 Incharge',
      message: 'Prof. Sharma: Please verify all 5 Room D-101 members have selected their meals before tonight\'s 10:00 PM cutoff.',
      sender: 'Prof. Sharma (Floor Incharge)',
      roomNo: 'Room D-101',
      time: '10:15 AM',
      timestamp: Date.now() - 3600000,
      read: false,
      type: 'reminder'
    }
  ];

  // Urgent Cutoff Nudges & Alerts from Block Coordinator to Floor Incharge (Persisted & Synced across tabs)
  const [floorInchargeAlerts, setFloorInchargeAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem(FLOOR_ALERTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read floor alerts from localStorage', e);
    }
    return [];
  });

  // Floor Incharge Headcount Requisition Sheets sent to Mess Kitchen (Persisted & Synced across tabs)
  const [floorMealSheets, setFloorMealSheets] = useState(() => {
    try {
      const saved = localStorage.getItem(FLOOR_MEAL_SHEETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read floor meal sheets from localStorage', e);
    }
    return [
      {
        id: 1,
        floor: 'Floor 1 (Block D)',
        incharge: 'Prof. Sharma (Floor Incharge)',
        requirements: { breakfast: 10, lunch: 10, snacks: 8, dinner: 10 },
        timestamp: '10:00 AM',
        status: 'Pending Verification'
      }
    ];
  });

  // Notifications received by the Room Lead from Floor Incharge & Mess Admin (Persisted & Synced across tabs)
  const [roomLeadNotifications, setRoomLeadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(n => (n.message || '').includes('Block B') || (n.roomNo || '').includes('302'))) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read room lead notifications from localStorage', e);
    }
    return INITIAL_ROOM_LEAD_NOTIFICATIONS;
  });

  // 4. Floor Incharge Data (Floor 1, Block D) (Persisted & Synced across tabs)
  const [floorRooms, setFloorRooms] = useState(() => {
    try {
      const saved = localStorage.getItem(FLOOR_ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(r => r.roomNo.includes('F-201') || r.roomNo.includes('302'))) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read floor rooms from localStorage', e);
    }
    return [
      { roomNo: 'Room D-101', lead: 'Alex Rivers', members: 5, submitted: 5, pending: 0, rate: 100, status: 'High', flagged: false },
      { roomNo: 'Room D-102', lead: 'Abhishek Tiwari', members: 5, submitted: 5, pending: 0, rate: 100, status: 'High', flagged: false },
      { roomNo: 'Room D-201', lead: 'Prashant Singh', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false },
      { roomNo: 'Room D-202', lead: 'Vaibhav Goyal', members: 5, submitted: 3, pending: 2, rate: 60, status: 'Medium', flagged: false },
      { roomNo: 'Room E-101', lead: 'SRIRAM', members: 5, submitted: 5, pending: 0, rate: 100, status: 'High', flagged: false },
      { roomNo: 'Room E-102', lead: 'Aaditya Nair', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false },
      { roomNo: 'Room E-201', lead: 'Kavya Madhavan', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false },
      { roomNo: 'Room E-202', lead: 'Pooja Hegde', members: 5, submitted: 4, pending: 1, rate: 80, status: 'Good', flagged: false }
    ];
  });

  const [floorAttendance, setFloorAttendance] = useState({
    'Room D-101': {
      verified: true,
      students: [
        { id: 'D101-1', name: 'Alex Rivers (Lead)', status: 'Present' },
        { id: 'D101-2', name: 'NITHIN', status: 'Present' },
        { id: 'D101-3', name: 'VISALYA', status: 'Present' },
        { id: 'D101-4', name: 'Rahul Verma', status: 'Present' },
        { id: 'D101-5', name: 'Priya Sundaram', status: 'Present' }
      ]
    },
    'Room D-102': {
      verified: true,
      students: [
        { id: 'D102-1', name: 'Abhishek Tiwari (Lead)', status: 'Present' },
        { id: 'D102-2', name: 'Saurabh Mishra', status: 'Present' },
        { id: 'D102-3', name: 'Harshit Srivastava', status: 'Present' },
        { id: 'D102-4', name: 'Mohit Pandey', status: 'Present' },
        { id: 'D102-5', name: 'Anurag Yadav', status: 'Present' }
      ]
    },
    'Room D-201': {
      verified: false,
      students: [
        { id: 'D201-1', name: 'Prashant Singh (Lead)', status: 'Present' },
        { id: 'D201-2', name: 'Utkarsh Shukla', status: 'Present' },
        { id: 'D201-3', name: 'Deepanshu Bhatt', status: 'Present' },
        { id: 'D201-4', name: 'Vikram Sethi', status: 'Present' },
        { id: 'D201-5', name: 'Ananya Gupta', status: 'Absent' }
      ]
    },
    'Room D-202': {
      verified: false,
      students: [
        { id: 'D202-1', name: 'Vaibhav Goyal (Lead)', status: 'Present' },
        { id: 'D202-2', name: 'Ayush Saxena', status: 'Present' },
        { id: 'D202-3', name: 'Rishabh Dubey', status: 'Present' },
        { id: 'D202-4', name: 'Shivam Dixit', status: 'Absent' },
        { id: 'D202-5', name: 'Karan Mehra', status: 'On Leave' }
      ]
    },
    'Room E-101': {
      verified: true,
      students: [
        { id: 'E101-1', name: 'SRIRAM (Lead)', status: 'Present' },
        { id: 'E101-2', name: 'KEERTHI', status: 'Present' },
        { id: 'E101-3', name: 'SUPRIYA', status: 'Present' },
        { id: 'E101-4', name: 'SRK', status: 'Present' },
        { id: 'E101-5', name: 'KARTHIK', status: 'Present' }
      ]
    },
    'Room E-102': {
      verified: false,
      students: [
        { id: 'E102-1', name: 'Aaditya Nair (Lead)', status: 'Present' },
        { id: 'E102-2', name: 'Tanvi Sharma', status: 'Present' },
        { id: 'E102-3', name: 'Rhea Sen', status: 'Present' },
        { id: 'E102-4', name: 'Chaitanya Pillai', status: 'Present' },
        { id: 'E102-5', name: 'Aditi Deshmukh', status: 'Absent' }
      ]
    },
    'Room E-201': {
      verified: false,
      students: [
        { id: 'E201-1', name: 'Kavya Madhavan (Lead)', status: 'Present' },
        { id: 'E201-2', name: 'Siddharth Menon', status: 'Present' },
        { id: 'E201-3', name: 'Arvind Swaminathan', status: 'Present' },
        { id: 'E201-4', name: 'Meera Chawla', status: 'Present' },
        { id: 'E201-5', name: 'NITHIN (PG)', status: 'Absent' }
      ]
    },
    'Room E-202': {
      verified: false,
      students: [
        { id: 'E202-1', name: 'Pooja Hegde (Lead)', status: 'Present' },
        { id: 'E202-2', name: 'Divya Krishnan', status: 'Present' },
        { id: 'E202-3', name: 'Raghavan Iyer', status: 'Present' },
        { id: 'E202-4', name: 'Deepak Roy', status: 'Present' },
        { id: 'E202-5', name: 'Tarun Josh', status: 'Absent' }
      ]
    }
  });

  const updateStudentAttendance = (roomNo, studentId, newStatus) => {
    setFloorAttendance((prev) => {
      const roomData = prev[roomNo];
      if (!roomData) return prev;
      const updatedStudents = roomData.students.map((s) =>
        s.id === studentId ? { ...s, status: newStatus } : s
      );
      return {
        ...prev,
        [roomNo]: {
          ...roomData,
          students: updatedStudents
        }
      };
    });
  };

  const submitRoomAttendance = (roomNo) => {
    setFloorAttendance((prev) => {
      const roomData = prev[roomNo];
      if (!roomData) return prev;
      return {
        ...prev,
        [roomNo]: {
          ...roomData,
          verified: true
        }
      };
    });
    const room = floorAttendance[roomNo];
    const presentCount = room ? room.students.filter((s) => s.status === 'Present').length : 0;
    const totalCount = room ? room.students.length : 0;
    addToast(`Attendance submitted for ${roomNo}: ${presentCount}/${totalCount} Present`, 'success');
  };

  const [floorMealRequirements, setFloorMealRequirements] = useState(() => {
    try {
      const saved = localStorage.getItem(FLOOR_MEAL_REQS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.breakfast) return parsed;
      }
    } catch (e) {}
    return {
      floorName: 'Floor 1',
      blockName: 'Hostel Block D',
      breakfast: { selected: 9, total: 10, percentage: 90 },
      lunch: { selected: 10, total: 10, percentage: 100 },
      snacks: { selected: 6, total: 10, percentage: 60 },
      dinner: { selected: 9, total: 10, percentage: 90 }
    };
  });

  const calculateFloorMealReqs = (currentRoomMembers) => {
    const d101B = currentRoomMembers.filter(m => m.status !== 'On Leave' && m.choices?.b === 'Yes').length;
    const d101L = currentRoomMembers.filter(m => m.status !== 'On Leave' && m.choices?.l === 'Yes').length;
    const d101S = currentRoomMembers.filter(m => m.status !== 'On Leave' && m.choices?.s === 'Yes').length;
    const d101D = currentRoomMembers.filter(m => m.status !== 'On Leave' && m.choices?.d === 'Yes').length;

    // Room D-102 (5 students: 5 Breakfast, 5 Lunch, 4 Snacks, 5 Dinner)
    const totalStudents = 10;
    const totalB = Math.min(totalStudents, d101B + 5);
    const totalL = Math.min(totalStudents, d101L + 5);
    const totalS = Math.min(totalStudents, d101S + 4);
    const totalD = Math.min(totalStudents, d101D + 5);

    return {
      floorName: 'Floor 1',
      blockName: 'Hostel Block D',
      breakfast: { selected: totalB, total: totalStudents, percentage: Math.round((totalB / totalStudents) * 100) },
      lunch: { selected: totalL, total: totalStudents, percentage: Math.round((totalL / totalStudents) * 100) },
      snacks: { selected: totalS, total: totalStudents, percentage: Math.round((totalS / totalStudents) * 100) },
      dinner: { selected: totalD, total: totalStudents, percentage: Math.round((totalD / totalStudents) * 100) }
    };
  };

  // 5. Block Coordinator Data (Block D & Block E) - Dynamically aggregated from live floorRooms
  const blockData = useMemo(() => {
    const getFloorStats = (prefix, floorLabel) => {
      const fRooms = floorRooms.filter((r) => r.roomNo.includes(prefix));
      const totalRooms = fRooms.length;
      const totalStudents = fRooms.reduce((s, r) => s + (r.members || 0), 0);
      const submitted = fRooms.reduce((s, r) => s + (r.submitted || 0), 0);
      const pending = Math.max(0, totalStudents - submitted);
      const rate = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;
      const status = rate >= 85 ? 'Optimal' : rate >= 60 ? 'Attention' : 'Critical';
      return {
        floor: floorLabel,
        rooms: totalRooms,
        totalStudents,
        submitted,
        pending,
        rate,
        status
      };
    };

    return [
      getFloorStats('D-1', 'Floor 1 (Block D)'),
      getFloorStats('D-2', 'Floor 2 (Block D)'),
      getFloorStats('E-1', 'Floor 1 (Block E)'),
      getFloorStats('E-2', 'Floor 2 (Block E)')
    ];
  }, [floorRooms]);
  const [blockConsolidatedSent, setBlockConsolidatedSent] = useState(false);

  // 6. Mess Incharge Data & Menu is initialized and synced at top of context

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
      { block: 'Block D (Senior Wing)', ratio: '17/20', rate: 85 },
      { block: 'Block E (International/PG)', ratio: '17/20', rate: 85 }
    ],
    kfcFootfall: [
      { date: '09-16', count: 2 }
    ],
    escalations: []
  });

  const [principalRollups, setPrincipalRollups] = useState({
    date: '2026-10-01',
    rate: 85.0,
    submitted: 34,
    total: 40,
    pending: 6,
    cutoff: '21:00',
    flagged: false,
    mealCounts: {
      breakfast: 34,
      lunch: 34,
      snacks: 30,
      dinner: 34
    },
    pendingStudents: [
      { id: 'D201-5', initial: 'A', name: 'Ananya Gupta', email: 'ananya.gupta@kiet.edu', room: 'Room D-201 • Block D' },
      { id: 'D202-4', initial: 'S', name: 'Shivam Dixit', email: 'shivam.dixit@kiet.edu', room: 'Room D-202 • Block D' },
      { id: 'D202-5', initial: 'K', name: 'Karan Mehra', email: 'karan.mehra@kiet.edu', room: 'Room D-202 • Block D' },
      { id: 'E102-5', initial: 'A', name: 'Aditi Deshmukh', email: 'aditi.deshmukh@kiet.edu', room: 'Room E-102 • Block E' },
      { id: 'E201-5', initial: 'N', name: 'NITHIN (PG)', email: '24b21a43a1@kiet.edu', room: 'Room E-201 • Block E' },
      { id: 'E202-5', initial: 'T', name: 'Tarun Josh', email: 'tarun.josh@kiet.edu', room: 'Room E-202 • Block E' }
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
    date: '2026-10-01',
    buffers: {
      breakfast: '5 ~',
      lunch: '5 ~',
      snacks: '5 ~',
      dinner: '5 ~'
    },
    lockedHeadcount: [
      { block: 'D', students: 20, breakfast: 17, lunch: 17, snacks: 15, dinner: 17 },
      { block: 'E', students: 20, breakfast: 17, lunch: 17, snacks: 15, dinner: 17 }
    ],
    suggestedCook: [
      { meal: 'BREAKFAST', name: 'Masala Dosa & Sambar', formula: 'Portion 1 • cook ~34', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80' },
      { meal: 'BREAKFAST', name: 'Poha with Chai', formula: 'Portion 0.8 • cook ~28', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=200&auto=format&fit=crop&q=80' },
      { meal: 'DINNER', name: 'Roti, Dal, Sabzi', formula: 'Portion 1.1 • cook ~38', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&auto=format&fit=crop&q=80' },
      { meal: 'DINNER', name: 'Chicken Curry & Rice', formula: 'Portion 1.2 • cook ~40', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&auto=format&fit=crop&q=80' },
      { meal: 'LUNCH', name: 'Rajma Chawal Thali', formula: 'Portion 1.2 • cook ~40', image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=200&auto=format&fit=crop&q=80' },
      { meal: 'LUNCH', name: 'Paneer Butter Masala', formula: 'Portion 1 • cook ~34', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&auto=format&fit=crop&q=80' }
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
    { block: 'Block D (Senior Hostel)', total: 20, submitted: 17, pending: 3, rate: 85.0, status: 'Optimal', incharge: 'Prof. Sharma' },
    { block: 'Block E (International & PG)', total: 20, submitted: 17, pending: 3, rate: 85.0, status: 'Optimal', incharge: 'Dr. Mukerjee' }
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
      scope: 'Hostel Block D • Floor 2 (Room D-202)',
      desc: 'Room submission rate is 60% (3/5 students). Automated escalation to Floor Incharge triggered.',
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

  const refreshKfcOrders = async (silent = false) => {
    try {
      const res = await fetch('/api/kfc/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const activeOrders = data.orders.filter(
            (o) => o.status !== 'Archived' && !String(o.id || '').startsWith('DUMMY')
          );
          setKfcOrders(activeOrders);
          if (!silent) addToast('Queue synchronized with kitchen counter', 'success');
        }
      }
    } catch (err) {
      if (!silent) console.warn('KFC orders refresh note:', err);
    }
  };

  const refreshKfcMenu = async () => {
    try {
      const res = await fetch('/api/kfc/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.menu)) {
          setKfcMenu((prevMenu) => {
            if (JSON.stringify(prevMenu) !== JSON.stringify(data.menu)) {
              try {
                localStorage.setItem('smart_mess_kfc_menu', JSON.stringify(data.menu));
              } catch (e) {}
              return data.menu;
            }
            return prevMenu;
          });
        }
      }
    } catch (err) {}
  };

  const refreshRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms) && data.rooms.length > 0) {
          setFloorRooms((prevRooms) => {
            const merged = data.rooms.map((dbRoom) => {
              const localRoom = prevRooms.find((r) => r.roomNo === dbRoom.roomNo);
              if (localRoom && localRoom.roomNo === 'Room D-101' && localRoom.submitted !== undefined) {
                return { ...dbRoom, submitted: localRoom.submitted, pending: localRoom.pending, rate: localRoom.rate };
              }
              if (localRoom && localRoom.submitted > dbRoom.submitted) {
                return localRoom;
              }
              return {
                ...dbRoom,
                flagged: localRoom ? localRoom.flagged : dbRoom.flagged
              };
            });
            try {
              localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }
    } catch (err) {}
  };

  const reseedDatabase = async () => {
    try {
      const res = await fetch('/api/seeder/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        addToast('MongoDB database reseeded successfully with Block D & E dummy data!', 'success');
        refreshRooms();
        refreshUsers();
        refreshKfcOrders();
        refreshKfcMenu();
        refreshMessMenu();
        return data;
      }
    } catch (err) {
      addToast('Error reseeding database: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    refreshRooms();
    refreshKfcOrders(true);
    refreshKfcMenu();
    refreshMessMenu();
    refreshUsers();
    const interval = setInterval(() => {
      refreshRooms();
      refreshKfcOrders(true);
      refreshKfcMenu();
      refreshMessMenu();
      refreshUsers();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const placeKfcOrder = async (items, totalAmount) => {
    const studentName = currentUser?.name || 'Aarav Sharma';
    const room = (currentUser?.badge ? currentUser.badge.split('•')[0].trim() : 'Room D-101') || 'Room D-101';
    const roomDigits = room.replace(/\D/g, '') || '101';
    const randNum = Math.floor(10 + Math.random() * 90);
    const token = `KFC-D${roomDigits}-${randNum}`;
    const newOrderData = {
      token,
      studentName,
      room,
      items,
      totalAmount,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending'
    };

    const tempId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const optimisticOrder = { id: tempId, ...newOrderData };
    setKfcOrders((prev) => [optimisticOrder, ...prev.filter((o) => o.id !== tempId)]);

    try {
      localStorage.setItem('smart_mess_active_kfc_token', token);
    } catch (e) {
      console.warn(e);
    }

    addToast(`KFC Order Placed! Token: ${token}`, 'success');

    // Deduct stock for ordered items in real time and broadcast across tabs
    setKfcMenu((prev) => {
      const updated = prev.map((menuItem) => {
        const ordered = items.find((i) => i.name === menuItem.name);
        if (!ordered) return menuItem;
        const currentStock = menuItem.stock !== undefined ? menuItem.stock : 20;
        const newStock = Math.max(0, currentStock - (ordered.qty || 1));
        return {
          ...menuItem,
          stock: newStock,
          isAvailable: newStock > 0
        };
      });
      broadcastKfcMenu(updated);
      fetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });

    try {
      const res = await fetch('/api/kfc/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setKfcOrders((prev) => [data.order, ...prev.filter((o) => o.id !== tempId && o.id !== data.order.id)]);
          return data.order;
        }
      }
    } catch (err) {
      console.warn('Backend order persistence note:', err);
    }

    return optimisticOrder;
  };

  const broadcastKfcOrderStatus = (orderId, status) => {
    if (kfcBcRef.current) {
      try {
        kfcBcRef.current.postMessage({
          type: 'KFC_ORDER_STATUS_SYNC',
          orderId,
          status
        });
      } catch (e) {}
    }
  };

  const updateKfcOrderStatus = async (orderId, newStatus) => {
    setKfcOrders((prev) =>
      prev.map((ord) => (ord.id === orderId || ord.token === orderId ? { ...ord, status: newStatus } : ord))
    );
    broadcastKfcOrderStatus(orderId, newStatus);
    addToast(`Order ${orderId} updated to ${newStatus}`, 'info');

    try {
      await fetch(`/api/kfc/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Status update backend note:', err);
    }
  };

  const advanceKfcOrderStatus = async (orderId) => {
    let nextStatus = null;
    let targetToken = orderId;
    setKfcOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId && ord.token !== orderId) return ord;
        targetToken = ord.token;
        if (ord.status === 'Pending') nextStatus = 'Preparing';
        else if (ord.status === 'Preparing') nextStatus = 'Ready';
        else if (ord.status === 'Ready') nextStatus = 'Collected';
        else return ord;
        return { ...ord, status: nextStatus };
      })
    );

    if (nextStatus) {
      broadcastKfcOrderStatus(orderId, nextStatus);
      broadcastKfcOrderStatus(targetToken, nextStatus);
      addToast(`Order ${targetToken} status updated to ${nextStatus}`, 'success');
      try {
        await fetch(`/api/kfc/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
      } catch (err) {
        console.warn('Status advance backend note:', err);
      }
    }
  };

  const toggleKfcItemAvailability = (itemId) => {
    setKfcMenu((prev) => {
      const updated = prev.map((item) => {
        if (String(item.id) !== String(itemId)) return item;
        const newStatus = !item.isAvailable;
        const currentStock = item.stock !== undefined ? item.stock : 20;
        const newStock = newStatus ? (currentStock > 0 ? currentStock : 20) : 0;
        addToast(`${item.name} marked as ${newStatus ? 'In Stock' : 'Sold Out'}`, newStatus ? 'success' : 'warning');
        return { ...item, isAvailable: newStatus, stock: newStock };
      });
      broadcastKfcMenu(updated);
      fetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });
  };

  const updateKfcItemStock = (itemId, delta) => {
    setKfcMenu((prev) => {
      const updated = prev.map((item) => {
        if (String(item.id) !== String(itemId)) return item;
        const currentStock = item.stock !== undefined ? item.stock : 20;
        const newStock = Math.max(0, currentStock + delta);
        const newAvailable = newStock > 0;
        addToast(`${item.name} stock: ${newStock}`, 'info');
        return { ...item, stock: newStock, isAvailable: newAvailable };
      });
      broadcastKfcMenu(updated);
      fetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });
  };

  const addKfcMenuItem = async (newItem) => {
    const item = {
      id: Date.now(),
      name: newItem.name.trim(),
      price: Number(newItem.price),
      category: newItem.category || 'Snacks',
      image: newItem.image || '🍗',
      imageUrl: newItem.imageUrl || '',
      stock: Number(newItem.stock) || 20,
      isAvailable: (Number(newItem.stock) || 20) > 0
    };
    setKfcMenu((prev) => {
      const updated = [...prev, item];
      broadcastKfcMenu(updated);
      return updated;
    });
    addToast(`${item.name} added to KFC Menu!`, 'success');

    try {
      await fetch('/api/kfc/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    } catch (err) {
      console.warn('Backend item add note:', err);
    }
    return item;
  };

  const removeKfcMenuItem = async (itemId) => {
    const itemToRemove = kfcMenu.find((i) => String(i.id) === String(itemId));
    const updated = kfcMenu.filter((item) => String(item.id) !== String(itemId));
    setKfcMenu(updated);
    broadcastKfcMenu(updated);
    addToast(`${itemToRemove ? itemToRemove.name : 'Item'} removed from menu`, 'info');

    try {
      await fetch(`/api/kfc/menu/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend item delete note:', err);
    }
  };

  const setKfcItemStockDirect = (itemId, newStock) => {
    const val = Math.max(0, parseInt(newStock) || 0);
    setKfcMenu((prev) => {
      const updated = prev.map((item) => {
        if (String(item.id) !== String(itemId)) return item;
        return { ...item, stock: val, isAvailable: val > 0 };
      });
      broadcastKfcMenu(updated);
      fetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });
  };

  const restockAllKfcItems = (amount = 20) => {
    setKfcMenu((prev) => {
      const updated = prev.map((item) => ({
        ...item,
        stock: Math.max(item.stock || 0, amount),
        isAvailable: true
      }));
      broadcastKfcMenu(updated);
      fetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });
    addToast(`All menu items replenished with +${amount} inventory!`, 'success');
  };

  const clearAllKfcOrders = async () => {
    setKfcOrders([]);
    try {
      localStorage.removeItem('smart_mess_active_kfc_token');
      sessionStorage.removeItem('smart_mess_placed_kfc_token');
      await fetch('/api/kfc/orders', { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
    addToast('Shift sales register cleared. Cash drawer reset to ₹0.', 'info');
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
    addToast('Reminders sent to all pending students in Room D-101!', 'info');
  };

  const updateRoomMemberMeal = (memberId, choices, status = 'Submitted', note = '') => {
    let updatedMembers = [];
    let updatedRooms = [];
    let updatedMealReqs = null;

    setRoomMembers((prev) => {
      updatedMembers = prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            choices: { ...m.choices, ...choices },
            note: note || m.note || '',
            editedByLead: true,
            leadEditTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return m;
      });

      try {
        localStorage.setItem(ROOM_MEMBERS_STORAGE_KEY, JSON.stringify(updatedMembers));
      } catch (e) {}

      const submittedCount = updatedMembers.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;

      setFloorRooms((fPrev) => {
        updatedRooms = fPrev.map((r) => {
          if (r.roomNo === 'Room D-101') {
            return {
              ...r,
              submitted: submittedCount,
              pending: Math.max(0, updatedMembers.length - submittedCount),
              rate: Math.round((submittedCount / updatedMembers.length) * 100),
            };
          }
          return r;
        });

        try {
          localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
        } catch (e) {}

        updatedMealReqs = calculateFloorMealReqs(updatedMembers);
        setFloorMealRequirements(updatedMealReqs);
        try {
          localStorage.setItem(FLOOR_MEAL_REQS_STORAGE_KEY, JSON.stringify(updatedMealReqs));
        } catch (e) {}

        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: 'ROOM_MEMBER_MEAL_UPDATED',
              roomNo: 'Room D-101',
              roomMembers: updatedMembers,
              floorRooms: updatedRooms,
              floorMealRequirements: updatedMealReqs
            });
          } catch (e) {}
        }

        return updatedRooms;
      });

      return updatedMembers;
    });

    addToast('Roommate meal preferences recorded and updated in Floor Monitoring!', 'success');
  };

  const markMemberOnLeave = (memberId) => {
    let updatedMembers = [];
    let updatedRooms = [];
    let updatedMealReqs = null;

    setRoomMembers((prev) => {
      updatedMembers = prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            status: 'On Leave',
            time: 'Marked on Leave',
            choices: { b: 'No', l: 'No', s: 'No', d: 'No' },
            note: 'On official leave / Home visit',
          };
        }
        return m;
      });

      try {
        localStorage.setItem(ROOM_MEMBERS_STORAGE_KEY, JSON.stringify(updatedMembers));
      } catch (e) {}

      const submittedCount = updatedMembers.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;

      setFloorRooms((fPrev) => {
        updatedRooms = fPrev.map((r) => {
          if (r.roomNo === 'Room D-101') {
            return {
              ...r,
              submitted: submittedCount,
              pending: Math.max(0, updatedMembers.length - submittedCount),
              rate: Math.round((submittedCount / updatedMembers.length) * 100),
            };
          }
          return r;
        });

        try {
          localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
        } catch (e) {}

        updatedMealReqs = calculateFloorMealReqs(updatedMembers);
        setFloorMealRequirements(updatedMealReqs);
        try {
          localStorage.setItem(FLOOR_MEAL_REQS_STORAGE_KEY, JSON.stringify(updatedMealReqs));
        } catch (e) {}

        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: 'ROOM_MEMBER_MEAL_UPDATED',
              roomNo: 'Room D-101',
              roomMembers: updatedMembers,
              floorRooms: updatedRooms,
              floorMealRequirements: updatedMealReqs
            });
          } catch (e) {}
        }

        return updatedRooms;
      });

      return updatedMembers;
    });

    addToast('Roommate marked on leave (meals excluded from Floor Monitoring).', 'info');
  };

  // -------------------------------------------------------------
  // CROSS-TAB SYNCHRONIZATION (BroadcastChannel + LocalStorage)
  // Enables real-time notifications between Floor Incharge & Room Lead across multiple browser tabs
  // -------------------------------------------------------------
  const broadcastChannelRef = useRef(null);

  // Gentle audio chime for incoming notifications
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio not permitted or user hasn't interacted with tab yet
    }
  };

  useEffect(() => {
    let channel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('smart_mess_tab_sync');
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const data = event.data;
          if (!data || !data.type) return;

          if (data.type === 'SYNC_ROOM_LEAD_NOTIFICATIONS') {
            if (Array.isArray(data.notifications)) {
              setRoomLeadNotifications(data.notifications);
            }
            if (data.newNotification) {
              playNotificationChime();
              addToast(`🔔 ${data.newNotification.sender}: ${data.newNotification.title} (${data.newNotification.roomNo})`, 'info');
            }
          } else if (data.type === 'ROOM_ROSTER_SUBMITTED') {
            // Floor Incharge receives signed off room roster in real-time
            setFloorRooms((prev) =>
              prev.map((r) =>
                r.roomNo === (data.roomNo || 'Room D-101')
                  ? { ...r, submitted: r.members, pending: 0, rate: 100, status: 'High' }
                  : r
              )
            );
            playNotificationChime();
            addToast(`📋 Meal verification roster signed off & received from ${data.leadName || 'Room Lead'} (${data.roomNo || 'Room D-101'})!`, 'success');
          } else if (data.type === 'ROOM_LEAD_NOTIFICATION_READ') {
            if (Array.isArray(data.notifications)) {
              setRoomLeadNotifications(data.notifications);
            }
          } else if (data.type === 'ROOM_LEAD_NOTIFICATIONS_CLEARED') {
            setRoomLeadNotifications([]);
          } else if (data.type === 'BLOCK_CONSOLIDATED_COUNT_SENT') {
            setBlockConsolidatedSent(true);
            playNotificationChime();
            addToast('📋 Kitchen Alert: Block Coordinator forwarded finalized Block D & E headcounts to Mess Kitchen!', 'success');
          } else if (data.type === 'ROOM_FLAG_SYNC') {
            setFloorRooms((prev) =>
              prev.map((r) => (r.roomNo === data.roomNo ? { ...r, flagged: data.flagged } : r))
            );
          } else if (data.type === 'FLOOR_INCHARGE_NUDGED') {
            if (data.alert) {
              setFloorInchargeAlerts((prev) => [data.alert, ...prev.filter((a) => a.id !== data.alert.id)]);
              playNotificationChime();
              addToast(`⚠️ Urgent Alert from Block Coordinator: ${data.alert.message}`, 'warning');
            }
          } else if (data.type === 'FLOOR_MEAL_SHEET_SENT') {
            if (data.sheet) {
              setFloorMealSheets((prev) => [data.sheet, ...prev.filter((s) => s.floor !== data.sheet.floor)]);
              playNotificationChime();
              addToast(`📋 Kitchen Alert: ${data.sheet.incharge} transmitted meal headcount sheet for ${data.sheet.floor}!`, 'info');
            }
          } else if (data.type === 'FLOOR_MEAL_SHEET_CONFIRMED') {
            setFloorMealSheets((prev) =>
              prev.map((s) => (s.id === data.sheetId ? { ...s, status: 'Confirmed by Kitchen' } : s))
            );
            playNotificationChime();
            addToast(`🍳 Mess Kitchen confirmed meal sheet for ${data.floor || 'your floor'}! Preparation underway.`, 'success');
          } else if (data.type === 'ROOM_MEMBER_MEAL_UPDATED') {
            if (Array.isArray(data.roomMembers)) {
              setRoomMembers(data.roomMembers);
            }
            if (Array.isArray(data.floorRooms)) {
              setFloorRooms(data.floorRooms);
            }
            if (data.floorMealRequirements) {
              setFloorMealRequirements(data.floorMealRequirements);
            }
            playNotificationChime();
            addToast(`Live Update: Room ${data.roomNo || 'D-101'} meal requirements updated by Room Lead!`, 'info');
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err);
      }
    }

    // Backup cross-tab listener using storage events (fires across separate tabs)
    const handleStorageEvent = (e) => {
      if (e.key === NOTIFICATIONS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRoomLeadNotifications(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage notification update', err);
        }
      } else if (e.key === FLOOR_ROOMS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setFloorRooms(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage floor rooms update', err);
        }
      } else if (e.key === ROOM_MEMBERS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRoomMembers(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage room members update', err);
        }
      } else if (e.key === FLOOR_MEAL_REQS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.breakfast) {
            setFloorMealRequirements(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage floor meal reqs update', err);
        }
      } else if (e.key === FLOOR_ALERTS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setFloorInchargeAlerts(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage floor alerts update', err);
        }
      } else if (e.key === FLOOR_MEAL_SHEETS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setFloorMealSheets(parsed);
          }
        } catch (err) {
          console.error('Failed parsing storage floor meal sheets update', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Helper to persist and broadcast notification changes to all open tabs
  const broadcastNotificationsUpdate = (updatedList, newNotification = null) => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not save notifications to localStorage', e);
    }

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'SYNC_ROOM_LEAD_NOTIFICATIONS',
          notifications: updatedList,
          newNotification: newNotification
        });
      } catch (e) {
        console.warn('Failed broadcasting notification event', e);
      }
    }
  };

  // Room Lead signs off and submits room verification to Floor Incharge
  const submitRoomRosterToFloorIncharge = () => {
    let updatedRooms = [];
    setFloorRooms((prev) => {
      updatedRooms = prev.map((r) =>
        r.roomNo === 'Room D-101'
          ? { ...r, submitted: 5, pending: 0, rate: 100, status: 'High' }
          : r
      );
      try {
        localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
      } catch (e) {}
      return updatedRooms;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'ROOM_ROSTER_SUBMITTED',
          roomNo: 'Room D-101',
          leadName: 'Alex Rivers',
          updatedRooms: updatedRooms
        });
      } catch (e) {}
    }
    addToast('Room D-101 Meal Verification signed off & submitted to Floor Incharge!', 'success');
  };

  // Reminds Room Lead from Floor Incharge dashboard and saves real notification for Room Lead (Dispatches across tabs)
  const remindRoomLead = (roomNo, leadName) => {
    const newNotif = {
      id: Date.now(),
      title: `Urgent Reminder from Floor Incharge`,
      message: `Floor Incharge (Prof. Sharma) has requested meal submission verification for ${roomNo}. Please ensure all roommates have finalized breakfast, lunch, snacks, and dinner before the 10:00 PM cutoff.`,
      sender: 'Prof. Sharma (Floor Incharge)',
      roomNo: roomNo,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'urgent'
    };

    setRoomLeadNotifications((prev) => {
      const updated = [newNotif, ...prev];
      broadcastNotificationsUpdate(updated, newNotif);
      return updated;
    });

    addToast(`Reminder notification dispatched to Room Lead (${leadName} - ${roomNo})!`, 'info');
  };

  // Marks a single room lead notification as read (Syncs across tabs)
  const markRoomLeadNotificationRead = (notifId) => {
    setRoomLeadNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notifId ? { ...n, read: true } : n));
      broadcastNotificationsUpdate(updated);
      return updated;
    });
  };

  // Marks all room lead notifications as read (Syncs across tabs)
  const markAllRoomLeadNotificationsRead = () => {
    setRoomLeadNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      broadcastNotificationsUpdate(updated);
      return updated;
    });
    addToast('All notifications marked as read', 'info');
  };

  // Clears all room lead notifications (Syncs across tabs)
  const clearRoomLeadNotifications = () => {
    const updated = [];
    setRoomLeadNotifications(updated);
    broadcastNotificationsUpdate(updated);
    addToast('Notification inbox cleared', 'info');
  };

  const flagRoom = (roomNo) => {
    let newFlagged = false;
    let updatedRooms = [];
    setFloorRooms((prev) => {
      updatedRooms = prev.map((r) => {
        if (r.roomNo === roomNo) {
          newFlagged = !r.flagged;
          return { ...r, flagged: newFlagged };
        }
        return r;
      });
      try {
        localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(updatedRooms));
      } catch (e) {}
      return updatedRooms;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'ROOM_FLAG_SYNC',
          roomNo,
          flagged: newFlagged
        });
      } catch (e) {}
    }
    addToast(`Room ${roomNo} status updated.`, 'warning');
  };

  const sendBlockConsolidatedCount = () => {
    setBlockConsolidatedSent(true);
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'BLOCK_CONSOLIDATED_COUNT_SENT',
          timestamp: Date.now()
        });
      } catch (e) {}
    }
    addToast('Block-wise meal count sent successfully to Mess Incharge!', 'success');
  };

  // Block Coordinator directly nudges a Floor Incharge whose floor has pending meal submissions
  const nudgeFloorIncharge = (floorName, pendingCount) => {
    const newAlert = {
      id: Date.now(),
      sender: 'Nithin (Block Coordinator)',
      floor: floorName,
      message: `Cutoff compliance alert: ${floorName} has ${pendingCount} pending meal submission(s). Please follow up with your Room Leads before 10:00 PM cutoff.`,
      pendingCount: pendingCount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    setFloorInchargeAlerts((prev) => {
      const updated = [newAlert, ...prev.filter((a) => a.floor !== floorName)];
      try {
        localStorage.setItem(FLOOR_ALERTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'FLOOR_INCHARGE_NUDGED',
          alert: newAlert
        });
      } catch (e) {}
    }

    addToast(`Urgent Nudge dispatched to Floor Incharge for ${floorName}!`, 'info');
  };

  // Floor Incharge acknowledges / dismisses the alert from Block Coordinator
  const dismissFloorAlert = (alertId) => {
    setFloorInchargeAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== alertId);
      try {
        localStorage.setItem(FLOOR_ALERTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addToast('Block Coordinator alert acknowledged and cleared', 'info');
  };

  // Floor Incharge transmits floor meal requirements sheet directly to Mess Kitchen
  const sendFloorMealSheetToMess = (floorName = 'Floor 1 (Block D)', reqs = floorMealRequirements) => {
    const newSheet = {
      id: Date.now(),
      floor: floorName,
      incharge: currentUser?.name || 'Prof. Sharma (Floor Incharge)',
      requirements: {
        breakfast: reqs?.breakfast?.selected ?? 10,
        lunch: reqs?.lunch?.selected ?? 10,
        snacks: reqs?.snacks?.selected ?? 8,
        dinner: reqs?.dinner?.selected ?? 10
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending Verification'
    };

    setFloorMealSheets((prev) => {
      const updated = [newSheet, ...prev.filter((s) => s.floor !== floorName)];
      try {
        localStorage.setItem(FLOOR_MEAL_SHEETS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'FLOOR_MEAL_SHEET_SENT',
          sheet: newSheet
        });
      } catch (e) {}
    }

    addToast(`Meal Requirement Sheet for ${floorName} sent to Mess Kitchen!`, 'success');
  };

  // Mess Incharge confirms / acknowledges the floor meal sheet
  const confirmFloorMealSheetInKitchen = (sheetId) => {
    let targetFloor = '';
    setFloorMealSheets((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sheetId) {
          targetFloor = s.floor;
          return { ...s, status: 'Confirmed by Kitchen' };
        }
        return s;
      });
      try {
        localStorage.setItem(FLOOR_MEAL_SHEETS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'FLOOR_MEAL_SHEET_CONFIRMED',
          sheetId,
          floor: targetFloor
        });
      } catch (e) {}
    }

    addToast(`Floor meal sheet for ${targetFloor || 'Floor'} confirmed for kitchen preparation!`, 'success');
  };

  const login = (identifier, password = '') => {
    const cleanId = (identifier || '').trim();
    const lowerId = cleanId.toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId) {
      addToast('Please enter your Roll Number or Campus Email', 'error');
      return null;
    }

    // 1. Check if identifier is student Roll Number or Student Email
    const matchedStudent = STUDENT_ROSTER.find(
      (s) => s.rollNo.toLowerCase() === lowerId || s.email.toLowerCase() === lowerId
    );

    if (matchedStudent) {
      // Password must be roll number (case-insensitive)
      if (cleanPass.toLowerCase() !== matchedStudent.rollNo.toLowerCase()) {
        addToast('Invalid password! For students, password is your Roll Number.', 'error');
        return null;
      }

      const sessionUser = {
        id: `USR-${matchedStudent.rollNo}`,
        name: matchedStudent.name,
        rollNo: matchedStudent.rollNo,
        email: matchedStudent.email,
        role: 'Student',
        path: '/student',
        badge: `${matchedStudent.rollNo} • ${matchedStudent.room}`,
        status: 'Active',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentUser(sessionUser);
      try {
        localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
      } catch (e) {}

      addToast(`Welcome, ${sessionUser.name}! Signed in as Student.`, 'success');
      return sessionUser;
    }

    // 2. Check Staff & Admin accounts (nithin.<role>@gmail.com, admin@gmail.com)
    let matchedStaff = STAFF_ACCOUNTS.find((st) => st.email.toLowerCase() === lowerId);

    // Support admin aliases
    if (!matchedStaff && (lowerId === 'admin' || lowerId === 'admin@gmail.com' || lowerId === 'karthiksuru06@gmail.com')) {
      matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Admin');
    }

    // Support shorthand like "nithin.kfcstaff" or "nithin.kfc"
    if (!matchedStaff) {
      matchedStaff = STAFF_ACCOUNTS.find((st) => st.email.split('@')[0].toLowerCase() === lowerId);
    }

    // Support role-based matches if user enters "kfcstaff", "principal", "mess", "floor", "roomlead", "block"
    if (!matchedStaff) {
      if (lowerId.includes('kfc')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'KFC Staff');
      else if (lowerId.includes('room')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Room Lead');
      else if (lowerId.includes('floor')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Floor Incharge');
      else if (lowerId.includes('block')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Block Coordinator');
      else if (lowerId.includes('mess')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Mess Incharge');
      else if (lowerId.includes('principal')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Principal');
      else if (lowerId.includes('admin')) matchedStaff = STAFF_ACCOUNTS.find((st) => st.role === 'Admin');
    }

    // 3. Also check dynamic users in state (in case admin created a new user)
    if (!matchedStaff) {
      const dynamicUser = users.find(
        (u) => (u.email && u.email.toLowerCase() === lowerId) ||
               (u.rollNo && u.rollNo.toLowerCase() === lowerId) ||
               (u.id && u.id.toLowerCase() === lowerId)
      );
      if (dynamicUser) {
        matchedStaff = dynamicUser;
      }
    }

    if (matchedStaff) {
      if (matchedStaff.status === 'Suspended') {
        addToast('This account has been suspended by the campus administrator.', 'error');
        return null;
      }

      // If user is a student in dynamic users
      if (matchedStaff.role === 'Student' && matchedStaff.rollNo) {
        if (cleanPass.toLowerCase() !== matchedStaff.rollNo.toLowerCase()) {
          addToast('Invalid password! Password is your Roll Number.', 'error');
          return null;
        }
      } else {
        // Staff and Admin password must be 123456789
        if (cleanPass !== '123456789') {
          addToast('Invalid password! Password is 123456789.', 'error');
          return null;
        }
      }

      const sessionUser = {
        ...matchedStaff,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCurrentUser(sessionUser);
      try {
        localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
      } catch (e) {}

      addToast(`Signed in as ${sessionUser.name} (${sessionUser.role})`, 'success');
      return sessionUser;
    }

    addToast('Account not found! Enter a valid Roll Number (e.g. 23B21A4225) or staff email.', 'error');
    return null;
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
        updateKfcItemStock,
        setKfcItemStockDirect,
        restockAllKfcItems,
        addKfcMenuItem,
        removeKfcMenuItem,
        kfcOrders,
        placeKfcOrder,
        updateKfcOrderStatus,
        advanceKfcOrderStatus,
        refreshKfcOrders,
        clearAllKfcOrders,
        roomMembers,
        roomLeadNotifications,
        markRoomLeadNotificationRead,
        markAllRoomLeadNotificationsRead,
        clearRoomLeadNotifications,
        updateRoomMemberMeal,
        markMemberOnLeave,
        submitRoomRosterToFloorIncharge,
        remindStudent,
        remindAllPendingInRoom,
        floorRooms,
        refreshRooms,
        reseedDatabase,
        floorMealRequirements,
        floorAttendance,
        updateStudentAttendance,
        submitRoomAttendance,
        remindRoomLead,
        flagRoom,
        blockData,
        blockConsolidatedSent,
        sendBlockConsolidatedCount,
        nudgeFloorIncharge,
        floorInchargeAlerts,
        dismissFloorAlert,
        floorMealSheets,
        sendFloorMealSheetToMess,
        confirmFloorMealSheetInKitchen,
        menu,
        updateMenu,
        removeMessDish,
        addMessDish,
        refreshMessMenu,
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
        resolveAnomaly,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        loginAsUser,
        refreshUsers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
