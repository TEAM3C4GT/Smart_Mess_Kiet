import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const STUDENT_ROSTER = [];
export const STAFF_ACCOUNTS = [];
export const DEFAULT_CAMPUS_USERS = [];
export const DEMO_USERS = [];

export const DEFAULT_MESS_MENU = {
  date: 'Today',
  breakfast: 'Loading daily menu...',
  lunch: 'Loading daily menu...',
  snacks: 'Loading daily menu...',
  dinner: 'Loading daily menu...'
};

export const DEFAULT_HEADCOUNT = [];

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

export const getAuthToken = () => {
  try {
    const sessionToken = sessionStorage.getItem('smart_mess_token');
    const savedUserStr = sessionStorage.getItem('smart_mess_current_user') || localStorage.getItem('smart_mess_current_user');
    let userRole = null;
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        userRole = u?.role;
      } catch (e) {}
    }

    if (userRole) {
      const roleSessionToken = sessionStorage.getItem(`smart_mess_token_${userRole}`);
      if (roleSessionToken) return roleSessionToken;
      const roleLocalToken = localStorage.getItem(`smart_mess_token_${userRole}`);
      if (roleLocalToken) return roleLocalToken;
    }

    if (sessionToken) return sessionToken;
    return localStorage.getItem('smart_mess_token') || '';
  } catch (e) {
    return '';
  }
};

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(apiUrl(url), {
    ...options,
    headers
  });
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
      const saved = sessionStorage.getItem('smart_mess_current_user') || localStorage.getItem('smart_mess_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
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
      const saved = localStorage.getItem('smart_mess_users_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const broadcastUsers = (newUsers) => {
    try {
      localStorage.setItem('smart_mess_users_v5', JSON.stringify(newUsers));
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
      await authFetch('/api/users', {
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
      await authFetch(`/api/users/${userId}`, {
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
      await authFetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  const toggleUserStatus = async (userId) => {
    let nextStatus = null;
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        nextStatus = newStatus;
        addToast(`${u.name} marked as ${newStatus}`, newStatus === 'Active' ? 'success' : 'warning');
        return { ...u, status: newStatus };
      });
      broadcastUsers(updated);
      return updated;
    });
    try {
      if (nextStatus) {
        await authFetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
      }
    } catch (e) {}
  };

  const loginAsUser = async (targetUser) => {
    const sessionUser = {
      ...targetUser,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCurrentUser(sessionUser);
    try {
      sessionStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
    localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
    } catch (e) {}

    try {
      const res = await fetch(apiUrl('/api/auth/switch-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetUser.id || targetUser._id,
          email: targetUser.email,
          role: targetUser.role,
          rollNo: targetUser.rollNo,
          name: targetUser.name
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem('smart_mess_token', data.token);
          sessionStorage.setItem(`smart_mess_token_${sessionUser.role}`, data.token);
          localStorage.setItem(`smart_mess_token_${sessionUser.role}`, data.token);
          localStorage.setItem('smart_mess_token', data.token);
        }
      }
    } catch (err) {
      console.warn('Switch token error:', err);
    }

    addToast(`Switched portal session to ${sessionUser.name} (${sessionUser.role})`, 'success');
    return sessionUser;
  };

  const refreshUsers = async () => {
    try {
      const res = await authFetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(data.users)) {
              try {
                localStorage.setItem('smart_mess_users_v5', JSON.stringify(data.users));
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

    // Two-Way Sync: Update Room Lead room member choices
    const charKey = mealKey.charAt(0).toLowerCase();
    setRoomMembers((prev) => {
      let found = false;
      const updated = prev.map((m) => {
        const isMatch = m.name.toLowerCase().includes(studentName.toLowerCase()) ||
          (studentName === 'Aarav Sharma' && m.id === 4) ||
          (currentUser?.rollNo && currentUser.rollNo.includes('24b21a43a1') && m.name.toLowerCase().includes('nithin'));
        if (isMatch && !found) {
          found = true;
          return {
            ...m,
            choices: { ...m.choices, [charKey]: newStatus ? 'Yes' : 'No' },
            status: 'Submitted',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return m;
      });

      if (found) {
        try {
          localStorage.setItem(ROOM_MEMBERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        const newReqs = calculateFloorMealReqs(updated);
        setFloorMealRequirements(newReqs);
        try {
          localStorage.setItem(FLOOR_MEAL_REQS_STORAGE_KEY, JSON.stringify(newReqs));
        } catch (e) {}
        const submittedCount = updated.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;
        const totalCount = updated.length;
        const newRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;
        setFloorRooms((prevRooms) => {
          const nextRooms = prevRooms.map((r) => {
            if (r.roomNo === 'Room D-101') {
              return {
                ...r,
                submitted: submittedCount,
                pending: Math.max(0, totalCount - submittedCount),
                rate: newRate,
                status: newRate >= 80 ? 'High' : newRate >= 60 ? 'Good' : 'Medium'
              };
            }
            return r;
          });
          try {
            localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(nextRooms));
          } catch (e) {}
          return nextRooms;
        });
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: 'ROOM_MEMBER_MEAL_UPDATED',
              roomNo: 'Room D-101',
              roomMembers: updated,
              floorMealRequirements: newReqs
            });
          } catch (e) {}
        }
      }
      return updated;
    });

    broadcastMessSync('HEADCOUNT_SYNC', {
      headcount: updatedHeadcount,
      mealKey,
      status: newStatus,
      studentName
    });

    authFetch('/api/selections', {
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

  const confirmStudentMealSelection = (customDietaryNote = '') => {
    const studentName = currentUser?.name || 'NITHIN';
    const rollNo = currentUser?.rollNo || '24B21A43A1';
    const room = (currentUser?.badge ? currentUser.badge.split('•')[0].trim() : 'Room D-101') || 'Room D-101';
    const note = (customDietaryNote && customDietaryNote.trim()) ? customDietaryNote.trim() : 'Standard Student Dining';

    addToast('Meal selection confirmed for tomorrow!', 'success');

    // Two-Way Sync: Update Room Lead room member choices
    setRoomMembers((prev) => {
      let found = false;
      const updated = prev.map((m) => {
        const isMatch = m.name.toLowerCase().includes(studentName.toLowerCase()) ||
          (studentName === 'Aarav Sharma' && m.id === 4) ||
          (currentUser?.rollNo && currentUser.rollNo.includes('24b21a43a1') && m.name.toLowerCase().includes('nithin'));
        if (isMatch && !found) {
          found = true;
          return {
            ...m,
            status: 'Submitted',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return m;
      });

      if (found) {
        try {
          localStorage.setItem(ROOM_MEMBERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        const newReqs = calculateFloorMealReqs(updated);
        setFloorMealRequirements(newReqs);
        try {
          localStorage.setItem(FLOOR_MEAL_REQS_STORAGE_KEY, JSON.stringify(newReqs));
        } catch (e) {}
        const submittedCount = updated.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;
        const totalCount = updated.length;
        const newRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;
        setFloorRooms((prevRooms) => {
          const nextRooms = prevRooms.map((r) => {
            if (r.roomNo === 'Room D-101') {
              return {
                ...r,
                submitted: submittedCount,
                pending: Math.max(0, totalCount - submittedCount),
                rate: newRate,
                status: newRate >= 80 ? 'High' : newRate >= 60 ? 'Good' : 'Medium'
              };
            }
            return r;
          });
          try {
            localStorage.setItem(FLOOR_ROOMS_STORAGE_KEY, JSON.stringify(nextRooms));
          } catch (e) {}
          return nextRooms;
        });
        if (broadcastChannelRef.current) {
          try {
            broadcastChannelRef.current.postMessage({
              type: 'ROOM_MEMBER_MEAL_UPDATED',
              roomNo: 'Room D-101',
              roomMembers: updated,
              floorMealRequirements: newReqs
            });
          } catch (e) {}
        }
      }
      return updated;
    });

    // 2. Add / Update in studentDiningRequests for Mess Incharge
    const newRequest = {
      id: `REQ-${Date.now()}`,
      studentName,
      rollNo,
      roomNo: room,
      block: room.includes('D-') ? 'Block D' : 'Block E',
      meals: { ...studentMealPlan.selections },
      dietaryNote: note,
      status: 'Confirmed',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false
    };

    setStudentDiningRequests((prev) => {
      const filtered = prev.filter((r) => r.rollNo !== rollNo && r.studentName.toLowerCase() !== studentName.toLowerCase());
      const updated = [newRequest, ...filtered];
      try {
        localStorage.setItem('smart_mess_student_dining_requests_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'STUDENT_DINING_REQUEST_UPDATED',
          request: newRequest
        });
      } catch (e) {}
    }

    // 3. Notify student themselves
    const confirmedMealsStr = Object.entries(studentMealPlan.selections)
      .filter(([, v]) => v)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(', ');

    const selfNotif = {
      id: Date.now(),
      title: '✓ Meal Selections Confirmed for Tomorrow',
      message: `Your meal choices (${confirmedMealsStr || 'None selected'}) with dietary note: "${note}" were submitted to Chef Ramesh in the Main Kitchen.`,
      sender: 'Smart Mess System',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'mess'
    };
    addStudentNotification(selfNotif);

    broadcastMessSync('STUDENT_MEAL_CONFIRM', {
      studentName,
      selections: studentMealPlan.selections,
      dietaryNote: note
    });
    authFetch('/api/selections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        confirmed: true,
        selections: studentMealPlan.selections,
        dietaryNote: note,
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

    const menuNotif = {
      id: Date.now(),
      title: "👨‍🍳 Tomorrow's Mess Menu Published",
      message: `Chef Ramesh published tomorrow's menu: ${Object.values(newMenu).filter(Boolean).join(' • ')}. Confirm meal choices before 10:00 PM cutoff.`,
      sender: 'Chef Ramesh (Mess Incharge)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'mess'
    };
    addStudentNotification(menuNotif);

    authFetch('/api/menu', {
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

    authFetch('/api/menu', {
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

    authFetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMenu)
    }).catch(() => {});

    addToast(`"${cleanName}" added to ${mealKey} menu!`, 'success');
  };

  const updateMessDishImage = (mealKey, dishName, image) => {
    const meal = studentMealPlan.meals?.[mealKey];
    if (!meal) return;

    const items = meal.items.map((i) =>
      i.name.toLowerCase() === dishName.toLowerCase() ? { ...i, image } : i
    );
    const updatedMeals = { ...studentMealPlan.meals, [mealKey]: { ...meal, items } };
    const updatedPlan = { ...studentMealPlan, meals: updatedMeals };

    setStudentMealPlan(updatedPlan);
    try {
      localStorage.setItem('smart_mess_student_meal_plan', JSON.stringify(updatedPlan));
    } catch (e) {}

    broadcastMessSync('MESS_MENU_SYNC', { menu, meals: updatedMeals });
    addToast(`Updated image for "${dishName}"`, 'success');
  };

  const refreshMessMenu = async () => {
    try {
      const res = await authFetch('/api/menu');
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

  // Student Meal History
  const [mealHistory, setMealHistory] = useState([]);

  // Student Notifications / Inbox (Persisted & Synced across tabs and MongoDB)
  const [studentNotifications, setStudentNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_student_notifications_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const addStudentNotification = (notif) => {
    setStudentNotifications((prev) => {
      const updated = [notif, ...prev];
      try {
        localStorage.setItem('smart_mess_student_notifications_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'STUDENT_NOTIFICATION_ADDED',
          notification: notif
        });
      } catch (e) {}
    }
  };

  const markAllNotificationsRead = () => {
    setStudentNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      try {
        localStorage.setItem('smart_mess_student_notifications_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addToast('All notifications marked as read', 'success');
  };

  const clearAllStudentNotifications = () => {
    setStudentNotifications([]);
    try {
      localStorage.setItem('smart_mess_student_notifications_v1', JSON.stringify([]));
    } catch (e) {}
    addToast('Student inbox cleared', 'info');
  };

  // Student Dining Requests & Special Dietary Requisitions (Persisted & Synced across tabs and MongoDB)
  const [studentDiningRequests, setStudentDiningRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_student_dining_requests_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const acknowledgeStudentDiningRequest = (reqId) => {
    setStudentDiningRequests((prev) => {
      const updated = prev.map((r) => (r.id === reqId ? { ...r, acknowledged: true } : r));
      try {
        localStorage.setItem('smart_mess_student_dining_requests_v1', JSON.stringify(updated));
      } catch (e) {}
      const target = updated.find((r) => r.id === reqId);
      if (target) {
        const notif = {
          id: Date.now(),
          title: '👨‍🍳 Mess Kitchen Requisition Acknowledged',
          message: `Chef Ramesh acknowledged your meal choices & dietary request ("${target.dietaryNote || 'Standard'}"). Kitchen is preparing accordingly.`,
          sender: 'Chef Ramesh (Mess Incharge)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          read: false,
          type: 'mess'
        };
        addStudentNotification(notif);
      }
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'STUDENT_DINING_REQUEST_ACKNOWLEDGED',
          reqId
        });
      } catch (e) {}
    }
    addToast('Student meal requisition acknowledged for kitchen preparation!', 'success');
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
  const [kfcMenu, setKfcMenu] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_kfc_menu');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
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
          } else if (event.data?.type === 'KFC_NEW_ORDER_SYNC' && event.data.order) {
            const incoming = event.data.order;
            setKfcOrders((prev) => [
              incoming,
              ...prev.filter((o) => o.id !== incoming.id && o.token !== incoming.token)
            ]);
            addToast(`New live KFC order: #${incoming.token}!`, 'info');
          } else if (event.data?.type === 'KFC_ORDER_STATUS_SYNC') {
            const { orderId, token, status } = event.data;
            setKfcOrders((prev) =>
              prev.map((ord) =>
                ord.id === orderId || ord.token === orderId || ord.token === token || ord.id === token || ord.orderId === orderId || ord.orderId === token
                  ? { ...ord, status }
                  : ord
              )
            );
            addToast(`KFC Order #${token || orderId} is now ${status}!`, 'info');
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
      } else if (e.key === 'smart_mess_users_v5' && e.newValue) {
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
        const savedUsers = localStorage.getItem('smart_mess_users_v5');
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

  // 3. Room Lead Data (Room D-101, Block D) (Persisted & Synced across tabs and MongoDB)
  const [roomMembers, setRoomMembers] = useState(() => {
    try {
      const saved = localStorage.getItem(ROOM_MEMBERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

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

  // Floor Incharge Headcount Requisition Sheets sent to Mess Kitchen (Persisted & Synced across tabs and MongoDB)
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
    return [];
  });

  // Notifications received by the Room Lead from Floor Incharge & Mess Admin (Persisted & Synced across tabs and MongoDB)
  const [roomLeadNotifications, setRoomLeadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read room lead notifications from localStorage', e);
    }
    return [];
  });

  // 4. Floor Incharge Data (Floor 1, Block D) (Persisted & Synced across tabs and MongoDB)
  const [floorRooms, setFloorRooms] = useState(() => {
    try {
      const saved = localStorage.getItem(FLOOR_ROOMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read floor rooms from localStorage', e);
    }
    return [];
  });

  const [floorAttendance, setFloorAttendance] = useState({});

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
    authFetch(`/api/attendance/room/${encodeURIComponent(roomNo)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: true })
    }).catch(() => {});
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
  const [blockConsolidatedSent, setBlockConsolidatedSent] = useState(() => {
    try {
      return localStorage.getItem('smart_mess_block_consolidated_sent') === 'true';
    } catch {
      return false;
    }
  });
  const [blockSentMap, setBlockSentMap] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_mess_block_sent_map_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 'Block D': false, 'Block E': false, 'All': false };
  });

  // 6. Mess Incharge Data & Menu is initialized and synced at top of context

  // 7. Principal Executive Datasets (Backed by MongoDB & API Analytics)
  const [principalAnalytics, setPrincipalAnalytics] = useState({
    avgWastage: '0.0%',
    messRating: '4.2',
    kfcOrders14d: 0,
    kfcRevenue: 0,
    predictedVsActual: [],
    blockRates: [],
    kfcFootfall: [],
    escalations: []
  });

  const [principalFlagged, setPrincipalFlagged] = useState(false);
  const principalRollups = useMemo(() => {
    const safeFloorRooms = Array.isArray(floorRooms) ? floorRooms : [];
    const safeRoomMembers = Array.isArray(roomMembers) ? roomMembers : [];
    const totalRooms = safeFloorRooms.length || 8;
    const totalStudents = totalRooms * 5;
    const submitted = safeFloorRooms.reduce((acc, r) => acc + ((r && r.submitted) || 0), 0);
    const pending = Math.max(0, totalStudents - submitted);
    const rate = totalStudents > 0 ? parseFloat(((submitted / totalStudents) * 100).toFixed(1)) : 0;

    const d101B = safeRoomMembers.filter((m) => m && m.status !== 'On Leave' && m.choices?.b === 'Yes').length;
    const d101L = safeRoomMembers.filter((m) => m && m.status !== 'On Leave' && m.choices?.l === 'Yes').length;
    const d101S = safeRoomMembers.filter((m) => m && m.status !== 'On Leave' && m.choices?.s === 'Yes').length;
    const d101D = safeRoomMembers.filter((m) => m && m.status !== 'On Leave' && m.choices?.d === 'Yes').length;

    const otherSubmitted = safeFloorRooms.filter((r) => r && r.roomNo !== 'Room D-101').reduce((acc, r) => acc + ((r && r.submitted) || 0), 0);
    const breakfast = d101B + Math.round(otherSubmitted * 0.95);
    const lunch = d101L + Math.round(otherSubmitted * 1.0);
    const snacks = d101S + Math.round(otherSubmitted * 0.82);
    const dinner = d101D + Math.round(otherSubmitted * 0.95);

    const d101Pending = safeRoomMembers
      .filter((m) => m && m.status === 'Pending')
      .map((m) => {
        const studentName = m?.name || 'Student';
        return {
          id: `D101-${m?.id || Math.random()}`,
          initial: (studentName.charAt(0) || 'S').toUpperCase(),
          name: studentName,
          email: `${studentName.toLowerCase().replace(/[^a-z]/g, '')}@kiet.edu`,
          room: 'Room D-101 • Block D'
        };
      });

    const otherPending = [
      { id: 'D201-5', initial: 'A', name: 'Ananya Gupta', email: 'ananya.gupta@kiet.edu', room: 'Room D-201 • Block D' },
      { id: 'D202-4', initial: 'S', name: 'Shivam Dixit', email: 'shivam.dixit@kiet.edu', room: 'Room D-202 • Block D' },
      { id: 'D202-5', initial: 'K', name: 'Karan Mehra', email: 'karan.mehra@kiet.edu', room: 'Room D-202 • Block D' },
      { id: 'E102-5', initial: 'A', name: 'Aditi Deshmukh', email: 'aditi.deshmukh@kiet.edu', room: 'Room E-102 • Block E' },
      { id: 'E201-5', initial: 'N', name: 'NITHIN (PG)', email: '24b21a43a1@kiet.edu', room: 'Room E-201 • Block E' },
      { id: 'E202-5', initial: 'T', name: 'Tarun Josh', email: 'tarun.josh@kiet.edu', room: 'Room E-202 • Block E' }
    ];

    return {
      date: '2026-10-01',
      rate,
      submitted,
      total: totalStudents,
      pending,
      cutoff: '22:00',
      flagged: Boolean(principalFlagged),
      mealCounts: {
        breakfast,
        lunch,
        snacks,
        dinner
      },
      pendingStudents: [...d101Pending, ...otherPending.slice(0, Math.max(0, pending - d101Pending.length))]
    };
  }, [floorRooms, roomMembers, principalFlagged]);

  const togglePrincipalRollupFlag = () => {
    setPrincipalFlagged((prev) => {
      const next = !prev;
      addToast(next ? 'Campus rollup flagged for escalation' : 'Campus rollup unflagged', next ? 'warning' : 'info');
      return next;
    });
  };

  const remindPendingStudentPrincipal = (studentName) => {
    const notice = {
      id: Date.now(),
      title: '🏛️ Directive from Principal\'s Office',
      message: `Principal Dr. Roy has issued an urgent compliance notice for ${studentName || 'student'}. Room Lead must assist with immediate meal verification.`,
      sender: 'Dr. Roy (Principal)',
      roomNo: 'Room D-101',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'principal'
    };
    setRoomLeadNotifications((prev) => {
      const updated = [notice, ...prev];
      broadcastNotificationsUpdate(updated, notice);
      return updated;
    });
    addToast(`Principal executive notice dispatched to Room Lead for ${studentName}!`, 'success');
  };

  const remindAllPendingPrincipal = () => {
    const notice = {
      id: Date.now(),
      title: '🏛️ Campus-Wide Directive from Principal\'s Office',
      message: 'Office of the Principal: Mandatory compliance reminder issued for all hostel blocks. All Room Leads must ensure 100% room submissions before tonight\'s 10:00 PM cutoff.',
      sender: 'Dr. Roy (Principal)',
      roomNo: 'Room D-101',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'principal'
    };
    setRoomLeadNotifications((prev) => {
      const updated = [notice, ...prev];
      broadcastNotificationsUpdate(updated, notice);
      return updated;
    });
    addToast('Executive Directive dispatched to all Room Leads across campus!', 'success');
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

  const [principalWastageTrend, setPrincipalWastageTrend] = useState([]);
  const [blockPerformance, setBlockPerformance] = useState([]);
  const [kfcHourlyFootfall, setKfcHourlyFootfall] = useState([]);

  // -------------------------------------------------------------
  // AI PREDICTIVE INTELLIGENCE & HISTORICAL HEADCOUNT FORECASTING
  // -------------------------------------------------------------
  const [selectedAiMeal, setSelectedAiMeal] = useState('Lunch');
  const [aiScenario, setAiScenario] = useState('standard');
  const [aiLoading, setAiLoading] = useState(false);

  // Default initial AI forecast with rich past-data values
  const [aiForecast, setAiForecast] = useState(() => {
    return {
      meal: 'Lunch',
      dayOfWeek: 'Thu',
      scenario: 'standard',
      selectedCount: 185,
      predictedCount: 192,
      confidence: 94.6,
      confidenceInterval: { min: 188, max: 196 },
      bufferPortions: 8,
      prepTarget: 200,
      historicalTurnoutRatio: 1.038,
      wma: 191,
      kitchenBatch: {
        rawRiceKg: 32.0,
        dalLiters: 28.0,
        vegPaneerKg: 32.0,
        rotisPcs: 600,
        oilSpicesKg: 4.4,
        bufferKg: 2.2,
        prepTarget: 200,
        bufferPortions: 8
      },
      wastageMetrics: {
        staticWasteKg: 10.1,
        aiWasteKg: 4.6,
        wasteSavedKg: 5.5,
        costSavedRs: 990,
        wasteReductionPct: 54
      },
      pastTrend: [
        { date: '2026-09-24', day: 'Thu', selected: 185, actual: 192, predicted: 190, variance: 7, accuracy: 97.9, wastageKg: 8.6, event: 'Smart Prep Benchmark' },
        { date: '2026-09-25', day: 'Fri', selected: 184, actual: 191, predicted: 189, variance: 7, accuracy: 97.9, wastageKg: 7.9, event: 'Regular Academic Day' },
        { date: '2026-09-26', day: 'Sat', selected: 160, actual: 156, predicted: 158, variance: -4, accuracy: 97.5, wastageKg: 6.5, event: 'Weekend Outing' },
        { date: '2026-09-27', day: 'Sun', selected: 175, actual: 181, predicted: 179, variance: 6, accuracy: 97.8, wastageKg: 5.9, event: 'Biryani Special' },
        { date: '2026-09-28', day: 'Mon', selected: 187, actual: 193, predicted: 191, variance: 6, accuracy: 97.9, wastageKg: 5.6, event: 'Optimal AI Batch Prep' },
        { date: '2026-09-29', day: 'Tue', selected: 188, actual: 194, predicted: 192, variance: 6, accuracy: 97.9, wastageKg: 5.2, event: 'Optimal AI Batch Prep' },
        { date: '2026-09-30', day: 'Wed', selected: 189, actual: 196, predicted: 194, variance: 7, accuracy: 97.9, wastageKg: 4.9, event: 'Paneer Butter Masala Peak' }
      ]
    };
  });

  const fetchAIForecast = async (meal = selectedAiMeal, date = '2026-10-01', scenario = aiScenario, customSelected = null) => {
    setAiLoading(true);
    try {
      const queryParams = new URLSearchParams({
        meal,
        scenario,
        ...(customSelected ? { customSelected: String(customSelected) } : {})
      });
      const res = await authFetch(`/api/ai/forecast/mess/${date}?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAiForecast(data);
          // Sync headcount table
          setHeadcount((prev) =>
            prev.map((h) =>
              h.meal.toLowerCase() === meal.toLowerCase()
                ? {
                    ...h,
                    selected: data.selectedCount,
                    predicted: data.predictedCount,
                    variance: (data.predictedCount - data.selectedCount) >= 0
                      ? `+${data.predictedCount - data.selectedCount}`
                      : `${data.predictedCount - data.selectedCount}`
                  }
                : h
            )
          );
          return data;
        }
      }
    } catch (err) {
      console.warn('AI Forecast fetch fallback:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const runAiSimulation = async (scenario, overrideSelected = null) => {
    setAiScenario(scenario);
    return await fetchAIForecast(selectedAiMeal, '2026-10-01', scenario, overrideSelected);
  };

  const [aiAnomalies, setAiAnomalies] = useState([]);

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
      const res = await authFetch('/api/kfc/orders');
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
      const res = await authFetch('/api/kfc/menu');
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
      const res = await authFetch('/api/rooms');
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

      const activeRoom = (currentUser?.badge ? currentUser.badge.split('•')[0].trim() : 'Room D-101') || 'Room D-101';
      const cleanRoom = activeRoom.includes('Room') ? activeRoom : `Room ${activeRoom}`;
      const membersRes = await authFetch(`/api/rooms/${cleanRoom}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        if (membersData.success && Array.isArray(membersData.members) && membersData.members.length > 0) {
          setRoomMembers(membersData.members);
          try {
            localStorage.setItem(ROOM_MEMBERS_STORAGE_KEY, JSON.stringify(membersData.members));
          } catch (e) {}
        }
      }
    } catch (err) {}
  };

  const refreshAttendance = async () => {
    try {
      const res = await authFetch('/api/attendance/floor/floor-1');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.rooms) {
          setFloorAttendance(data.rooms);
        }
      }
    } catch (err) {}
  };

  // Per-block finalized headcount (Block D & Block E) for the Mess Incharge cutoff view
  const [blockHeadcount, setBlockHeadcount] = useState({ 'Block D': null, 'Block E': null });

  const refreshBlockHeadcount = async () => {
    try {
      const [resD, resE] = await Promise.all([
        authFetch('/api/aggregations/block/block-d'),
        authFetch('/api/aggregations/block/block-e')
      ]);
      const next = { 'Block D': null, 'Block E': null };
      if (resD.ok) {
        const dataD = await resD.json();
        if (dataD.success && dataD.mealCounts) next['Block D'] = dataD.mealCounts;
      }
      if (resE.ok) {
        const dataE = await resE.json();
        if (dataE.success && dataE.mealCounts) next['Block E'] = dataE.mealCounts;
      }
      setBlockHeadcount(next);
    } catch (err) {}
  };

  // Post-meal actual attendance records entered by the Mess Incharge
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const refreshAttendanceRecords = async () => {
    try {
      const res = await authFetch('/api/attendance');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.attendance)) {
          setAttendanceRecords(data.attendance);
        }
      }
    } catch (err) {}
  };

  const saveMealAttendance = async (payload) => {
    try {
      const res = await authFetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addToast(`Actual attendance recorded for ${payload.meal}.`, 'success');
        await refreshAttendanceRecords();
        return true;
      }
      addToast('Could not save attendance to the kitchen server.', 'warning');
      return false;
    } catch (err) {
      addToast('Could not save attendance to the kitchen server.', 'warning');
      return false;
    }
  };

  const refreshNotifications = async () => {
    try {
      const res = await authFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setStudentNotifications(data.notifications);
          setRoomLeadNotifications(data.notifications);
          setPrincipalNotifications(data.notifications);
        }
      }
    } catch (err) {}
  };

  const refreshPrincipalAnalytics = async () => {
    try {
      const [resAnalytics, resWastage, resBlock] = await Promise.all([
        authFetch('/api/analytics/principal'),
        authFetch('/api/analytics/wastage'),
        authFetch('/api/performance/blocks')
      ]);
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        if (data.success && data.analytics) {
          setPrincipalAnalytics(data.analytics);
        }
      }
      if (resWastage.ok) {
        const data = await resWastage.json();
        const trend = data.wastageTrend || data.wastage;
        if (data.success && Array.isArray(trend)) {
          setPrincipalWastageTrend(trend);
        }
      }
      if (resBlock.ok) {
        const data = await resBlock.json();
        if (data.success && Array.isArray(data.blockPerformance)) {
          setBlockPerformance(data.blockPerformance);
        }
      }
    } catch (err) {}
  };

  const refreshDietaryRequests = async () => {
    try {
      const res = await authFetch('/api/dietary-requests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.requests)) {
          setStudentDiningRequests(data.requests);
        }
      }
    } catch (err) {}
  };

  const refreshFloorRequisitions = async () => {
    try {
      const res = await authFetch('/api/floor-requisitions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.requisitions)) {
          setFloorMealSheets(data.requisitions);
        }
      }
    } catch (err) {}
  };

  const refreshAnomalies = async () => {
    try {
      const res = await authFetch('/api/ai/anomalies');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.anomalies)) {
          setAiAnomalies(data.anomalies);
        }
      }
    } catch (err) {}
  };

  const refreshMealHistory = async (roll) => {
    const studentRoll = roll || currentUser?.rollNo;
    if (!studentRoll) return;
    try {
      const res = await authFetch(`/api/selections/history/${studentRoll}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setMealHistory(data.history);
        }
      }
    } catch (err) {}
  };

  const reseedDatabase = async () => {
    try {
      const res = await authFetch('/api/seeder/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        addToast('MongoDB database reseeded successfully with Block D & E initial data!', 'success');
        refreshRooms();
        refreshUsers();
        refreshKfcOrders();
        refreshKfcMenu();
        refreshMessMenu();
        refreshAttendance();
        refreshNotifications();
        refreshPrincipalAnalytics();
        refreshDietaryRequests();
        refreshFloorRequisitions();
        refreshAnomalies();
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
    refreshAttendance();
    refreshNotifications();
    refreshPrincipalAnalytics();
    refreshDietaryRequests();
    refreshFloorRequisitions();
    refreshAnomalies();
    refreshBlockHeadcount();
    refreshAttendanceRecords();
    fetchAIForecast('Lunch', '2026-10-01');

    if (currentUser?.rollNo) {
      refreshMealHistory(currentUser.rollNo);
    }

    const interval = setInterval(() => {
      refreshRooms();
      refreshKfcOrders(true);
      refreshKfcMenu();
      refreshMessMenu();
      refreshUsers();
      refreshAttendance();
      refreshNotifications();
      refreshPrincipalAnalytics();
      refreshDietaryRequests();
      refreshFloorRequisitions();
      refreshAnomalies();
      refreshBlockHeadcount();
      refreshAttendanceRecords();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.rollNo]);
  // Realtime: Socket.IO pushes "data:changed"; refetch the affected feeds (throttled).
  useEffect(() => {
    let socket = null;
    let pending = null;
    const scheduleRefresh = () => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = null;
        refreshRooms?.();
        refreshKfcOrders?.(true);
        refreshKfcMenu?.();
        refreshMessMenu?.();
        refreshUsers?.();
        refreshNotifications?.();
        refreshPrincipalAnalytics?.();
        refreshDietaryRequests?.();
        refreshFloorRequisitions?.();
        refreshAnomalies?.();
        refreshBlockHeadcount?.();
        refreshAttendanceRecords?.();
      }, 1000);
    };
    try {
      socket = io(API_BASE_URL || undefined, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 2,
        timeout: 3000
      });
      socket.on('data:changed', scheduleRefresh);
      socket.on('connect_error', () => {
        // Socket.IO is optional in serverless/Vercel; polling fallback takes over cleanly.
        if (socket) socket.disconnect();
      });
    } catch (e) {}
    return () => {
      if (pending) clearTimeout(pending);
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeKfcOrder = async (items, totalAmount) => {
    const studentName = currentUser?.name || 'Aarav Sharma';
    const studentRoll = currentUser?.rollNo || studentName;
    const room = (currentUser?.badge ? currentUser.badge.split('•')[0].trim() : 'Room D-101') || 'Room D-101';

    const roomDigits = room.replace(/\D/g, '') || '101';
    const randNum = Math.floor(10 + Math.random() * 90);
    const token = `KFC-D${roomDigits}-${randNum}`;
    const placedAt = Date.now();
    const newOrderData = {
      token,
      studentName,
      studentRoll,
      room,
      items,
      totalAmount,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      placedAt,
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

    addToast(`KFC Order Placed! Token: #${token}`, 'success');

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
      authFetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });

    try {
      if (kfcBcRef.current) {
        kfcBcRef.current.postMessage({ type: 'KFC_NEW_ORDER_SYNC', order: optimisticOrder });
      }
    } catch (e) {}

    try {
      const res = await authFetch('/api/kfc/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setKfcOrders((prev) => [data.order, ...prev.filter((o) => o.id !== tempId && o.id !== data.order.id)]);
          try {
            if (kfcBcRef.current) {
              kfcBcRef.current.postMessage({ type: 'KFC_NEW_ORDER_SYNC', order: data.order });
            }
          } catch (e) {}
          return data.order;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast(errData.message || 'Order could not be saved to canteen server', 'warning');
      }
    } catch (err) {
      console.warn('Backend order persistence note:', err);
    }

    return optimisticOrder;
  };

  // Checklist #6 & #7: Cancel Order with 2-minute cancellation limit & stock restoration
  const cancelKfcOrder = async (orderId) => {
    const targetOrder = kfcOrders.find((o) => o.id === orderId || o.token === orderId);
    if (!targetOrder) {
      addToast('Order not found', 'error');
      return false;
    }
    if (targetOrder.status === 'Cancelled') {
      addToast('Order is already cancelled', 'info');
      return false;
    }
    if (targetOrder.status === 'Collected') {
      addToast('Cannot cancel an order that has already been collected', 'warning');
      return false;
    }

    // Cancellation window: 2 minutes (120,000 ms)
    const placedTimestamp = targetOrder.placedAt || targetOrder.timestamp || null;
    if (placedTimestamp && Date.now() - placedTimestamp > 120000) {
      addToast('Cancellation window has closed. Orders can only be cancelled within 2 minutes of placing.', 'error');
      return false;
    }

    const orderToken = targetOrder.token || orderId;

    // Set status to Cancelled
    setKfcOrders((prev) =>
      prev.map((ord) => (ord.id === orderId || ord.token === orderId ? { ...ord, status: 'Cancelled' } : ord))
    );
    broadcastKfcOrderStatus(orderId, orderToken, 'Cancelled');

    // Restore stock for cancelled items
    if (Array.isArray(targetOrder.items) && targetOrder.items.length > 0) {
      setKfcMenu((prev) => {
        const restored = prev.map((menuItem) => {
          const orderedItem = targetOrder.items.find((i) => i.name === menuItem.name);
          if (!orderedItem) return menuItem;
          const currentStock = menuItem.stock !== undefined ? menuItem.stock : 0;
          const restoredStock = currentStock + (orderedItem.qty || 1);
          return {
            ...menuItem,
            stock: restoredStock,
            isAvailable: restoredStock > 0
          };
        });
        broadcastKfcMenu(restored);
        authFetch('/api/kfc/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu: restored })
        }).catch(() => {});
        return restored;
      });
    }

    addToast(`KFC Order #${orderToken} cancelled. Items restored to kitchen stock.`, 'info');

    const cancelNotif = {
      id: Date.now(),
      title: '❌ KFC Order Cancelled',
      message: `Your Order #${orderToken} was cancelled within the 2-minute cancellation window.`,
      sender: 'KFC Express Counter',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'kfc'
    };
    addStudentNotification(cancelNotif);

    try {
      await authFetch(`/api/kfc/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
    } catch (err) {}

    return true;
  };

  // Checklist #6: Order Feedback (Star rating + comments)
  const submitOrderFeedback = async (orderId, rating, comment) => {
    const feedbackObj = {
      rating: Number(rating) || 5,
      comment: (comment || '').trim(),
      submittedAt: Date.now()
    };

    setKfcOrders((prev) =>
      prev.map((ord) => (ord.id === orderId || ord.token === orderId ? { ...ord, feedback: feedbackObj } : ord))
    );

    addToast('Thank you! Your KFC feedback and rating have been recorded.', 'success');

    if (kfcBcRef.current) {
      try {
        kfcBcRef.current.postMessage({
          type: 'KFC_ORDER_FEEDBACK_SYNC',
          orderId,
          feedback: feedbackObj
        });
      } catch (e) {}
    }

    try {
      await authFetch(`/api/kfc/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackObj })
      });
    } catch (e) {
      console.warn('Feedback persistence note:', e);
    }

    return true;
  };

  const broadcastKfcOrderStatus = (orderId, token, status) => {
    if (kfcBcRef.current) {
      try {
        kfcBcRef.current.postMessage({
          type: 'KFC_ORDER_STATUS_SYNC',
          orderId,
          token: token || orderId,
          status
        });
      } catch (e) {}
    }
  };

  const updateKfcOrderStatus = async (orderId, newStatus) => {
    const target = kfcOrders.find(
      (o) => o.id === orderId || o.token === orderId || o.orderId === orderId
    );
    const orderToken = target?.token || orderId;
    setKfcOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord.token === orderId || ord.token === orderToken
          ? { ...ord, status: newStatus }
          : ord
      )
    );
    broadcastKfcOrderStatus(orderId, orderToken, newStatus);
    addToast(`Order ${orderToken} updated to ${newStatus}`, 'info');

    const kfcNotif = {
      id: Date.now(),
      title: `🍗 KFC Order Update: ${newStatus}`,
      message: `Your Order #${orderToken} is now ${newStatus.toUpperCase()}!${newStatus === 'Ready' ? ' Hot and ready! Please proceed to Counter 1 for pickup.' : newStatus === 'Collected' ? ' Order collected. Enjoy your meal!' : ''}`,
      sender: 'KFC Express Counter',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'kfc'
    };
    addStudentNotification(kfcNotif);

    try {
      await authFetch(`/api/kfc/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Status update backend note:', err);
    }
  };

  const advanceKfcOrderStatus = async (orderId) => {
    const target = kfcOrders.find(
      (o) => o.id === orderId || o.token === orderId || o.orderId === orderId
    );
    if (!target) return;

    const nextStatus =
      target.status === 'Pending'
        ? 'Preparing'
        : target.status === 'Preparing'
        ? 'Ready'
        : target.status === 'Ready'
        ? 'Collected'
        : null;
    if (!nextStatus) return;

    const targetToken = target.token || orderId;
    setKfcOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord.token === orderId || ord.token === targetToken
          ? { ...ord, status: nextStatus }
          : ord
      )
    );

    broadcastKfcOrderStatus(orderId, targetToken, nextStatus);

    const kfcNotif = {
      id: Date.now(),
      title: `🍗 KFC Order Update: ${nextStatus}`,
      message: `Your Order #${targetToken} is now ${nextStatus.toUpperCase()}!${nextStatus === 'Ready' ? ' Hot and ready! Please proceed to Counter 1 for pickup.' : nextStatus === 'Collected' ? ' Order collected. Enjoy your meal!' : ''}`,
      sender: 'KFC Express Counter',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'kfc'
    };
    addStudentNotification(kfcNotif);

    addToast(`Order ${targetToken} status updated to ${nextStatus}`, 'success');
    try {
      await authFetch(`/api/kfc/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.warn('Status advance backend note:', err);
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
      authFetch('/api/kfc/menu', {
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
      authFetch('/api/kfc/menu', {
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
      await authFetch('/api/kfc/menu', {
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
      await authFetch(`/api/kfc/menu/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend item delete note:', err);
    }
  };

  const updateKfcMenuItem = async (updatedItem) => {
    setKfcMenu((prev) => {
      const updated = prev.map((item) =>
        String(item.id) === String(updatedItem.id) ? { ...item, ...updatedItem } : item
      );
      broadcastKfcMenu(updated);
      authFetch('/api/kfc/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updated })
      }).catch(() => {});
      return updated;
    });
    addToast(`${updatedItem.name} updated successfully!`, 'success');
  };

  const setKfcItemStockDirect = (itemId, newStock) => {
    const val = Math.max(0, parseInt(newStock) || 0);
    setKfcMenu((prev) => {
      const updated = prev.map((item) => {
        if (String(item.id) !== String(itemId)) return item;
        return { ...item, stock: val, isAvailable: val > 0 };
      });
      broadcastKfcMenu(updated);
      authFetch('/api/kfc/menu', {
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
      authFetch('/api/kfc/menu', {
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
      await authFetch('/api/kfc/orders', { method: 'DELETE' });
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
    const member = roomMembers.find((m) => m.id === memberId);
    const sid = member?.studentId || member?.name || memberId;
    authFetch(`/api/rooms/${encodeURIComponent('Room D-101')}/members/${encodeURIComponent(sid)}/meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choices, status, date: '2026-10-01' })
    }).catch(() => {});
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
    const leaveMember = roomMembers.find((m) => m.id === memberId);
    const leaveSid = leaveMember?.studentId || leaveMember?.name || memberId;
    authFetch(`/api/rooms/${encodeURIComponent('Room D-101')}/members/${encodeURIComponent(leaveSid)}/meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choices: { b: 'No', l: 'No', s: 'No', d: 'No' }, status: 'On Leave', date: '2026-10-01' })
    }).catch(() => {});
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
          } else if (data.type === 'STUDENT_DINING_REQUEST_UPDATED') {
            if (data.request) {
              setStudentDiningRequests((prev) => [data.request, ...prev.filter((r) => r.id !== data.request.id && r.rollNo !== data.request.rollNo)]);
              playNotificationChime();
              addToast(`🍴 New Meal Requisition from ${data.request.studentName} (${data.request.roomNo}): ${data.request.dietaryNote}`, 'info');
            }
          } else if (data.type === 'STUDENT_DINING_REQUEST_ACKNOWLEDGED') {
            if (data.reqId) {
              setStudentDiningRequests((prev) =>
                prev.map((r) => (r.id === data.reqId ? { ...r, acknowledged: true } : r))
              );
            }
          } else if (data.type === 'STUDENT_NOTIFICATION_ADDED') {
            if (data.notification) {
              setStudentNotifications((prev) => [data.notification, ...prev.filter((n) => n.id !== data.notification.id)]);
              playNotificationChime();
            }
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
      } else if (e.key === 'smart_mess_student_notifications_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setStudentNotifications(parsed);
        } catch (err) {}
      } else if (e.key === 'smart_mess_student_dining_requests_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setStudentDiningRequests(parsed);
        } catch (err) {}
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

  const sendBlockConsolidatedCount = (targetBlock = 'All') => {
    const isBlockD = targetBlock === 'Block D';
    const isBlockE = targetBlock === 'Block E';

    setBlockConsolidatedSent(true);
    setBlockSentMap((prev) => {
      const updated = {
        ...prev,
        [targetBlock]: true,
        ...(targetBlock === 'All' ? { 'Block D': true, 'Block E': true, 'All': true } : {})
      };
      if (updated['Block D'] && updated['Block E']) {
        updated['All'] = true;
      }
      try {
        localStorage.setItem('smart_mess_block_sent_map_v1', JSON.stringify(updated));
        localStorage.setItem('smart_mess_block_consolidated_sent', 'true');
      } catch (e) {}
      return updated;
    });

    const blockLabel = isBlockD ? 'Block D (Senior Wing)' : isBlockE ? 'Block E (International & PG Wing)' : 'Block D & Block E';
    const blockNotif = {
      id: Date.now(),
      title: `🏢 ${blockLabel} Requisitions Forwarded to Mess`,
      message: `Block Coordinator has consolidated and forwarded the final ${blockLabel} meal requisitions to the Main Mess Kitchen.`,
      sender: 'Nithin (Block Coordinator)',
      roomNo: isBlockE ? 'Room E-101' : 'Room D-101',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'block'
    };

    setRoomLeadNotifications((prev) => {
      const updated = [blockNotif, ...prev];
      broadcastNotificationsUpdate(updated, blockNotif);
      return updated;
    });

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'BLOCK_CONSOLIDATED_COUNT_SENT',
          timestamp: Date.now(),
          targetBlock,
          notification: blockNotif
        });
      } catch (e) {}
    }
    addToast(`${isBlockD ? 'Block D' : isBlockE ? 'Block E' : 'Consolidated'} meal count sent successfully to Mess Incharge!`, 'success');
  };

  // Nudges a Room Lead directly from Block Coordinator or Principal
  const nudgeRoomLead = (roomNo = 'Room D-101', reason = 'Cutoff compliance reminder', sender = 'Nithin (Block Coordinator)') => {
    const isPrincipal = sender.includes('Principal');
    const notice = {
      id: Date.now(),
      title: isPrincipal ? '🏛️ Principal Executive Directive' : `🏢 Block Coordinator Nudge for ${roomNo}`,
      message: `${sender}: ${reason}. Please ensure all roommates complete their meal choices before 10:00 PM cutoff.`,
      sender: sender,
      roomNo: roomNo,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: isPrincipal ? 'principal' : 'block'
    };
    setRoomLeadNotifications((prev) => {
      const updated = [notice, ...prev];
      broadcastNotificationsUpdate(updated, notice);
      return updated;
    });
    addToast(`Direct alert dispatched to Lead of ${roomNo}!`, 'info');
    authFetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    }).catch(() => {});
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
    authFetch('/api/floor-requisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSheet)
    }).catch(() => {});
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

    const kitchenNotif = {
      id: Date.now(),
      title: '🍳 Mess Kitchen Confirmed Cooking Prep',
      message: `Chef Ramesh (Main Mess Kitchen) has confirmed ${targetFloor || 'Floor 1'} meal requisitions for tomorrow. Kitchen procurement & cooking prep has started!`,
      sender: 'Chef Ramesh (Mess Incharge)',
      roomNo: 'Room D-101',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'kitchen'
    };

    setRoomLeadNotifications((prev) => {
      const updated = [kitchenNotif, ...prev];
      broadcastNotificationsUpdate(updated, kitchenNotif);
      return updated;
    });

    const studentCookNotif = {
      id: Date.now() + 1,
      title: '🍳 Kitchen Cooking Prep Confirmed',
      message: `Chef Ramesh (Main Mess Kitchen) confirmed cooking preparation for ${targetFloor || 'Hostel Block D & E'}. Tomorrow's meals will be served on schedule.`,
      sender: 'Chef Ramesh (Mess Incharge)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      type: 'kitchen'
    };
    addStudentNotification(studentCookNotif);

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: 'FLOOR_MEAL_SHEET_CONFIRMED',
          sheetId,
          floor: targetFloor,
          notification: kitchenNotif
        });
      } catch (e) {}
    }

    addToast(`Floor meal sheet for ${targetFloor || 'Floor'} confirmed for kitchen preparation!`, 'success');
  };

  const login = async (identifier, password = '') => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId) {
      addToast('Please enter your Roll Number or Campus Email', 'error');
      return null;
    }

    try {
      const res = await authFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanId, password: cleanPass })
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
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

        const sessionUser = {
          ...data.user,
          path: data.user.path || rolePaths[data.user.role] || '/student',
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setCurrentUser(sessionUser);
        try {
          sessionStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
        localStorage.setItem('smart_mess_current_user', JSON.stringify(sessionUser));
        if (data.token) {
          sessionStorage.setItem('smart_mess_token', data.token);
          sessionStorage.setItem(`smart_mess_token_${sessionUser.role}`, data.token);
          localStorage.setItem(`smart_mess_token_${sessionUser.role}`, data.token);
          localStorage.setItem('smart_mess_token', data.token);
          }
        } catch (e) {}

        addToast(`Welcome, ${sessionUser.name}! Signed in as ${sessionUser.role}.`, 'success');
        return sessionUser;
      } else {
        addToast(data.message || 'Login failed. Please check credentials.', 'error');
        return null;
      }
    } catch (err) {
      addToast('Network or server connection error during authentication.', 'error');
      return null;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('smart_mess_current_user');
      sessionStorage.removeItem('smart_mess_token');
      localStorage.removeItem('smart_mess_current_user');
      localStorage.removeItem('smart_mess_token');
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    addToast('Signed out successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        clearAllStudentNotifications,
        addStudentNotification,
        studentDiningRequests,
        acknowledgeStudentDiningRequest,
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
        updateKfcMenuItem,
        removeKfcMenuItem,
        kfcOrders,
        placeKfcOrder,
        cancelKfcOrder,
        submitOrderFeedback,
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
        blockSentMap,
        sendBlockConsolidatedCount,
        nudgeFloorIncharge,
        nudgeRoomLead,
        floorInchargeAlerts,
        dismissFloorAlert,
        floorMealSheets,
        sendFloorMealSheetToMess,
        confirmFloorMealSheetInKitchen,
        menu,
        updateMenu,
        removeMessDish,
        addMessDish,
        updateMessDishImage,
        refreshMessMenu,
        headcount,
        blockHeadcount,
        refreshBlockHeadcount,
        attendanceRecords,
        refreshAttendanceRecords,
        saveMealAttendance,
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
        selectedAiMeal,
        setSelectedAiMeal,
        aiScenario,
        setAiScenario,
        aiLoading,
        aiForecast,
        setAiForecast,
        fetchAIForecast,
        runAiSimulation,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        loginAsUser,
        refreshUsers,
        refreshAttendance,
        refreshNotifications,
        refreshPrincipalAnalytics,
        refreshDietaryRequests,
        refreshFloorRequisitions,
        refreshAnomalies,
        refreshMealHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
