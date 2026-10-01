// Import core React hooks for state, side effects, and memoization
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the shared universal top navigation bar component
import { Navbar } from '../components/Navbar';

// Import the left-hand navigation sidebar component
import { Sidebar } from '../components/Sidebar';

// Import application context to access global state and action handlers
import { useApp } from '../context/AppContext';

// Import icons from lucide-react for buttons, tabs, status indicators, and alerts
import {
  Send,             // Icon for sending reminders
  CheckCircle2,     // Verified status icon
  AlertCircle,      // Pending status icon
  Users,            // Icon representing roommates
  Clock,            // Icon for cutoff deadline countdown
  Utensils,         // Icon for kitchen meals
  Coffee,           // Icon for evening snacks
  Sun,              // Icon for breakfast & light mode
  Moon,             // Icon for dinner & dark mode
  Share2,           // Icon for copying/sharing WhatsApp reminder
  Edit3,            // Icon for assisted meal entry
  Home,             // Icon for marking home visit / on leave
  ShieldCheck,      // Badge icon for room lead
  Check,            // Checkmark confirmation icon
  X,                // Close modal icon
  Copy,             // Icon for clipboard copy
  Info,             // Information icon
  Bell,             // Icon for notifications
  Lock,             // Icon for locked editing window
  Unlock,           // Icon for active editing window
  History,          // Icon for edit history log
  Trash2,           // Icon for clearing notifications
  LayoutDashboard,  // Icon for main overview tab
  UtensilsCrossed,  // Icon for kitchen requisition tab
  Search,           // Icon for roommate search
  Filter,           // Icon for status filters
  MessageSquare,    // Icon for incharge communications
  CheckCheck,       // Icon for mark all read
  Download,         // Icon for downloading requisition
  CalendarCheck     // Icon for cutoff schedule
} from 'lucide-react';

// Import Recharts components for submission breakdown visualization
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Main Room Lead Dashboard functional component
export const RoomLeadDashboard = () => {
  // Extract room lead state and action handlers from AppContext
  const {
    roomMembers = [],                  // Array of roommates in Room D-101
    roomLeadNotifications = [],        // Real notifications received from Floor Incharge
    markRoomLeadNotificationRead,      // Marks a single notification as read
    markAllRoomLeadNotificationsRead,  // Marks all notifications as read
    clearRoomLeadNotifications,        // Clears notification history
    updateRoomMemberMeal,              // Action to update/assist member's meal choices
    markMemberOnLeave,                 // Action to mark member on official leave / fasting
    submitRoomRosterToFloorIncharge,   // Action to submit verified room roster to Floor Incharge
    remindStudent,                     // Action to send an in-app reminder to a specific student
    remindAllPendingInRoom,            // Action to remind all pending students in room
    logout,                            // Action to log out user
    addToast                           // Action to trigger toast notifications
  } = useApp();

  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // State: Currently active tab in the Room Lead Portal
  const [activeTab, setActiveTab] = useState('Dashboard');

  // State: Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // State: Controls visibility of Floor Incharge Notifications modal/drawer
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // State: Time-bounded editing window active state (true = lead can edit, false = locked)
  const [isEditingWindowActive, setIsEditingWindowActive] = useState(true);

  // State: Emergency extension added (in minutes)
  const [extensionMinutes, setExtensionMinutes] = useState(0);

  // State: Modal for assisted/proxy meal submission or editing on behalf of a roommate
  const [editingMember, setEditingMember] = useState(null);

  // State: Temporary meal form choices for assisted booking modal
  const [assistedChoices, setAssistedChoices] = useState({
    b: 'Yes',
    l: 'Yes',
    s: 'Yes',
    d: 'Yes'
  });

  // State: Optional note for assisted submission (e.g. "Fasting at night", "Extra rice")
  const [assistedNote, setAssistedNote] = useState('');

  // State: Controls visibility of WhatsApp Room Broadcast template modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // State: Live Cutoff Countdown Timer (hours, minutes, seconds remaining to 10:00 PM)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // State: Search query for roommate filter
  const [searchQuery, setSearchQuery] = useState('');

  // State: Status filter chip ('All' | 'Submitted' | 'Pending' | 'On Leave')
  const [memberFilter, setMemberFilter] = useState('All');

  // State: Quick reply message input in Incharge Alerts tab
  const [quickReplyText, setQuickReplyText] = useState('');

  // Unread notification count from Floor Incharge
  const unreadNotifCount = roomLeadNotifications.filter((n) => !n.read).length;

  // Effect: Calculates dynamic countdown timer to tonight's 10:00 PM mess cutoff
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(22, 0, 0, 0); // 10:00:00 PM tonight
      cutoff.setMinutes(cutoff.getMinutes() + extensionMinutes);

      if (now > cutoff) {
        setIsEditingWindowActive(false);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setIsEditingWindowActive(true);
      const diff = cutoff - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [extensionMinutes]);

  // Effect: Syncs document body background with dark mode
  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    return () => {
      document.body.style.backgroundColor = '#f8fafc';
    };
  }, [darkMode]);

  // Computed Room Metrics
  const totalMembers = roomMembers.length || 5;
  const submittedCount = roomMembers.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;
  const pendingCount = Math.max(0, totalMembers - submittedCount);
  const isAllSubmitted = pendingCount === 0;
  const submissionRate = totalMembers > 0 ? Math.round((submittedCount / totalMembers) * 100) : 0;

  // High-contrast KIET Palette: Slate-900 / White for Complete, Slate-500 for Pending
  const pieData = [
    { name: 'Submitted', value: submittedCount, color: darkMode ? '#f8fafc' : '#0f172a' },
    { name: 'Pending', value: pendingCount, color: '#64748b' }
  ];

  // Aggregated meal totals across all roommates for tomorrow
  const mealSummary = useMemo(() => {
    return [
      {
        meal: 'Breakfast',
        icon: Sun,
        timing: '07:30 - 09:30 AM',
        menuItem: 'Masala Dosa / Poha with Chai',
        count: roomMembers.filter((m) => m.choices?.b === 'Yes').length
      },
      {
        meal: 'Lunch',
        icon: Utensils,
        timing: '12:30 - 02:30 PM',
        menuItem: 'Rajma Chawal Thali & Paneer',
        count: roomMembers.filter((m) => m.choices?.l === 'Yes').length
      },
      {
        meal: 'Snacks',
        icon: Coffee,
        timing: '05:00 - 06:00 PM',
        menuItem: 'Samosa & Hot Chai',
        count: roomMembers.filter((m) => m.choices?.s === 'Yes').length
      },
      {
        meal: 'Dinner',
        icon: Moon,
        timing: '07:30 - 09:30 PM',
        menuItem: 'Roti, Dal, Rice & Chicken/Paneer',
        count: roomMembers.filter((m) => m.choices?.d === 'Yes').length
      }
    ];
  }, [roomMembers]);

  // Filtered Room Members based on search query and status filter chip
  const filteredRoomMembers = useMemo(() => {
    return roomMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.note && member.note.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (memberFilter === 'All') return true;
      if (memberFilter === 'Submitted') return member.status === 'Submitted';
      if (memberFilter === 'Pending') return member.status === 'Pending';
      if (memberFilter === 'On Leave') return member.status === 'On Leave';
      return true;
    });
  }, [roomMembers, searchQuery, memberFilter]);

  // Sidebar navigation tabs tailored for Room Lead
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Room Members', icon: Users, badge: pendingCount > 0 ? pendingCount : 0 },
    { name: 'Incharge Alerts', icon: Bell, badge: unreadNotifCount },
    { name: 'Kitchen Requisition', icon: UtensilsCrossed },
    { name: 'Editing Window', icon: Clock }
  ];

  // Handler: Opens assisted meal booking / editing modal for a roommate
  const handleOpenEditModal = (member) => {
    if (!isEditingWindowActive) {
      addToast('Editing window is closed for kitchen prep.', 'warning');
      return;
    }
    setEditingMember(member);
    setAssistedChoices({
      b: member.choices?.b === 'No' ? 'No' : 'Yes',
      l: member.choices?.l === 'No' ? 'No' : 'Yes',
      s: member.choices?.s === 'No' ? 'No' : 'Yes',
      d: member.choices?.d === 'No' ? 'No' : 'Yes'
    });
    setAssistedNote(member.note || '');
  };

  // Handler: Saves assisted meal choices on behalf of roommate
  const handleSaveAssistedBooking = (e) => {
    e.preventDefault();
    if (!editingMember) return;

    updateRoomMemberMeal(editingMember.id, assistedChoices, 'Submitted', assistedNote);
    setEditingMember(null);
  };

  // Handler: Grants a 15-minute emergency editing extension
  const handleGrantEmergencyExtension = () => {
    setExtensionMinutes((prev) => prev + 15);
    setIsEditingWindowActive(true);
    addToast('+15 Minutes Emergency Editing Grace Period granted to Room Lead!', 'success');
  };

  // Pre-formatted room reminder message text for WhatsApp or SMS
  const broadcastText = `📢 *HOSTEL BLOCK D • ROOM D-101 NOTICE*\nHey roommates! Tomorrow's Mess Meal Cutoff is TONIGHT at *10:00 PM*.\nCurrently, *${pendingCount} member(s)* are still pending submission.\nPlease open the SmartMess app and confirm your Breakfast, Lunch, Snacks, and Dinner orders now so our room roster is 100% verified! 👍`;

  // Handler: Copies pre-formatted broadcast message to clipboard
  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(broadcastText);
    addToast('Room reminder message copied to clipboard! Paste it into your Room WhatsApp group.', 'success');
  };

  // Handler: Sends quick confirmation reply to Floor Incharge
  const handleSendQuickReply = (e) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;
    addToast(`Reply dispatched to Prof. Sharma (Floor 2 Incharge): "${quickReplyText}"`, 'success');
    setQuickReplyText('');
  };

  return (
    // Top-level container with theme-reactive styling
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'
    }`}>
      {/* 1. Shared Universal Navigation Bar */}
      <Navbar
        currentRole="Room Lead"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* 2. Main Flex Layout: Sidebar on Left, Content on Right */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          darkMode={darkMode}
          onLogout={handleSignOut}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* TAB 1: MAIN DASHBOARD & CARE OVERVIEW */}
          {activeTab === 'Dashboard' && (
            <>
              {/* ROOM LEAD HERO HEADER */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden ${
                  darkMode
                    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-slate-800'
                    : 'bg-gradient-to-br from-white via-slate-50/50 to-white border-slate-200/90'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  {/* Left Column: Room & Lead Information */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                        Room Lead Portal
                      </span>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                        darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100/80 text-slate-600 border-slate-200'
                      }`}>
                        Hostel Block D • Floor 1
                      </span>
                      <span className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Utensils className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Tomorrow's Meal Planning
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      Room D-101 Care & Compliance Hub
                    </h1>

                    <p className={`text-xs sm:text-sm max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Verify that all 5 roommates have submitted their daily food requirements for tomorrow, assist with proxy orders during the active editing window, and review reminders from Floor Incharge.
                    </p>
                  </div>

                  {/* Right Column: Actions, Notifications Bell & Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    
                    {/* Floor Incharge Notification Bell Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('Incharge Alerts')}
                      className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      title="Floor Incharge Notifications"
                    >
                      <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'text-slate-900 dark:text-white animate-bounce' : 'text-slate-500 dark:text-slate-400'}`} />
                      <span className="hidden sm:inline">Incharge Alerts</span>
                      {unreadNotifCount > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>

                    {/* WhatsApp Broadcast Reminder Button */}
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(true)}
                      className={`text-xs font-bold px-4 py-2.5 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                        darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Share2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                      <span>Room Broadcast</span>
                    </button>

                    {/* Remind All Pending Roommates Button / Signoff Button */}
                    {pendingCount > 0 ? (
                      <button
                        type="button"
                        onClick={remindAllPendingInRoom}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white active:scale-95 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Send className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                        <span>Remind Pending ({pendingCount})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={submitRoomRosterToFloorIncharge}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white active:scale-95 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                        <span>Signoff to Floor Incharge</span>
                      </button>
                    )}

                    {/* Theme Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setDarkMode((prev) => !prev)}
                      className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-Banner: Time-Bounded Lead Editing Window & Cutoff Countdown */}
                <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  darkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isEditingWindowActive ? (
                      <span className="flex items-center gap-1.5 font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 px-2.5 py-1 rounded-xl shadow-xs">
                        <Unlock className="w-3.5 h-3.5 text-white dark:text-slate-950" />
                        Lead Editing Window: OPEN (Until 10:00 PM Cutoff)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        Editing Window: LOCKED (Past Cutoff for Kitchen Prep)
                      </span>
                    )}

                    {!isEditingWindowActive ? (
                      <button
                        type="button"
                        onClick={handleGrantEmergencyExtension}
                        className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Request 15-Min Extension
                      </button>
                    ) : (
                      <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        You can edit or submit roommate meal selections anytime during this window.
                      </span>
                    )}
                  </div>
              

                  <div className="flex items-center gap-1.5 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-md border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}>
                      {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                      remaining for tomorrow's kitchen order
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIVE REMINDER ALERT FROM FLOOR INCHARGE */}
              {unreadNotifCount > 0 && (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}>
                  <div className="flex items-start sm:items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-900 dark:text-white shrink-0 mt-0.5 sm:mt-0 animate-bounce" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        New Reminder from Floor 2 Incharge (Prof. Sharma)
                      </p>
                      <p className="text-xs mt-0.5">
                        {roomLeadNotifications[0]?.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => markRoomLeadNotificationRead(roomLeadNotifications[0]?.id)}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Acknowledge & Mark Read
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Incharge Alerts')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer shadow-xs transition-all ${
                        darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                      title="View Incharge Alerts Tab"
                    >
                      View All ({roomLeadNotifications.length})
                    </button>
                  </div>
                </div>
              )}

              {/* 4 SUMMARY STAT CARDS (Strictly 2-color semantic system) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Roommates */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Room Members
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black">{totalMembers} Students</p>
                  <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Assigned to Room D-101 →
                  </p>
                </div>

                {/* Card 2: Orders Submitted */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Orders Submitted
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {submittedCount}{' '}
                    <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      / {totalMembers} Completed
                    </span>
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {submittedCount} verified orders
                  </p>
                </div>

                {/* Card 3: Pending Roommates (KIET Dark Slate) */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Pending Roommates
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      <AlertCircle className="w-4 h-4" />
                    </span>
                  </div>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {pendingCount}{' '}
                    <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Awaiting Input
                    </span>
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {pendingCount > 0 ? 'Action required by lead' : 'All 5 clear'}
                  </p>
                </div>

                {/* Card 4: Compliance Rate */}
                <div className={`p-5 rounded-2xl border shadow-sm ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Compliance Rate
                    </span>
                    <span className={`text-xs font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {submissionRate}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden mt-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${darkMode ? 'bg-white' : 'bg-slate-900'}`}
                      style={{ width: `${submissionRate}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Floor 2 minimum quota: 60%
                  </p>
                </div>
              </div>

              {/* QUICK ACCESS CARDS: Fast Navigation Hub */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Shortcut 1 */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-xs ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Room Members Roster</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {pendingCount > 0 ? `${pendingCount} pending order to assist` : 'All 5 orders verified'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">View Table →</span>
                </div>

                {/* Shortcut 2 */}
                <div
                  onClick={() => setActiveTab('Incharge Alerts')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-xs ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Floor Incharge Notices</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {unreadNotifCount} unread reminders from Prof. Sharma
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Open Alerts →</span>
                </div>

                {/* Shortcut 3 */}
                <div
                  onClick={() => setActiveTab('Kitchen Requisition')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-xs ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Kitchen Demand Requisition</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Aggregated room meal totals for tomorrow
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">View Meals →</span>
                </div>
              </div>

              {/* SUMMARY ROW: SUBMISSION STATUS DONUT + KITCHEN REQUISITION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Submission Breakdown Donut Chart (Strictly 2 Colors) */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        Room D-101 Submission Status
                      </h3>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Verified meal submissions vs pending roommates
                    </p>
                  </div>

                  <div className="h-52 w-full my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                            borderRadius: '12px',
                            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                            color: darkMode ? '#ffffff' : '#0f172a',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white"></span>
                      <span>Submitted: <strong>{submittedCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span>Pending: <strong>{pendingCount}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Aggregated Room Meal Totals Bento Card */}
                <div
                  className={`lg:col-span-2 p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                          Tomorrow's Room D-101 Kitchen Requisition
                        </h3>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Total number of meals our room has requested from the hostel mess kitchen.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('Kitchen Requisition')}
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          darkMode ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Full Details →
                      </button>
                    </div>

                    {/* 4 Meal Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {mealSummary.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.meal}
                            className={`p-4 rounded-2xl border transition-all ${
                              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                darkMode ? 'text-slate-400' : 'text-slate-500'
                              }`}>
                                {item.meal}
                              </span>
                              <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                            </div>
                            <p className="text-xl font-black">
                              {item.count}{' '}
                              <span className={`text-xs font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                / {totalMembers}
                              </span>
                            </p>
                            <p className={`text-[11px] font-medium mt-1 truncate ${
                              darkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {item.menuItem}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kitchen Notification Subtext */}
                  <div className={`mt-5 pt-3 border-t text-xs flex items-center justify-between ${
                    darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Special diets or allergy notes are passed directly to the Mess Incharge.
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Hostel Block D
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ROOM MEMBERS & FOOD SUBMISSIONS MANAGER */}
          {activeTab === 'Room Members' && (
            <section
              className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
              {/* Header with Title and Search/Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    Room D-101 Members & Tomorrow's Food Requirements
                  </h2>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    View each roommate's breakfast, lunch, snacks, and dinner selections. Assist or edit during the active window.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search member..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-1">
                    {['All', 'Submitted', 'Pending', 'On Leave'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setMemberFilter(f)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                          memberFilter === f
                            ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-950 font-bold'
                            : darkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Broadcast Nudge Button */}
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(true)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                    <span>WhatsApp Nudge</span>
                  </button>

                  {/* Remind All Pending */}
                  {pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={remindAllPendingInRoom}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                      <span>Remind All ({pendingCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className={`border-b font-bold uppercase text-[10px] tracking-wider ${
                      darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}>
                      <th className="pb-3.5 pl-2">Member</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5 text-center">Breakfast</th>
                      <th className="pb-3.5 text-center">Lunch</th>
                      <th className="pb-3.5 text-center">Snacks</th>
                      <th className="pb-3.5 text-center">Dinner</th>
                      <th className="pb-3.5">Verification / Notes</th>
                      <th className="pb-3.5 text-right pr-2">Lead Editing Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {filteredRoomMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                          No roommates match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRoomMembers.map((member) => {
                        const isSubmitted = member.status === 'Submitted';
                        const isOnLeave = member.status === 'On Leave';
                        const isPending = member.status === 'Pending';

                        return (
                          <tr
                            key={member.id}
                            className={`transition-colors ${
                              isPending
                                ? darkMode
                                  ? 'bg-slate-800/40'
                                  : 'bg-slate-50/70'
                                : ''
                            } ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}
                          >
                            {/* Member Name and Bed */}
                            <td className="py-4 pl-2 font-bold flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-900 dark:text-white font-bold">{member.name}</span>
                                  {member.name.includes('(You)') && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                                      Lead
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[11px] block font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Bed {member.id} • Room D-101
                                </span>
                              </div>
                            </td>

                            {/* Status Pill (Strict 2-Color System) */}
                            <td className="py-4">
                              {isSubmitted && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-slate-950" />
                                  Submitted
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                  <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                                  Pending
                                </span>
                              )}
                              {isOnLeave && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  <Home className="w-3.5 h-3.5 text-slate-500" />
                                  On Leave
                                </span>
                              )}
                            </td>

                            {/* Breakfast */}
                            <td className="py-4 text-center">
                              {member.choices?.b === 'Yes' ? (
                                <span className="font-bold text-xs text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                                  Eat
                                </span>
                              ) : member.choices?.b === 'No' ? (
                                <span className="font-semibold text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                  Skip
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-slate-400 font-bold">-</span>
                              )}
                            </td>

                            {/* Lunch */}
                            <td className="py-4 text-center">
                              {member.choices?.l === 'Yes' ? (
                                <span className="font-bold text-xs text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                                  Eat
                                </span>
                              ) : member.choices?.l === 'No' ? (
                                <span className="font-semibold text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                  Skip
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-slate-400 font-bold">-</span>
                              )}
                            </td>

                            {/* Snacks */}
                            <td className="py-4 text-center">
                              {member.choices?.s === 'Yes' ? (
                                <span className="font-bold text-xs text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                                  Eat
                                </span>
                              ) : member.choices?.s === 'No' ? (
                                <span className="font-semibold text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                  Skip
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-slate-400 font-bold">-</span>
                              )}
                            </td>

                            {/* Dinner */}
                            <td className="py-4 text-center">
                              {member.choices?.d === 'Yes' ? (
                                <span className="font-bold text-xs text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                                  Eat
                                </span>
                              ) : member.choices?.d === 'No' ? (
                                <span className="font-semibold text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                  Skip
                                </span>
                              ) : (
                                <span className="font-mono text-xs text-slate-400 font-bold">-</span>
                              )}
                            </td>

                            {/* Submission Time / Lead Edit Note */}
                            <td className="py-4">
                              <span className={`font-mono text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {member.time || 'Awaiting'}
                              </span>
                              {member.editedByLead && (
                                <span className="block text-[10px] text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                                  ✏️ Edited by Lead ({member.leadEditTime || member.time})
                                </span>
                              )}
                              {member.note && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] mt-0.5">
                                  {member.note}
                                </p>
                              )}
                            </td>

                            {/* Lead Actions: Time-Bounded Edit, Remind, or Mark On Leave */}
                            <td className="py-4 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Time-Bounded Edit / Assist Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(member)}
                                  disabled={!isEditingWindowActive}
                                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                                    !isEditingWindowActive
                                      ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                                      : darkMode
                                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs'
                                  }`}
                                  title={isEditingWindowActive ? 'Edit or Assist Meal Submission' : 'Editing Locked after Cutoff'}
                                >
                                  {isEditingWindowActive ? (
                                    <Edit3 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span>{isSubmitted ? 'Edit' : 'Assist'}</span>
                                </button>

                                {/* Remind Nudge Button (only if pending) */}
                                {isPending && (
                                  <button
                                    type="button"
                                    onClick={() => remindStudent(member.name)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                                    title="Send Reminder Nudge"
                                  >
                                    <Send className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                                    <span className="hidden sm:inline">Remind</span>
                                  </button>
                                )}

                                {/* Mark On Leave Button */}
                                {!isOnLeave && (
                                  <button
                                    type="button"
                                    onClick={() => markMemberOnLeave(member.id)}
                                    className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                                      darkMode
                                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Mark as On Leave / Home Visit"
                                  >
                                    <Home className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: FLOOR INCHARGE ALERTS & NOTIFICATIONS CENTER */}
          {activeTab === 'Incharge Alerts' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className={`p-6 rounded-3xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Floor Incharge Alerts & Notifications</h2>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Direct communication channel between Floor Incharge (Prof. Sharma) and Room D-101 Lead.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRoomLeadNotificationsRead}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                      <span>Mark All Acknowledged</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearRoomLeadNotifications}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Clear History
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="mt-5 space-y-3.5">
                  {roomLeadNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-70" />
                      <h3 className="font-bold text-sm">Inbox is all clear!</h3>
                      <p className={`text-xs mt-1 max-w-sm mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        No pending reminders from Floor Incharge. All notices sent to Room D-101 will appear here.
                      </p>
                    </div>
                  ) : (
                    roomLeadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          !notif.read
                            ? darkMode
                              ? 'bg-slate-800/80 border-slate-700 shadow-xs'
                              : 'bg-slate-100 border-slate-300 shadow-xs'
                            : darkMode
                            ? 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                                Action Needed
                              </span>
                            )}
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {notif.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            Received: {notif.time}
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {notif.message}
                        </p>

                        <div className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                          darkMode ? 'border-slate-700/60' : 'border-slate-200/80'
                        }`}>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                            <span>Dispatched by: <strong className="text-slate-800 dark:text-slate-200">{notif.sender || 'Prof. Sharma'}</strong></span>
                            <span>•</span>
                            <span>Target: <strong>Room D-101</strong></span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notif.read ? (
                              <button
                                type="button"
                                onClick={() => markRoomLeadNotificationRead(notif.id)}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Acknowledge Notice</span>
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                                Acknowledged by Lead
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Reply to Incharge Box */}
                <form onSubmit={handleSendQuickReply} className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    Send Direct Update / Reply to Floor 2 Incharge
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Verified with all roommates, 5/5 orders confirmed for tomorrow!"
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      className={`flex-1 p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Update</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: TOMORROW'S KITCHEN REQUISITION */}
          {activeTab === 'Kitchen Requisition' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      Tomorrow's Room D-101 Kitchen Demand Requisition
                    </h2>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Aggregated hostel mess meal portions requested by all 5 roommates in Room D-101 for tomorrow.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => addToast('Room D-101 culinary requisition slip exported!', 'success')}
                    className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Requisition Slip</span>
                  </button>
                </div>

                {/* 4 Detailed Meal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {mealSummary.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.meal}
                        className={`p-5 rounded-2xl border flex flex-col justify-between ${
                          darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {item.meal}
                            </span>
                            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              <Icon className="w-4 h-4" />
                            </span>
                          </div>
                          <p className="text-3xl font-black text-slate-900 dark:text-white">
                            {item.count}{' '}
                            <span className="text-sm font-normal text-slate-400">
                              / {totalMembers} Meals
                            </span>
                          </p>
                          <p className="text-xs font-semibold mt-2 text-slate-700 dark:text-slate-300">
                            {item.menuItem}
                          </p>
                        </div>
                        <div className={`mt-4 pt-3 border-t text-[11px] font-mono text-slate-500 ${
                          darkMode ? 'border-slate-700' : 'border-slate-200'
                        }`}>
                          Serving: {item.timing}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dietary & Allergies Advisory Box */}
                <div className={`mt-6 p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-800/30 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Special Dietary Notes for Room D-101
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Room D-101 includes 1 student fasting/observing late dinner (Priya Sundaram) and 1 proxy assisted order. The hostel mess head chef receives this consolidated count automatically at the 10:00 PM cutoff.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EDITING WINDOW & CUTOFF TIMELINE */}
          {activeTab === 'Editing Window' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                      Room Lead Cutoff & Editing Window Rules
                    </h2>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Lead privilege window allows Room D-101 lead to submit or modify roommate meal choices until 10:00 PM.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                      isEditingWindowActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 border-transparent shadow-xs'
                        : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}>
                      {isEditingWindowActive ? <Unlock className="w-3.5 h-3.5 text-white dark:text-slate-950" /> : <Lock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
                      {isEditingWindowActive ? 'Window Active' : 'Window Locked'}
                    </span>
                  </div>
                </div>

                {/* Big Live Countdown Banner */}
                <div className={`my-6 p-6 rounded-2xl border text-center ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-1">
                    Live Cutoff Countdown
                  </p>
                  <p className="text-4xl sm:text-5xl font-mono font-black text-slate-900 dark:text-white my-2">
                    {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Tonight at 10:00 PM • Kitchen order lock for Hostel Block D
                  </p>
                </div>

                {/* Timeline Milestones */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Hostel Mess Daily Cutoff Pipeline
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-mono font-bold text-slate-500 block mb-0.5">06:00 PM</span>
                      <strong className="block text-slate-800 dark:text-slate-200">Student Self-Booking</strong>
                      <span className="text-[11px] text-slate-500">Individual student window closes</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                      <span className="font-mono font-bold text-slate-300 dark:text-slate-700 block mb-0.5">10:00 PM (Active)</span>
                      <strong className="block text-white dark:text-slate-950">Room Lead Proxy Window</strong>
                      <span className="text-[11px] text-slate-300 dark:text-slate-700">Assists and locks room roster</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-mono font-bold text-slate-500 block mb-0.5">10:30 PM</span>
                      <strong className="block text-slate-800 dark:text-slate-200">Floor Incharge Rollup</strong>
                      <span className="text-[11px] text-slate-500">Prof. Sharma finalizes Floor 2</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="font-mono font-bold text-slate-500 block mb-0.5">11:00 PM</span>
                      <strong className="block text-slate-800 dark:text-slate-200">Kitchen Production</strong>
                      <span className="text-[11px] text-slate-500">Procurement & prep starts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: TIME-BOUNDED MEAL SUBMISSION EDITOR (LEAD PROXY & EDIT) */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border shadow-2xl p-6 transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                  {editingMember.status === 'Submitted' ? 'Edit Meal Choices' : 'Assist Roommate Order'}
                </h3>
                <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Active Lead Window: Modifying order for <strong>{editingMember.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssistedBooking} className="mt-5 space-y-4">
              {/* Breakfast Choice */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="text-xs font-bold">Breakfast (07:30 - 09:30 AM)</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Masala Dosa / Poha with Chai
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, b: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.b === 'Yes'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, b: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.b === 'No'
                        ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Lunch Choice */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="text-xs font-bold">Lunch (12:30 - 02:30 PM)</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Rajma Chawal Thali & Paneer
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, l: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.l === 'Yes'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, l: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.l === 'No'
                        ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Snacks Choice */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="text-xs font-bold">Evening Snacks (05:00 - 06:00 PM)</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Samosa & Hot Chai
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, s: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.s === 'Yes'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, s: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.s === 'No'
                        ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Dinner Choice */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="text-xs font-bold">Dinner (07:30 - 09:30 PM)</p>
                  <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Roti, Dal, Rice & Chicken/Paneer
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, d: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.d === 'Yes'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, d: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.d === 'No'
                        ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Lead Edit Reason / Dietary Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requested via call, exam schedule, fasting..."
                  value={assistedNote}
                  onChange={(e) => setAssistedNote(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Submit Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Save & Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WHATSAPP ROOM BROADCAST NOTIFIER */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-3xl border shadow-2xl p-6 transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h3 className="font-black text-lg">Room WhatsApp Nudge</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Copy this pre-formatted reminder and paste it directly into your Room D-101 WhatsApp or Telegram group:
              </p>

              {/* Pre-formatted message card */}
              <div className={`p-4 rounded-2xl border font-mono text-xs whitespace-pre-wrap leading-relaxed ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {broadcastText}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyBroadcast}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  Copy Reminder Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component as default export
export default RoomLeadDashboard;
