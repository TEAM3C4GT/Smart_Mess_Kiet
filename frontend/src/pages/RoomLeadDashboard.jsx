// Import core React hooks for state, side effects, and memoization
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the shared universal top navigation bar component
import { Navbar } from '../components/Navbar';

// Import the left-hand navigation sidebar component
import { Sidebar } from '../components/Sidebar';

import { useApp, authFetch } from '../context/AppContext';

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
  CalendarCheck,    // Icon for cutoff schedule
  CookingPot,       // Icon for kitchen cooking
  Layers,           // Icon for block consolidation
  ChefHat           // Icon for mess chef
} from 'lucide-react';

// Import Recharts components for submission breakdown visualization
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Comprehensive room allocation hierarchy definitions (1B -> 2F -> Rooms)
const AVAILABLE_ROOMS_HIERARCHY = [
  { block: 'Block D', floor: 'Floor 1', roomNo: 'Room D-101', wing: 'Senior Wing', label: 'Block D • Floor 1 • Room D-101' },
  { block: 'Block D', floor: 'Floor 1', roomNo: 'Room D-102', wing: 'Senior Wing', label: 'Block D • Floor 1 • Room D-102' },
  { block: 'Block D', floor: 'Floor 2', roomNo: 'Room D-201', wing: 'Senior Wing', label: 'Block D • Floor 2 • Room D-201' },
  { block: 'Block D', floor: 'Floor 2', roomNo: 'Room D-202', wing: 'Senior Wing', label: 'Block D • Floor 2 • Room D-202' },
  { block: 'Block E', floor: 'Floor 1', roomNo: 'Room E-101', wing: 'International/PG', label: 'Block E • Floor 1 • Room E-101' },
  { block: 'Block E', floor: 'Floor 1', roomNo: 'Room E-102', wing: 'International/PG', label: 'Block E • Floor 1 • Room E-102' },
  { block: 'Block E', floor: 'Floor 2', roomNo: 'Room E-201', wing: 'International/PG', label: 'Block E • Floor 2 • Room E-201' },
  { block: 'Block E', floor: 'Floor 2', roomNo: 'Room E-202', wing: 'International/PG', label: 'Block E • Floor 2 • Room E-202' }
];

// Main Room Lead Dashboard functional component
export const RoomLeadDashboard = () => {
  // Extract room lead state and action handlers from AppContext
  const {
    currentUser,
    roomMembers: contextRoomMembers = [], // Array of roommates in Room D-101
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
    addToast,                          // Action to trigger toast notifications
    menu,                              // Dynamic menu from Mess Incharge
    floorMealSheets = [],              // Floor meal sheets confirmed by Mess Kitchen
    blockConsolidatedSent,             // Block Coordinator consolidation status
    aiAnomalies = []                   // AI anomaly alerts for this scope
  } = useApp();

  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // State: Dynamic Room Allocation & Hierarchy (1B -> 2F -> Rooms)
  const defaultRoom = useMemo(() => {
    const text = `${currentUser?.badge || ''} ${currentUser?.room || ''} ${currentUser?.name || ''} ${currentUser?.email || ''}`;
    const found = AVAILABLE_ROOMS_HIERARCHY.find((r) => 
      text.toLowerCase().includes(r.roomNo.toLowerCase()) || 
      text.toLowerCase().includes(r.roomNo.replace('Room ', '').toLowerCase()) ||
      text.toLowerCase().includes(r.roomNo.replace('Room ', '').replace('-', '').toLowerCase())
    );
    return found ? found.roomNo : 'Room D-101';
  }, [currentUser]);

  const [selectedRoomNo, setSelectedRoomNo] = useState(defaultRoom);

  // Synchronize active room when user session changes
  useEffect(() => {
    if (defaultRoom) {
      setSelectedRoomNo(defaultRoom);
    }
  }, [defaultRoom]);

  const activeRoomHierarchy = useMemo(() => {
    return AVAILABLE_ROOMS_HIERARCHY.find((r) => r.roomNo === selectedRoomNo) || AVAILABLE_ROOMS_HIERARCHY[0];
  }, [selectedRoomNo]);

  const [scopedRoomMembers, setScopedRoomMembers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      try {
        const cleanRoom = selectedRoomNo.includes('Room') ? selectedRoomNo : `Room ${selectedRoomNo}`;
        const res = await authFetch(`/api/rooms/${encodeURIComponent(cleanRoom)}/members`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.members) && isMounted) {
            setScopedRoomMembers(data.members);
          }
        }
      } catch (err) {}
    };
    fetchMembers();
    return () => { isMounted = false; };
  }, [selectedRoomNo]);

  // Dynamic Room Members (Uses live MongoDB data for selected room, with fallback to context)
  const roomMembers = useMemo(() => {
    if (scopedRoomMembers && scopedRoomMembers.length > 0) {
      return scopedRoomMembers;
    }
    return contextRoomMembers;
  }, [scopedRoomMembers, contextRoomMembers]);

  // State: Currently active tab in the Room Lead Portal
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Single permanent light theme — dark mode removed.
  const darkMode = false;

  // State: Controls visibility of Floor Incharge Notifications modal/drawer
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // State: Time-bounded editing window active state (true = lead can edit, false = locked)
  const [isEditingWindowActive, setIsEditingWindowActive] = useState(true);

  // State: Emergency extension added (in minutes)
  const [extensionMinutes, setExtensionMinutes] = useState(0);

  // State: Modal for assisted/proxy meal submission or editing on behalf of a roommate
  const [editingMember, setEditingMember] = useState(null);

  // State: Modal for Quick Mark Home Leave (Checklist #13)
  const [showQuickLeaveModal, setShowQuickLeaveModal] = useState(false);

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

  // State: Quick reply message input and recipient in Incharge Alerts tab
  const [quickReplyText, setQuickReplyText] = useState('');
  const [replyTarget, setReplyTarget] = useState('Floor Incharge (Prof. Sharma)');

  // Dynamic Kitchen Confirmation check from Mess Incharge
  const isKitchenConfirmed = floorMealSheets.some((s) => s.floor?.includes('Floor 1') && s.status === 'Confirmed by Kitchen');

  // Unread notification count from Incharges
  const unreadNotifCount = roomLeadNotifications.filter((n) => !n.read).length;

  // Handler: Quick toggle meal choice (Checklist #12)
  const handleToggleQuickMeal = (member, mealKey) => {
    if (!isEditingWindowActive) {
      addToast('Editing window is closed for kitchen prep.', 'warning');
      return;
    }
    if (member.status === 'On Leave') {
      addToast(`${member.name} is on official leave. Restore them first to edit meals.`, 'warning');
      return;
    }
    const currentVal = member.choices?.[mealKey] === 'Yes' ? 'Yes' : 'No';
    const nextVal = currentVal === 'Yes' ? 'No' : 'Yes';
    const nextChoices = { ...member.choices, [mealKey]: nextVal };
    updateRoomMemberMeal(member.id, nextChoices, 'Submitted', member.note);
    const mealLabel = mealKey === 'b' ? 'Breakfast' : mealKey === 'l' ? 'Lunch' : mealKey === 's' ? 'Snacks' : 'Dinner';
    addToast(`${member.name}'s ${mealLabel} set to ${nextVal === 'Yes' ? 'Eat' : 'Skip'}`, 'info');
  };

  // Handler: Restore member from Home Leave (Checklist #13)
  const handleRestoreFromLeave = (member) => {
    updateRoomMemberMeal(member.id, { b: 'Yes', l: 'Yes', s: 'Yes', d: 'Yes' }, 'Submitted', 'Returned to hostel');
    addToast(`${member.name} marked Present and restored to active mess roster!`, 'success');
  };
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

  // Computed Room Metrics
  const totalMembers = roomMembers.length || 5;
  const submittedCount = roomMembers.filter((m) => m.status === 'Submitted' || m.status === 'On Leave').length;
  const pendingCount = Math.max(0, totalMembers - submittedCount);
  const isAllSubmitted = pendingCount === 0;
  const submissionRate = totalMembers > 0 ? Math.round((submittedCount / totalMembers) * 100) : 0;

  // High-contrast KIET Palette: Slate-900 for Complete, Slate-500 for Pending
  const pieData = [
    { name: 'Submitted', value: submittedCount, color: '#0f172a' },
    { name: 'Pending', value: pendingCount, color: '#64748b' }
  ];

  // Aggregated meal totals across all roommates for tomorrow (Dynamically linked to Mess Incharge Menu)
  const mealSummary = useMemo(() => {
    return [
      {
        meal: 'Breakfast',
        icon: Sun,
        timing: '07:30 - 09:30 AM',
        menuItem: menu?.breakfast || 'Masala Dosa / Poha with Chai',
        count: roomMembers.filter((m) => m.choices?.b === 'Yes').length
      },
      {
        meal: 'Lunch',
        icon: Utensils,
        timing: '12:30 - 02:30 PM',
        menuItem: menu?.lunch || 'Rajma Chawal Thali & Paneer',
        count: roomMembers.filter((m) => m.choices?.l === 'Yes').length
      },
      {
        meal: 'Snacks',
        icon: Coffee,
        timing: '05:00 - 06:00 PM',
        menuItem: menu?.snacks || 'Samosa & Hot Chai',
        count: roomMembers.filter((m) => m.choices?.s === 'Yes').length
      },
      {
        meal: 'Dinner',
        icon: Moon,
        timing: '07:30 - 09:30 PM',
        menuItem: menu?.dinner || 'Roti, Dal, Rice & Chicken/Paneer',
        count: roomMembers.filter((m) => m.choices?.d === 'Yes').length
      }
    ];
  }, [roomMembers, menu]);

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
  const broadcastText = `📢 *HOSTEL ${activeRoomHierarchy.block.toUpperCase()} • ${activeRoomHierarchy.roomNo.toUpperCase()} NOTICE*\nHey roommates! Tomorrow's Mess Meal Cutoff is TONIGHT at *10:00 PM*.\nCurrently, *${pendingCount} member(s)* are still pending submission.\nPlease open the SmartMess app and confirm your Breakfast, Lunch, Snacks, and Dinner orders now so our room roster is 100% verified! 👍`;

  // Handler: Copies pre-formatted broadcast message to clipboard
  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(broadcastText);
    addToast('Room reminder message copied to clipboard! Paste it into your Room WhatsApp group.', 'success');
  };

  // Handler: Sends quick confirmation reply to Incharges (Floor, Block, Principal, Mess)
  const handleSendQuickReply = (e) => {
    e.preventDefault();
    if (!quickReplyText.trim()) return;
    addToast(`Direct reply dispatched to ${replyTarget}: "${quickReplyText}"`, 'success');
    setQuickReplyText('');
  };

  return (
    // Top-level container with clean unified styling
    <div className="min-h-screen flex flex-col font-sans bg-[#F5F7FA]/80 text-[#293749]">
      {/* 1. Shared Universal Navigation Bar */}
      <Navbar
        currentRole="Room Lead"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={sidebarItems}
      />

      {/* 2. Main Flex Layout: Sidebar on Left, Content on Right */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Navigation Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleSignOut}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

          {(aiAnomalies || []).length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-lg leading-none">⚠️</span>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {aiAnomalies.length} AI anomaly alert{aiAnomalies.length !== 1 ? 's' : ''} detected
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  {aiAnomalies[0].title}
                  {aiAnomalies[0].description || aiAnomalies[0].desc ? ` — ${aiAnomalies[0].description || aiAnomalies[0].desc}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: MAIN DASHBOARD & CARE OVERVIEW */}
          {activeTab === 'Dashboard' && (
            <>
              {/* ROOM LEAD HERO HEADER */}
              <div
                className="p-6 sm:p-7 rounded-3xl border border-[#DCE4EF]/90 bg-gradient-to-br from-white via-slate-50/50 to-white shadow-sm transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  {/* Left Column: Room & Lead Information */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border bg-[#EDF2F9] text-slate-800 border-[#DCE4EF] flex items-center gap-1.5 shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                        Room Lead Portal
                      </span>

                      {/* Dynamic Room Allocation Hierarchy Badge: 1B -> 2F -> Rooms (Checklist #11) */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-[#EDF2F9] border-[#D5E4F8] text-[#243F66] shadow-xs">
                        <span>🏛️ {activeRoomHierarchy.block} (1B)</span>
                        <span className="text-[#6E93C4]">→</span>
                        <span>🏢 {activeRoomHierarchy.floor} (2F)</span>
                        <span className="text-[#6E93C4]">→</span>
                        <span className="font-bold underline">🚪 {activeRoomHierarchy.roomNo}</span>
                      </div>

                      {/* Quick Interactive Room Switcher (Checklist #11) */}
                      <div className="flex items-center gap-1.5 text-xs ml-1">
                        <span className="text-[#65748A] font-medium">Room Assignment:</span>
                        <select
                          value={selectedRoomNo}
                          onChange={(e) => setSelectedRoomNo(e.target.value)}
                          className="text-xs px-2.5 py-1 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
                          title="Switch room allocation hierarchy (1B -> 2F -> Rooms)"
                        >
                          {AVAILABLE_ROOMS_HIERARCHY.map((r) => (
                            <option key={r.roomNo} value={r.roomNo}>
                              {r.label} ({r.wing})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#293749]">
                      {activeRoomHierarchy.roomNo} Care & Compliance Hub
                    </h1>

                    <p className="text-xs sm:text-sm max-w-2xl text-slate-600">
                      Verify that all {totalMembers} roommates have submitted their daily food requirements for tomorrow, assist with proxy orders during the active editing window, and review reminders from Floor Incharge.
                    </p>
                  </div>

                  {/* Right Column: Actions, Notifications Bell & Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    
                    {/* Floor Incharge Notification Bell Button */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('Incharge Alerts')}
                      className="p-2.5 rounded-2xl border bg-white border-[#DCE4EF] text-slate-700 hover:bg-[#F5F7FA] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Floor Incharge Notifications"
                    >
                      <Bell className={`w-4 h-4 ${unreadNotifCount > 0 ? 'text-[#293749] animate-bounce' : 'text-[#65748A]'}`} />
                      <span className="hidden sm:inline">Incharge Alerts</span>
                      {unreadNotifCount > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white">
                          {unreadNotifCount}
                        </span>
                      )}
                    </button>

                    {/* WhatsApp Broadcast Reminder Button */}
                    <button
                      type="button"
                      onClick={() => setShowBroadcastModal(true)}
                      className="text-xs font-bold px-4 py-2.5 rounded-2xl border bg-white hover:bg-[#F5F7FA] text-slate-700 border-[#DCE4EF] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-4 h-4 text-slate-700" />
                      <span>Room Broadcast</span>
                    </button>

                    {/* Remind All Pending Roommates Button / Signoff Button */}
                    {pendingCount > 0 ? (
                      <button
                        type="button"
                        onClick={remindAllPendingInRoom}
                        className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Send className="w-4 h-4 text-slate-300" />
                        <span>Remind Pending ({pendingCount})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={submitRoomRosterToFloorIncharge}
                        className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-300" />
                        <span>Signoff to Floor Incharge</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Banner: Time-Bounded Lead Editing Window & Cutoff Countdown */}
                <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  darkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2.5">
                    {isEditingWindowActive ? (
                      <span className="flex items-center gap-1.5 font-bold text-white bg-slate-900   px-2.5 py-1 rounded-xl shadow-xs">
                        <Unlock className="w-3.5 h-3.5 text-white " />
                        Lead Editing Window: OPEN (Until 10:00 PM Cutoff)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-bold text-slate-700  bg-[#EDF2F9]  border border-slate-300  px-2.5 py-1 rounded-xl">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        Editing Window: LOCKED (Past Cutoff for Kitchen Prep)
                      </span>
                    )}

                    {!isEditingWindowActive ? (
                      <button
                        type="button"
                        onClick={handleGrantEmergencyExtension}
                        className="font-bold text-xs text-slate-800  hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Request 15-Min Extension
                      </button>
                    ) : (
                      <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        You can edit or submit roommate meal selections anytime during this window.
                      </span>
                    )}
                  </div>
              

                  <div className="flex items-center gap-1.5 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded-md border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-[#EDF2F9] border-slate-300 text-slate-800'
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
                    : 'bg-[#EDF2F9] border-slate-300 text-[#293749]'
                }`}>
                  <div className="flex items-start sm:items-center gap-3">
                    <Bell className="w-5 h-5 text-[#293749]  shrink-0 mt-0.5 sm:mt-0 animate-bounce" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-[#293749] ">
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
                      className="bg-slate-900 hover:bg-slate-800    text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      Acknowledge & Mark Read
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Incharge Alerts')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer shadow-xs transition-all ${
                        darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          : 'bg-white hover:bg-[#F5F7FA] border-[#DCE4EF] text-slate-700'
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
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Room Members
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#EDF2F9] text-slate-700'}`}>
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black">{totalMembers} Students</p>
                  <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                    Assigned to Room D-101 →
                  </p>
                </div>

                {/* Card 2: Orders Submitted */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Orders Submitted
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-[#EDF2F9] text-slate-800'}`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#293749]'}`}>
                    {submittedCount}{' '}
                    <span className={`text-sm font-normal ${darkMode ? 'text-[#65748A]' : 'text-slate-400'}`}>
                      / {totalMembers} Completed
                    </span>
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                    {submittedCount} verified orders
                  </p>
                </div>

                {/* Card 3: Pending Roommates (KIET Dark Slate) */}
                <div
                  onClick={() => setActiveTab('Room Members')}
                  className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Pending Roommates
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#EDF2F9] text-slate-700'}`}>
                      <AlertCircle className="w-4 h-4" />
                    </span>
                  </div>
                  <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#293749]'}`}>
                    {pendingCount}{' '}
                    <span className={`text-sm font-normal ${darkMode ? 'text-[#65748A]' : 'text-slate-400'}`}>
                      Awaiting Input
                    </span>
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                    {pendingCount > 0 ? 'Action required by lead' : 'All 5 clear'}
                  </p>
                </div>

                {/* Card 4: Compliance Rate */}
                <div className={`p-5 rounded-2xl border shadow-sm ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Compliance Rate
                    </span>
                    <span className={`text-xs font-bold font-mono ${darkMode ? 'text-white' : 'text-[#293749]'}`}>
                      {submissionRate}%
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden mt-2 ${darkMode ? 'bg-slate-800' : 'bg-[#EDF2F9]'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${darkMode ? 'bg-white' : 'bg-slate-900'}`}
                      style={{ width: `${submissionRate}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
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
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#DCE4EF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF2F9]  text-slate-800  flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Room Members Roster</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        {pendingCount > 0 ? `${pendingCount} pending order to assist` : 'All 5 orders verified'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#293749] ">View Table →</span>
                </div>

                {/* Shortcut 2 */}
                <div
                  onClick={() => setActiveTab('Incharge Alerts')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-xs ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#DCE4EF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF2F9]  text-slate-800  flex items-center justify-center font-bold">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Floor Incharge Notices</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        {unreadNotifCount} unread reminders from Prof. Sharma
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#293749] ">Open Alerts →</span>
                </div>

                {/* Shortcut 3 */}
                <div
                  onClick={() => setActiveTab('Kitchen Requisition')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between shadow-xs ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#DCE4EF] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF2F9]  text-slate-700  flex items-center justify-center font-bold">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Kitchen Demand Requisition</h4>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        Aggregated room meal totals for tomorrow
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#293749] ">View Meals →</span>
                </div>
              </div>

              {/* SUMMARY ROW: SUBMISSION STATUS DONUT + KITCHEN REQUISITION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Submission Breakdown Donut Chart (Strictly 2 Colors) */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-slate-700 " />
                        Room D-101 Submission Status
                      </h3>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
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
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-900 "></span>
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
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
                  }`}
                >
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 ">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-slate-700 " />
                          Tomorrow's Room D-101 Kitchen Requisition
                        </h3>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                          Total number of meals our room has requested from the hostel mess kitchen.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('Kitchen Requisition')}
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer transition-all ${
                          darkMode ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-[#EDF2F9] text-slate-800 border-slate-300 hover:bg-slate-200'
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
                              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]/80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                darkMode ? 'text-slate-400' : 'text-[#65748A]'
                              }`}>
                                {item.meal}
                              </span>
                              <Icon className="w-4 h-4 text-slate-700 " />
                            </div>
                            <p className="text-xl font-black">
                              {item.count}{' '}
                              <span className={`text-xs font-normal ${darkMode ? 'text-[#65748A]' : 'text-slate-400'}`}>
                                / {totalMembers}
                              </span>
                            </p>
                            <p className={`text-[11px] font-medium mt-1 truncate ${
                              darkMode ? 'text-slate-400' : 'text-[#65748A]'
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
                    darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-[#65748A]'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Special diets or allergy notes are passed directly to the Mess Incharge.
                    </span>
                    <span className="font-bold text-slate-700 ">
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
              className="p-6 rounded-3xl border border-[#DCE4EF]/90 bg-white shadow-sm transition-all duration-300"
            >
              {/* Header with Title and Search/Filters/Leave Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDF2F9] text-[#2B4F80] border border-[#D5E4F8]">
                      🏛️ {activeRoomHierarchy.block} (1B) → 🏢 {activeRoomHierarchy.floor} (2F) → 🚪 {activeRoomHierarchy.roomNo}
                    </span>
                    <span className="text-[11px] font-semibold text-[#65748A]">
                      Lead: {currentUser?.name || 'Alex Rivers'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-[#293749]">
                    <Users className="w-5 h-5 text-slate-700" />
                    {activeRoomHierarchy.roomNo} Members & Tomorrow's Food Requirements
                  </h2>
                  <p className="text-xs mt-0.5 text-[#65748A]">
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
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-[#DCE4EF] bg-[#F5F7FA] text-[#293749] text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                            ? 'bg-slate-900 text-white shadow-xs font-bold'
                            : 'bg-[#EDF2F9] text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Checklist #13: MOVED HOME LEAVE BUTTON HIGHER UP IN SECTION */}
                  <button
                    type="button"
                    onClick={() => setShowQuickLeaveModal(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    title="Quickly mark a roommate on home leave or vacation"
                  >
                    <Home className="w-3.5 h-3.5 text-amber-700" />
                    <span>Mark Home Leave</span>
                  </button>

                  {/* Broadcast Nudge Button */}
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-[#DCE4EF] bg-white text-slate-700 hover:bg-[#F5F7FA] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-700" />
                    <span>WhatsApp Nudge</span>
                  </button>

                  {/* Remind All Pending */}
                  {pendingCount > 0 && (
                    <button
                      type="button"
                      onClick={remindAllPendingInRoom}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-300" />
                      <span>Remind All ({pendingCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Leave Status Alert Strip at Top (Checklist #13: visible without scrolling) */}
              {roomMembers.some((m) => m.status === 'On Leave') && (
                <div className="mb-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Roommates on Home Leave:</strong>{' '}
                      {roomMembers.filter((m) => m.status === 'On Leave').map((m) => m.name).join(', ')} — Daily mess portions are zeroed in kitchen requisition.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemberFilter('On Leave')}
                    className="underline font-bold text-amber-800 hover:text-amber-950 cursor-pointer"
                  >
                    View Leave List →
                  </button>
                </div>
              )}

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#DCE4EF] font-bold uppercase text-[10px] tracking-wider text-[#65748A]">
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
                  <tbody className="divide-y divide-slate-100">
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
                              isPending ? 'bg-[#F5F7FA]/70' : ''
                            } hover:bg-[#F5F7FA]/80`}
                          >
                            {/* Member Name and Bed (Checklist #11 & Fix Invisible White Text) */}
                            <td className="py-4 pl-2 font-bold flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 bg-[#EDF2F9] text-slate-800 border border-[#DCE4EF]">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[#293749] font-bold text-sm tracking-tight">{member.name}</span>
                                  {(member.name.includes('(You)') || member.name.includes('(Lead)')) && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-900 text-white">
                                      Lead
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] block font-mono text-[#65748A]">
                                  Bed {member.id} • {activeRoomHierarchy.roomNo}
                                </span>
                              </div>
                            </td>

                            {/* Status Pill */}
                            <td className="py-4">
                              {isSubmitted && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-slate-900 text-white shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                  Submitted
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-[#EDF2F9] text-slate-700 border border-slate-300">
                                  <AlertCircle className="w-3.5 h-3.5 text-[#65748A]" />
                                  Pending
                                </span>
                              )}
                              {isOnLeave && (
                                <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300">
                                  <Home className="w-3.5 h-3.5 text-amber-600" />
                                  On Leave
                                </span>
                              )}
                            </td>

                            {/* Breakfast Quick Toggle (Checklist #12) */}
                            <td className="py-4 text-center">
                              {member.choices?.b === 'Yes' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'b')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-white bg-[#355F97] hover:bg-[#2F5488] px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Skip"
                                >
                                  <Check className="w-3 h-3" /> Eat
                                </button>
                              ) : member.choices?.b === 'No' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'b')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Eat"
                                >
                                  <X className="w-3 h-3" /> Skip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'b')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-mono text-xs text-slate-400 font-bold px-2 py-0.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                                  title="Click to set Eat"
                                >
                                  -
                                </button>
                              )}
                            </td>

                            {/* Lunch Quick Toggle (Checklist #12) */}
                            <td className="py-4 text-center">
                              {member.choices?.l === 'Yes' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'l')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-white bg-[#355F97] hover:bg-[#2F5488] px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Skip"
                                >
                                  <Check className="w-3 h-3" /> Eat
                                </button>
                              ) : member.choices?.l === 'No' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'l')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Eat"
                                >
                                  <X className="w-3 h-3" /> Skip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'l')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-mono text-xs text-slate-400 font-bold px-2 py-0.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                                  title="Click to set Eat"
                                >
                                  -
                                </button>
                              )}
                            </td>

                            {/* Snacks Quick Toggle (Checklist #12) */}
                            <td className="py-4 text-center">
                              {member.choices?.s === 'Yes' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 's')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-white bg-[#355F97] hover:bg-[#2F5488] px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Skip"
                                >
                                  <Check className="w-3 h-3" /> Eat
                                </button>
                              ) : member.choices?.s === 'No' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 's')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Eat"
                                >
                                  <X className="w-3 h-3" /> Skip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 's')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-mono text-xs text-slate-400 font-bold px-2 py-0.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                                  title="Click to set Eat"
                                >
                                  -
                                </button>
                              )}
                            </td>

                            {/* Dinner Quick Toggle (Checklist #12) */}
                            <td className="py-4 text-center">
                              {member.choices?.d === 'Yes' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'd')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-white bg-[#355F97] hover:bg-[#2F5488] px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Skip"
                                >
                                  <Check className="w-3 h-3" /> Eat
                                </button>
                              ) : member.choices?.d === 'No' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'd')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-bold text-xs text-slate-700 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl shadow-xs inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Click to toggle Eat"
                                >
                                  <X className="w-3 h-3" /> Skip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleQuickMeal(member, 'd')}
                                  disabled={!isEditingWindowActive || isOnLeave}
                                  className="font-mono text-xs text-slate-400 font-bold px-2 py-0.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
                                  title="Click to set Eat"
                                >
                                  -
                                </button>
                              )}
                            </td>

                            {/* Submission Time / Notes */}
                            <td className="py-4">
                              <span className="font-mono text-xs text-slate-600">
                                {member.time || 'Awaiting'}
                              </span>
                              {member.editedByLead && (
                                <span className="block text-[10px] text-slate-700 font-semibold mt-0.5">
                                  ✏️ Edited by Lead ({member.leadEditTime || member.time})
                                </span>
                              )}
                              {member.note && (
                                <p className="text-[10px] text-[#65748A] font-medium truncate max-w-[140px] mt-0.5">
                                  {member.note}
                                </p>
                              )}
                            </td>

                            {/* Lead Actions: Time-Bounded Edit, Remind, or Mark On Leave (Checklist #12) */}
                            <td className="py-4 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit / Assist Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(member)}
                                  disabled={!isEditingWindowActive}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                                    !isEditingWindowActive
                                      ? 'opacity-50 cursor-not-allowed bg-[#EDF2F9] border border-[#DCE4EF] text-slate-400'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                                  }`}
                                  title={isEditingWindowActive ? 'Open Assisted Order Form' : 'Editing Locked after Cutoff'}
                                >
                                  {isEditingWindowActive ? (
                                    <Edit3 className="w-3.5 h-3.5 text-slate-300" />
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
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                                    title="Send Reminder Nudge"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Remind</span>
                                  </button>
                                )}

                                {/* Mark On Leave / Resume Button (Checklist #12 & #13) */}
                                <button
                                  type="button"
                                  onClick={() => (isOnLeave ? handleRestoreFromLeave(member) : markMemberOnLeave(member.id))}
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border shadow-xs ${
                                    isOnLeave
                                      ? 'bg-[#EDF2F9] border-[#A9C3E4] text-[#2B4F80] hover:bg-[#D5E4F8]'
                                      : 'bg-white border-[#DCE4EF] text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800'
                                  }`}
                                  title={isOnLeave ? 'Restore to hostel mess roster' : 'Mark as On Leave / Home Visit'}
                                >
                                  <Home className="w-3.5 h-3.5" />
                                  <span>{isOnLeave ? 'Resume' : 'Leave'}</span>
                                </button>
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
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 ">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EDF2F9]  text-slate-800  flex items-center justify-center font-bold">
                      <Bell className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Floor Incharge Alerts & Notifications</h2>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        Direct communication channel between Floor Incharge (Prof. Sharma) and Room D-101 Lead.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRoomLeadNotificationsRead}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800    text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-slate-300 " />
                      <span>Mark All Acknowledged</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearRoomLeadNotifications}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
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
                      <p className={`text-xs mt-1 max-w-sm mx-auto ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                        No pending reminders from Floor Incharge. All notices sent to Room D-101 will appear here.
                      </p>
                    </div>
                  ) : (
                    roomLeadNotifications.map((notif) => {
                      const isPrincipal = notif.type === 'principal' || notif.sender?.includes('Principal');
                      const isBlock = notif.type === 'block' || notif.sender?.includes('Block');
                      const isKitchen = notif.type === 'kitchen' || notif.sender?.includes('Mess') || notif.sender?.includes('Chef');

                      return (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isPrincipal
                              ? darkMode
                                ? 'bg-amber-950/30 border-amber-800/80 shadow-xs'
                                : 'bg-amber-50/90 border-amber-300/90 shadow-xs'
                              : !notif.read
                              ? darkMode
                                ? 'bg-slate-800/80 border-slate-700 shadow-xs'
                                : 'bg-[#EDF2F9] border-slate-300 shadow-xs'
                              : darkMode
                              ? 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                              : 'bg-white border-[#DCE4EF] text-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isPrincipal && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 border border-amber-400">
                                  🏛️ Principal Directive
                                </span>
                              )}
                              {isBlock && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#355F97] text-white border border-[#4573AC]">
                                  🏢 Block Coordinator
                                </span>
                              )}
                              {isKitchen && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white border border-orange-500">
                                  🍳 Mess Kitchen
                                </span>
                              )}
                              {!isPrincipal && !isBlock && !isKitchen && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white  ">
                                  👨‍🏫 Floor Incharge
                                </span>
                              )}
                              {!notif.read && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                                  Unread
                                </span>
                              )}
                              <span className="font-bold text-sm text-[#293749] ">
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
                            darkMode ? 'border-slate-700/60' : 'border-[#DCE4EF]/80'
                          }`}>
                            <div className="flex items-center gap-2 text-[#65748A]  text-[11px]">
                              <span>Dispatched by: <strong className="text-slate-800 ">{notif.sender || 'Prof. Sharma'}</strong></span>
                              <span>•</span>
                              <span>Target: <strong>Room D-101</strong></span>
                            </div>

                            <div className="flex items-center gap-2">
                              {!notif.read ? (
                                <button
                                  type="button"
                                  onClick={() => markRoomLeadNotificationRead(notif.id)}
                                  className="bg-slate-900 hover:bg-slate-800    text-white font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Acknowledge Notice</span>
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-slate-700  flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 " />
                                  Acknowledged by Lead
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Reply to Incharge Box with Target Selector */}
                <form onSubmit={handleSendQuickReply} className="mt-6 pt-5 border-t border-slate-100 ">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-bold text-slate-700 ">
                      Send Direct Response / Communication
                    </label>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-[#65748A] text-[11px]">Recipient:</span>
                      <select
                        value={replyTarget}
                        onChange={(e) => setReplyTarget(e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold focus:outline-none cursor-pointer ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#EDF2F9] border-[#DCE4EF] text-slate-800'
                        }`}
                      >
                        <option value="Floor Incharge (Prof. Sharma)">Floor Incharge (Prof. Sharma)</option>
                        <option value="Block Coordinator (Nithin)">Block Coordinator (Nithin)</option>
                        <option value="Principal's Office (Dr. Roy)">Principal's Office (Dr. Roy)</option>
                        <option value="Mess Kitchen (Chef Ramesh)">Mess Kitchen (Chef Ramesh)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`e.g. Verified with Room D-101 members, requirements locked!`}
                      value={quickReplyText}
                      onChange={(e) => setQuickReplyText(e.target.value)}
                      className={`flex-1 p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-slate-900  ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-[#F5F7FA] border-[#DCE4EF] text-[#293749]'
                      }`}
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800    text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
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
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 ">
                  <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5 text-slate-700 " />
                      Tomorrow's Room D-101 Kitchen Demand Requisition
                    </h2>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Aggregated hostel mess meal portions requested by all 5 roommates in Room D-101 for tomorrow.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToast('Room D-101 culinary requisition slip exported!', 'success')}
                      className="bg-slate-900 hover:bg-slate-800    text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Slip</span>
                    </button>
                  </div>
                </div>

                {/* Two-Way System Status Bar (Mess Kitchen & Block Consolidation Status) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isKitchenConfirmed
                      ? 'bg-[#EDF2F9]/80 border-[#D5E4F8] text-[#243F66]   '
                      : 'bg-amber-50/80 border-amber-200 text-amber-900   '
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <CookingPot className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">
                          {isKitchenConfirmed ? 'Kitchen Cooking Confirmed' : 'Requisition In Queue'}
                        </span>
                        <span className="text-[11px] opacity-80 block">
                          {isKitchenConfirmed
                            ? 'Chef Ramesh verified Floor 1 meal requisitions for prep.'
                            : 'Floor headcount sheet transmitted to Mess Kitchen.'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-white/70 ">
                      {isKitchenConfirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    blockConsolidatedSent
                      ? 'bg-[#EDF2F9]/80 border-[#D5E4F8] text-[#243F66]   '
                      : 'bg-[#F5F7FA] border-[#DCE4EF] text-slate-700   '
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">
                          {blockConsolidatedSent ? 'Block D & E Forwarded' : 'Block Consolidation Active'}
                        </span>
                        <span className="text-[11px] opacity-80 block">
                          {blockConsolidatedSent
                            ? 'Block Coordinator verified and forwarded final counts to Mess.'
                            : 'Consolidation window active until 10:00 PM cutoff.'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-white/70 ">
                      {blockConsolidatedSent ? 'Forwarded' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* 4 Detailed Meal Cards with Live Mess Menu Dishes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {mealSummary.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.meal}
                        className={`p-5 rounded-2xl border flex flex-col justify-between ${
                          darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]/80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#65748A] ">
                              {item.meal}
                            </span>
                            <span className="p-2 rounded-xl bg-[#EDF2F9]  text-slate-700 ">
                              <Icon className="w-4 h-4" />
                            </span>
                          </div>
                          <p className="text-3xl font-black text-[#293749] ">
                            {item.count}{' '}
                            <span className="text-sm font-normal text-slate-400">
                              / {totalMembers} Meals
                            </span>
                          </p>
                          <p className="text-xs font-semibold mt-2 text-slate-700 ">
                            {item.menuItem}
                          </p>
                        </div>
                        <div className={`mt-4 pt-3 border-t text-[11px] font-mono text-[#65748A] ${
                          darkMode ? 'border-slate-700' : 'border-[#DCE4EF]'
                        }`}>
                          Serving: {item.timing}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Mess Incharge Published Menu Strip */}
                <div className={`mt-6 p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-800/30 border-slate-700 text-slate-300' : 'bg-[#F5F7FA] border-[#DCE4EF] text-slate-700'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-[#355F97] " />
                      Mess Incharge Published Dishes for Tomorrow
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-[#EDF2F9] text-[#2B4F80] border border-[#D5E4F8] px-2 py-0.5 rounded-full  ">
                      Live Kitchen Sync
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mt-2">
                    <div className="p-2.5 rounded-xl border bg-white/60 ">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">Breakfast</span>
                      <strong className="block text-slate-800 ">{menu?.breakfast || 'Masala Dosa / Poha with Chai'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl border bg-white/60 ">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">Lunch</span>
                      <strong className="block text-slate-800 ">{menu?.lunch || 'Rajma Chawal Thali & Paneer'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl border bg-white/60 ">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">Snacks</span>
                      <strong className="block text-slate-800 ">{menu?.snacks || 'Samosa & Hot Chai'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl border bg-white/60 ">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">Dinner</span>
                      <strong className="block text-slate-800 ">{menu?.dinner || 'Roti, Dal, Rice & Chicken/Paneer'}</strong>
                    </div>
                  </div>
                </div>

                {/* Dietary & Allergies Advisory Box */}
                <div className={`mt-4 p-4 rounded-2xl border ${
                  darkMode ? 'bg-slate-800/30 border-slate-700 text-slate-300' : 'bg-[#F5F7FA] border-[#DCE4EF] text-slate-700'
                }`}>
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-700 " />
                    Special Dietary Notes for Room D-101
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Room D-101 includes 1 student fasting/observing late dinner (Priya Sundaram) and assisted orders. The hostel mess head chef receives this consolidated count automatically at the 10:00 PM cutoff.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EDITING WINDOW & CUTOFF TIMELINE */}
          {activeTab === 'Editing Window' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE4EF]/90'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 ">
                  <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-700 " />
                      Room Lead Cutoff & Editing Window Rules
                    </h2>
                    <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-[#65748A]'}`}>
                      Lead privilege window allows Room D-101 lead to submit or modify roommate meal choices until 10:00 PM.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                      isEditingWindowActive
                        ? 'bg-slate-900 text-white   border-transparent shadow-xs'
                        : 'bg-[#EDF2F9] text-slate-800 border-slate-300   '
                    }`}>
                      {isEditingWindowActive ? <Unlock className="w-3.5 h-3.5 text-white " /> : <Lock className="w-3.5 h-3.5 text-slate-600 " />}
                      {isEditingWindowActive ? 'Window Active' : 'Window Locked'}
                    </span>
                  </div>
                </div>

                {/* Big Live Countdown Banner */}
                <div className={`my-6 p-6 rounded-2xl border text-center ${
                  darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]'
                }`}>
                  <p className="text-xs uppercase tracking-widest font-bold text-[#65748A] mb-1">
                    Live Cutoff Countdown
                  </p>
                  <p className="text-4xl sm:text-5xl font-mono font-black text-[#293749]  my-2">
                    {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Tonight at 10:00 PM • Kitchen order lock for Hostel Block D
                  </p>
                </div>

                {/* Timeline Milestones */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#65748A]">
                    Hostel Mess Daily Cutoff Pipeline
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]'}`}>
                      <span className="font-mono font-bold text-[#65748A] block mb-0.5">06:00 PM</span>
                      <strong className="block text-slate-800 ">Student Self-Booking</strong>
                      <span className="text-[11px] text-[#65748A]">Individual student window closes</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900 text-white  ">
                      <span className="font-mono font-bold text-slate-300  block mb-0.5">10:00 PM (Active)</span>
                      <strong className="block text-white ">Room Lead Proxy Window</strong>
                      <span className="text-[11px] text-slate-300 ">Assists and locks room roster</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]'}`}>
                      <span className="font-mono font-bold text-[#65748A] block mb-0.5">10:30 PM</span>
                      <strong className="block text-slate-800 ">Floor Incharge Rollup</strong>
                      <span className="text-[11px] text-[#65748A]">Prof. Sharma finalizes Floor 2</span>
                    </div>
                    <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-[#F5F7FA] border-[#DCE4EF]'}`}>
                      <span className="font-mono font-bold text-[#65748A] block mb-0.5">11:00 PM</span>
                      <strong className="block text-slate-800 ">Kitchen Production</strong>
                      <span className="text-[11px] text-[#65748A]">Procurement & prep starts</span>
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
          <div className="max-w-md w-full rounded-3xl border border-[#DCE4EF] bg-white shadow-2xl p-6 text-[#293749] transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4EF]">
              <div>
                <h3 className="font-black text-lg flex items-center gap-2 text-[#293749]">
                  <Edit3 className="w-5 h-5 text-slate-700" />
                  {editingMember.status === 'Submitted' ? 'Edit Meal Choices' : 'Assist Roommate Order'}
                </h3>
                <p className="text-xs mt-0.5 text-[#65748A]">
                  Active Lead Window: Modifying order for <strong className="text-[#293749]">{editingMember.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssistedBooking} className="mt-5 space-y-4">
              {/* Breakfast Choice */}
              <div className="p-3.5 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#293749]">Breakfast (07:30 - 09:30 AM)</p>
                  <p className="text-[11px] text-[#65748A]">
                    Masala Dosa / Poha with Chai
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, b: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.b === 'Yes'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, b: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.b === 'No'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Lunch Choice */}
              <div className="p-3.5 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#293749]">Lunch (12:30 - 02:30 PM)</p>
                  <p className="text-[11px] text-[#65748A]">
                    Rajma Chawal Thali & Paneer
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, l: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.l === 'Yes'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, l: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.l === 'No'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Snacks Choice */}
              <div className="p-3.5 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#293749]">Evening Snacks (05:00 - 06:00 PM)</p>
                  <p className="text-[11px] text-[#65748A]">
                    Samosa & Hot Chai
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, s: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.s === 'Yes'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, s: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.s === 'No'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Dinner Choice */}
              <div className="p-3.5 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#293749]">Dinner (07:30 - 09:30 PM)</p>
                  <p className="text-[11px] text-[#65748A]">
                    Roti, Dal, Rice & Chicken/Paneer
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, d: 'Yes' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.d === 'Yes'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Eat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedChoices((prev) => ({ ...prev, d: 'No' }))}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      assistedChoices.d === 'No'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-white border border-[#DCE4EF] text-slate-600 hover:bg-[#EDF2F9]'
                    }`}
                  >
                    Skip
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">
                  Lead Edit Reason / Dietary Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requested via call, exam schedule, fasting..."
                  value={assistedNote}
                  onChange={(e) => setAssistedNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#DCE4EF] bg-[#F5F7FA] text-[#293749] text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Submit Action Buttons */}
              <div className="pt-3 border-t border-[#DCE4EF] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EDF2F9] hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
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
          <div className="max-w-md w-full rounded-3xl border border-[#DCE4EF] bg-white shadow-2xl p-6 text-[#293749] transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4EF]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-slate-700" />
                <h3 className="font-black text-lg">Room WhatsApp Nudge</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                Copy this pre-formatted reminder and paste it directly into your {activeRoomHierarchy.roomNo} WhatsApp group:
              </p>

              {/* Pre-formatted message card */}
              <div className="p-4 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] text-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {broadcastText}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EDF2F9] hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCopyBroadcast}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  Copy Reminder Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK MARK HOME LEAVE / RESUME (Checklist #13) */}
      {showQuickLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl border border-[#DCE4EF] bg-white shadow-2xl p-6 text-[#293749] transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE4EF]">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-lg">Mark Roommate on Home Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickLeaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 mb-4 leading-relaxed">
              When a roommate is marked on Home Leave, their daily food selections are zeroed out in the hostel mess kitchen requisition to prevent food waste.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {roomMembers.map((member) => {
                const isOnLeave = member.status === 'On Leave';
                return (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl border border-[#DCE4EF] bg-[#F5F7FA] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#293749]">{member.name}</p>
                      <p className="text-[11px] font-mono text-[#65748A]">
                        Bed {member.id} • Status: {member.status}
                      </p>
                    </div>
                    {isOnLeave ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleRestoreFromLeave(member);
                          setShowQuickLeaveModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#355F97] hover:bg-[#2F5488] text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                      >
                        Restore Present
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          markMemberOnLeave(member.id);
                          setShowQuickLeaveModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Mark Leave</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-[#DCE4EF] flex justify-end">
              <button
                type="button"
                onClick={() => setShowQuickLeaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EDF2F9] hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component as default export
export default RoomLeadDashboard;

