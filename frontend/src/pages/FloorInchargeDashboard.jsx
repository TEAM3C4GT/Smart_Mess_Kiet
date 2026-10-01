// Import core React hooks for component state, side effects, and memoization
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the shared top navigation bar component
import { Navbar } from '../components/Navbar';

// Import the shared collapsible sidebar menu component
import { Sidebar } from '../components/Sidebar';

// Import the custom hook to access global application state & actions
import { useApp } from '../context/AppContext';

// Import icons from lucide-react for tabs, buttons, status indicators, and alerts
import {
  LayoutDashboard,    // Icon for the main Dashboard overview tab
  Building2,          // Icon representing the Hostel Floor / Building structure
  AlertTriangle,      // Warning icon for low participation alerts
  FileText,           // Icon for reports and summary sheets
  Bell,               // Notification bell icon for reminder triggers
  Flag,               // Flag icon for marking non-compliant or flagged rooms
  BarChart2,          // Icon for analytics and meal statistics
  CheckCircle2,       // Green verified badge icon for completed meal bookings
  Users,              // Icon representing room leads and students
  Utensils,           // Fork and knife icon representing mess meal counts
  Clock,              // Clock icon representing meal cutoff deadlines
  ShieldCheck,        // Badge icon for official Floor Incharge designation
  X,                  // Close button icon for popups/modals
  Search,             // Magnifying glass icon for room search bar
  Check,              // Checkmark icon for confirmations
  Sun,                // Light mode toggle icon
  Moon,               // Dark mode toggle icon
  Coffee,             // Icon representing evening snacks meal
  SlidersHorizontal,  // Icon for filter and adjustment controls
  ArrowRight,         // Navigation arrow icon
  TrendingUp,         // Icon representing upward participation trends
  Download,           // Export / download report icon
  Calendar,           // Calendar icon indicating meal planning date
  BedDouble,          // Icon representing hostel rooms
  Send,               // Send action icon
  ChefHat,            // Chef Hat icon for kitchen menu feed
  Sparkles            // Sparkles icon
} from 'lucide-react';

// Import Recharts components for building dynamic SVG bar charts
import {
  BarChart,            // Root container for bar charts
  Bar,                 // The graphical bar representing numerical values
  XAxis,               // Horizontal axis displaying labels (e.g., room names, meals)
  YAxis,               // Vertical axis showing numbers and percentages
  Tooltip,             // Hover tooltip displaying exact data on mouse over
  ResponsiveContainer, // Makes charts resize fluidly to fit parent screen width
  Cell,                // Allows individual coloring for specific bars
  CartesianGrid,       // Background gridlines for easier readability
  ReferenceLine        // Target or threshold benchmark line (e.g. 60% cutoff)
} from 'recharts';

// Main Floor Incharge Dashboard functional component
export const FloorInchargeDashboard = () => {
  // State: Tracks currently selected navigation tab (defaults to 'Room & Floor Monitoring')
  const [activeTab, setActiveTab] = useState('Room & Floor Monitoring');

  // State: Stores user input text from the search input box
  const [searchTerm, setSearchTerm] = useState('');

  // State: Filter mode for rooms ('all', 'completed', 'pending', or 'low')
  const [roomFilter, setRoomFilter] = useState('all');

  // State: Controls dark mode theme toggle (false = light theme, true = dark theme)
  const [darkMode, setDarkMode] = useState(false);

  // Effect: Syncs document body background color whenever dark mode is toggled
  useEffect(() => {
    // If dark mode is active, set background color to deep slate
    if (darkMode) {
      document.body.style.backgroundColor = '#0f172a';
    } else {
      // Otherwise, set background color to soft clean light slate
      document.body.style.backgroundColor = '#f8fafc';
    }
    // Cleanup function: Reverts body background to default when component unmounts
    return () => {
      document.body.style.backgroundColor = '#f8fafc';
    };
  }, [darkMode]); // Dependency array: only re-run when darkMode changes

  // Extract shared state and action functions from the AppContext
  const {
    currentUser,              // Currently authenticated user object (Prof. Sharma)
    logout,                   // Action to log out user
    floorRooms = [],          // Array of rooms located on Floor with stats
    roomMembers = [],         // Real-time room members from Room Lead
    floorMealRequirements,    // Meal count breakdowns (Breakfast, Lunch, etc.)
    remindRoomLead,           // Action to send an instant reminder notification to a room lead
    flagRoom,                 // Action to toggle the disciplinary/escalation flag on a room
    addToast,                 // Action to show floating toast alert banners
    floorInchargeAlerts = [], // Incoming urgent cutoff alerts from Block Coordinator
    dismissFloorAlert,        // Action to acknowledge/dismiss alert
    menu,                     // Published daily mess menu from kitchen
    sendFloorMealSheetToMess, // Action to submit floor headcount sheet to mess kitchen
    floorMealSheets = []      // Floor meal sheets sent to mess kitchen
  } = useApp();

  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Default selected floor from current user badge or fallback to 'floor-d1'
  const initialFloor = useMemo(() => {
    const badge = currentUser?.badge || '';
    if (badge.includes('Floor 2') && badge.includes('Block D')) return 'floor-d2';
    if (badge.includes('Floor 1') && badge.includes('Block E')) return 'floor-e1';
    if (badge.includes('Floor 2') && badge.includes('Block E')) return 'floor-e2';
    if (badge.includes('Floor 1') && badge.includes('Block D')) return 'floor-d1';
    return 'floor-d1';
  }, [currentUser]);

  const [activeFloorScope, setActiveFloorScope] = useState(initialFloor);

  useEffect(() => {
    setActiveFloorScope(initialFloor);
  }, [initialFloor]);

  // Dynamically resolve floor designation & assigned block
  const floorConfig = useMemo(() => {
    switch (activeFloorScope) {
      case 'floor-d2':
        return { name: 'Floor 2 Incharge', block: 'Hostel Block D', prefix: 'D-2', label: 'Floor 2 (Block D)' };
      case 'floor-e1':
        return { name: 'Floor 1 Incharge', block: 'Hostel Block E', prefix: 'E-1', label: 'Floor 1 (Block E)' };
      case 'floor-e2':
        return { name: 'Floor 2 Incharge', block: 'Hostel Block E', prefix: 'E-2', label: 'Floor 2 (Block E)' };
      case 'all':
        return { name: 'Supervising All Floors', block: 'Campus Hostels', prefix: '', label: 'All Campus Floors' };
      case 'floor-d1':
      default:
        return { name: 'Floor 1 Incharge', block: 'Hostel Block D', prefix: 'D-1', label: 'Floor 1 (Block D)' };
    }
  }, [activeFloorScope]);

  const assignedFloor = floorConfig.name;
  const assignedBlock = floorConfig.block;

  // Filter rooms belonging to the active floor
  const scopedRooms = useMemo(() => {
    if (!floorConfig.prefix) return floorRooms;
    return floorRooms.filter((r) => r.roomNo.includes(floorConfig.prefix));
  }, [floorRooms, floorConfig.prefix]);

  // Computed: Total number of rooms assigned to this floor
  const totalRooms = scopedRooms.length || 0;

  // Computed: Total number of students living on this floor (sum of all room members)
  const totalStudents = scopedRooms.reduce((acc, r) => acc + (r.members || 0), 0) || 0;

  // Computed: Number of students who have already submitted their meal selections
  const submittedStudents = scopedRooms.reduce((acc, r) => acc + (r.submitted || 0), 0) || 0;

  // Computed: Number of students who are still pending meal submission
  const pendingStudents = Math.max(0, totalStudents - submittedStudents);

  // Computed: Overall percentage of students who submitted meals on this floor
  const participationPercentage = totalStudents > 0 ? Math.round((submittedStudents / totalStudents) * 100) : 0;

  // Computed: Number of rooms where 100% of residents have submitted meal choices
  const completedRoomsCount = scopedRooms.filter((r) => r.submitted === r.members).length;

  // Computed: Number of rooms that still have pending meal submissions
  const pendingRoomsCount = scopedRooms.filter((r) => r.submitted < r.members).length;

  // Filter out rooms that have less than 60% meal participation or are explicitly flagged
  const lowParticipationRooms = scopedRooms.filter((r) => r.rate < 60 || r.flagged);

  // Dynamic meal requirements for the floor (calculated from live roomMembers and scoped rooms)
  const mealReqs = useMemo(() => {
    if (activeFloorScope === 'floor-d1' || (!activeFloorScope && floorConfig.prefix === 'D-1')) {
      const d101B = roomMembers.filter(m => m.status !== 'On Leave' && m.choices?.b === 'Yes').length;
      const d101L = roomMembers.filter(m => m.status !== 'On Leave' && m.choices?.l === 'Yes').length;
      const d101S = roomMembers.filter(m => m.status !== 'On Leave' && m.choices?.s === 'Yes').length;
      const d101D = roomMembers.filter(m => m.status !== 'On Leave' && m.choices?.d === 'Yes').length;

      // Room D-102 baseline
      const bCount = Math.min(totalStudents, d101B + 5);
      const lCount = Math.min(totalStudents, d101L + 5);
      const sCount = Math.min(totalStudents, d101S + 4);
      const dCount = Math.min(totalStudents, d101D + 5);

      return {
        breakfast: { selected: bCount, total: totalStudents || 10, percentage: totalStudents > 0 ? Math.round((bCount / totalStudents) * 100) : 0 },
        lunch: { selected: lCount, total: totalStudents || 10, percentage: totalStudents > 0 ? Math.round((lCount / totalStudents) * 100) : 0 },
        snacks: { selected: sCount, total: totalStudents || 10, percentage: totalStudents > 0 ? Math.round((sCount / totalStudents) * 100) : 0 },
        dinner: { selected: dCount, total: totalStudents || 10, percentage: totalStudents > 0 ? Math.round((dCount / totalStudents) * 100) : 0 }
      };
    }

    return {
      breakfast: { selected: submittedStudents, total: totalStudents || 10, percentage: participationPercentage },
      lunch: { selected: submittedStudents, total: totalStudents || 10, percentage: participationPercentage },
      snacks: { selected: Math.round(submittedStudents * 0.8), total: totalStudents || 10, percentage: Math.round(participationPercentage * 0.8) },
      dinner: { selected: submittedStudents, total: totalStudents || 10, percentage: participationPercentage }
    };
  }, [activeFloorScope, floorConfig.prefix, roomMembers, submittedStudents, totalStudents, participationPercentage]);

  // Computed: Total number of meals booked for tomorrow across all 4 dining sessions
  const totalMealsBooked =
    (mealReqs.breakfast?.selected || 0) +
    (mealReqs.lunch?.selected || 0) +
    (mealReqs.snacks?.selected || 0) +
    (mealReqs.dinner?.selected || 0);

  // Sidebar navigation items: Unified Room & Floor Monitoring (Dashboard merged into primary view)
  const sidebarItems = [
    { name: 'Room & Floor Monitoring', icon: Users },          // Combined Room leads, monitoring & floor overview
    { name: 'Meal Requirement', icon: Utensils },              // Breakfast, Lunch, Snacks, Dinner counts
    { name: 'Low Participation', icon: AlertTriangle },        // Rooms below compliance threshold
    { name: 'Reports', icon: FileText }                        // Mess participation & kitchen order reports
  ];

  // Memoized filter calculation: Filters room list by search query and selected filter category
  const filteredRooms = useMemo(() => {
    return scopedRooms.filter((r) => {
      // Check if room number or lead name matches the user's search text (case-insensitive)
      const matchesSearch =
        r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lead.toLowerCase().includes(searchTerm.toLowerCase());

      // If search text doesn't match, exclude this room immediately
      if (!matchesSearch) return false;

      // Filter by completion status
      const isCompleted = r.submitted === r.members;

      // If user selected 'completed' filter, only show rooms where all students submitted
      if (roomFilter === 'completed') return isCompleted;

      // If user selected 'pending' filter, only show rooms awaiting submissions
      if (roomFilter === 'pending') return !isCompleted;

      // If user selected 'low' filter, only show rooms below 60% participation or flagged
      if (roomFilter === 'low') return r.rate < 60 || r.flagged;

      // Otherwise, show all rooms that matched the search query
      return true;
    });
  }, [floorRooms, searchTerm, roomFilter]);

  // Handler: Sends reminder notifications to all room leads whose rooms have pending submissions
  const handleRemindAllPending = () => {
    const pendingRooms = floorRooms.filter((r) => r.submitted < r.members);
    if (pendingRooms.length === 0) {
      addToast('All rooms have submitted their meal bookings!', 'info');
      return;
    }
    pendingRooms.forEach((room) => {
      remindRoomLead(room.roomNo, room.lead);
    });
    addToast(`Meal booking reminders sent to ${pendingRooms.length} room leads!`, 'success');
  };

  // Handler: Sends reminder notifications to all room leads whose rooms have low participation
  const handleRemindAllLow = () => {
    // If no rooms are currently below threshold, inform the incharge with an info toast
    if (lowParticipationRooms.length === 0) {
      addToast('All rooms meet the submission threshold!', 'info');
      return;
    }
    // Loop through each non-compliant room and dispatch reminder to its lead
    lowParticipationRooms.forEach((room) => {
      remindRoomLead(room.roomNo, room.lead);
    });
    // Display success toast notification with the total count of leads reminded
    addToast(`Reminders sent to ${lowParticipationRooms.length} room leads!`, 'success');
  };

  // Render the visual interface
  return (
    // Top-level page container with minimum full screen height and dynamic dark/light background
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/80 text-slate-900'}`}>

      {/* 1. Universal Top Navigation Bar */}
      <Navbar
        currentRole="Floor Incharge"                   // Displays 'Floor Incharge' role badge in header
        activeTab={activeTab}                          // Passes currently selected tab
        onTabChange={setActiveTab}                     // Callback when user clicks a nav tab in header
        darkMode={darkMode}                            // Passes current dark mode state
        onToggleDarkMode={() => setDarkMode((prev) => !prev)} // Callback to flip dark mode on/off
      />

      {/* Main body flex layout: Sidebar on the left (on desktop) and main content on the right */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* 2. Left-hand Collapsible Navigation Sidebar */}
        <Sidebar
          items={sidebarItems}                         // Passes the 7 navigation tab definitions
          activeTab={activeTab}                        // Currently active tab to highlight with active styling
          onTabChange={setActiveTab}                   // Callback to switch tabs when user clicks an item
          darkMode={darkMode}                          // Ensures sidebar matches current theme
          onLogout={handleSignOut}                     // Dispatches user sign-out to login
        />

        {/* 3. Main Dashboard Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">

          {/* Main Dashboard Hero Banner & 4 Primary KPI Metric Cards - Displayed on Room & Floor Monitoring */}
          {activeTab === 'Room & Floor Monitoring' || activeTab === 'Room Monitoring' || activeTab === 'Floor Overview' || activeTab === 'Dashboard' ? (
            <>
              {/* Live Alert Banner from Block Coordinator */}
              {floorInchargeAlerts.length > 0 && (
                <div className="space-y-3 mb-6">
                  {floorInchargeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                          <AlertTriangle className="w-5 h-5 animate-bounce" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs uppercase tracking-wide text-amber-800 dark:text-amber-300">
                              🚨 Urgent Cutoff Alert from {alert.sender}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-semibold">
                              {alert.time}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => dismissFloorAlert(alert.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Header Banner - Executive Hero Card with Floor Badge, Title & Quick Actions */}
              <div
                className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all duration-300 relative overflow-hidden ${darkMode
                    ? 'bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-slate-800'
                    : 'bg-gradient-to-br from-white via-slate-50/50 to-white border-slate-200/90'
                  }`}
              >
                {/* Flex container holding title info on left and action buttons on right */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">

                  {/* Left Column: Subtitles, badges, and description */}
                  <div className="space-y-1.5">

                    {/* Horizontal row of pill badges */}
                    <div className="flex flex-wrap items-center gap-2">

                      {/* Badge 1: Assigned Floor designation with shield icon */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${darkMode
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        {assignedFloor}
                      </span>

                      {/* Badge 2: Hostel Block name badge */}
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full border ${darkMode
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                      >
                        {assignedBlock}
                      </span>

                      {/* Badge 3: Current session indicator (Tomorrow's Meal Planning) */}
                      <span className={`text-xs flex items-center gap-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Utensils className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /> Tomorrow's Meal Planning
                      </span>
                    </div>

                    {/* Main Hero Title */}
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {floorConfig.label} Mess Monitoring Hub
                    </h1>

                    {/* Subtitle / Description */}
                    <p className={`text-xs sm:text-sm max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Track room meal submissions, oversee dining participation, and coordinate tomorrow's mess orders for {assignedBlock}.
                    </p>

                    {/* Quick Floor Switcher Pills */}
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Switch Floor:</span>
                      {[
                        { id: 'floor-d1', label: 'Floor 1 (Block D)' },
                        { id: 'floor-d2', label: 'Floor 2 (Block D)' },
                        { id: 'floor-e1', label: 'Floor 1 (Block E)' },
                        { id: 'floor-e2', label: 'Floor 2 (Block E)' },
                        { id: 'all', label: 'All 4 Floors' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setActiveFloorScope(f.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeFloorScope === f.id
                              ? 'bg-[#1b4d3e] text-white shadow-xs'
                              : darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">

                    {/* Button 1: Remind Pending Rooms (Notifies leads of rooms with incomplete submissions) */}
                    {pendingRoomsCount > 0 && (
                      <button
                        onClick={handleRemindAllPending}
                        className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Bell className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                        <span>Remind Pending Rooms ({pendingRoomsCount})</span>
                      </button>
                    )}

                    {/* Button 2: Remind Low Rooms (conditionally rendered only if any low rooms exist) */}
                    {lowParticipationRooms.length > 0 && (
                      <button
                        onClick={handleRemindAllLow} // Dispatches reminders to all low room leads
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Bell className="w-4 h-4 text-slate-300" />
                        <span>Remind Low Rooms ({lowParticipationRooms.length})</span>
                      </button>
                    )}

                    {/* Button 3: Theme Toggle Button (Light Mode / Dark Mode) */}
                    <button
                      onClick={() => setDarkMode((prev) => !prev)} // Toggles darkMode boolean
                      className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${darkMode
                          ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {/* Sun icon in dark mode, Moon icon in light mode */}
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 PRIMARY METRICS CARDS - Tailored for Smart Mess Management */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Assigned Floor Overview (Floor name, block, supervised rooms count) */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}
                >
                  {/* Card top row: Category label and building icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Assigned Floor
                    </span>
                    <span className={`p-2 rounded-xl ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      <Building2 className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Card middle row: Floor number & block title */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black">Floor 2</p>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>• {assignedBlock}</span>
                  </div>

                  {/* Card footer: Subtext indicating total rooms and student residents */}
                  <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{totalRooms} Rooms</strong> under supervision ({totalStudents} residents)
                  </p>
                </div>

                {/* Card 2: Meal Submissions Progress (Submitted count, pending badge, animated progress bar) */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}
                >
                  {/* Card top row: Label and check circle icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Meal Submissions
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Card middle row: Submitted students / Total students + Status badge */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {submittedStudents}{' '}
                      <span className={`text-sm font-normal ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {totalStudents}</span>
                    </p>
                    {/* Dark Status badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${pendingStudents === 0
                          ? 'bg-slate-900 text-white border border-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                    >
                      {pendingStudents === 0 ? 'All Submitted' : `${pendingStudents} Pending`}
                    </span>
                  </div>

                  {/* Horizontal Progress Bar visually indicating completion percentage */}
                  <div className="mt-3">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pendingStudents === 0 ? 'bg-slate-900 dark:bg-white' : 'bg-slate-600 dark:bg-slate-400'
                          }`}
                        style={{ width: `${totalStudents > 0 ? (submittedStudents / totalStudents) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Pending Meal Orders (Pending students count, pending rooms summary) */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}
                >
                  {/* Card top row: Label and clock icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Pending Orders
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Card middle row: Count of students who haven't selected meals */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{pendingStudents}</p>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Students Missing</span>
                  </div>

                  {/* Card footer: Breakdown pill showing pending rooms count and completed rooms */}
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{pendingRoomsCount} Rooms Pending</span>
                    <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>•</span>
                    <span className="text-slate-900 dark:text-white font-bold">{completedRoomsCount} Complete</span>
                  </div>
                </div>

                {/* Card 4: Tomorrow's Kitchen Volume (Total meals booked across all sessions) */}
                <div
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
                    }`}
                >
                  {/* Card top row: Label and utensils food icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Kitchen Requisitions
                    </span>
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      <Utensils className="w-4 h-4" />
                    </span>
                  </div>

                  {/* Card middle row: Total booked meals count and badge */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalMealsBooked}</p>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Meals Booked</span>
                  </div>

                  {/* Card footer: Breakdown across 4 meal sessions */}
                  <p className={`text-xs mt-2 font-medium truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    B: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{mealReqs.breakfast.selected}</strong> • L: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{mealReqs.lunch.selected}</strong> • S: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{mealReqs.snacks.selected}</strong> • D: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{mealReqs.dinner.selected}</strong>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
              }`}
            >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>{assignedBlock}</span>
              <span>•</span>
              <span>{assignedFloor}</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-bold">{activeTab}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('Room & Floor Monitoring')}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
            >
              ← Back to Room & Floor Monitoring
            </button>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
      </div>
          )}

      {/* MAIN SECTION: SMART ROOM MEAL SUBMISSIONS & MONITORING KEYCARDS (Combined Room & Floor Monitoring) */}
      {(activeTab === 'Room & Floor Monitoring' || activeTab === 'Room Monitoring' || activeTab === 'Floor Overview' || activeTab === 'Dashboard') && (
        <section
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Section Header with Search & Filter Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80 dark:border-slate-800">

            {/* Left side: Section title and descriptive subtitle */}
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                {floorConfig.label} Room Meal Submissions
              </h2>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time meal booking progress and student compliance status for all {scopedRooms.length} rooms.
              </p>
            </div>

            {/* Right side: Filter Pills + Search Input controls */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Filter Pills container (All, Completed, Pending, Low Rate) */}
              <div
                className={`flex items-center p-1 rounded-2xl border text-xs font-semibold ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}
              >
                {/* Map through filter tabs dynamically */}
                {[
                  { id: 'all', label: `All (${scopedRooms.length})` },
                  { id: 'completed', label: `Completed (${completedRoomsCount})` },
                  { id: 'pending', label: `Pending (${pendingRoomsCount})` },
                  { id: 'low', label: `Low Rate (${lowParticipationRooms.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRoomFilter(tab.id)} // Updates filter state on click
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${roomFilter === tab.id
                        ? darkMode
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-white text-slate-900 shadow-xs'
                        : darkMode
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Real-time Search Input Box */}
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search room or lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Updates search term on keystroke
                  className={`pl-8 pr-7 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all ${darkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                />
                {/* Clear search 'X' button rendered when text is entered */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')} // Resets search text
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Responsive Grid of Interactive Room Meal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Loop over each filtered room and render its card */}
            {filteredRooms.map((room) => {
              const isCompleted = room.submitted === room.members;
              const isLowRate = room.rate < 60;

              return (
                <div
                  key={room.roomNo}
                  className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between hover:shadow-md ${darkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                >
                  {/* Top Bar: Room Number + Submission Status Badge (Dark High-Contrast Theme) */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {/* Room Number Label */}
                        <span className="font-mono font-black text-lg tracking-tight text-slate-900 dark:text-white">
                          {room.roomNo}
                        </span>
                        {/* Flag badge if flagged */}
                        {room.flagged && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                            Flagged
                          </span>
                        )}
                      </div>

                      {/* Dark High-Contrast Status badge: Slate-900 if 100% booked, Slate-100 if pending */}
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white border border-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-white dark:text-slate-950" />
                          All Booked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                          {room.pending} Pending
                        </span>
                      )}
                    </div>

                    {/* Room Lead Avatar & Name */}
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                          }`}
                      >
                        {room.lead ? room.lead.charAt(0) : 'R'}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{room.lead}</p>
                        <p className={`text-[10px] font-medium truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Room Lead • {room.members} Students
                        </p>
                      </div>
                    </div>

                    {/* Meal Booking Progress Bar & Numbers: Consistently styled with Dark Palette */}
                    <div className={`p-3 rounded-xl mb-3 ${darkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                          <strong>{room.submitted}</strong> / {room.members} Submitted
                        </span>
                        <span
                          className={`text-[11px] font-bold ${isCompleted
                              ? 'text-slate-900 dark:text-white font-extrabold'
                              : 'text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          {room.rate}%
                        </span>
                      </div>
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-slate-900 dark:bg-white' : 'bg-slate-500 dark:bg-slate-400'
                            }`}
                          style={{ width: `${room.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Clean subtitle & Quick Remind Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isCompleted ? 'Target Satisfied' : `${room.pending} missing order${room.pending > 1 ? 's' : ''}`}
                    </span>

                    {/* Remind Lead Button */}
                    <button
                      type="button"
                      onClick={() => remindRoomLead(room.roomNo, room.lead)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      title={`Send reminder to ${room.lead}`}
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>Remind Lead</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRooms.length === 0 && (
            <div className={`p-8 text-center rounded-2xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-sm font-bold">No rooms found matching your search or filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoomFilter('all');
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* MEAL REQUIREMENT SECTION - Culinary Bento Cards */}
      {/* Render if user is on 'Meal Requirement' tab */}
      {activeTab === 'Meal Requirement' && (
        <section
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Section Header: Title & Transmit to Kitchen action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Utensils className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Tomorrow's Floor Meal Requirements ({floorConfig.label})
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Consolidated meal bookings for {floorConfig.label} students sent directly to the Main Mess Kitchen for cooking preparation.
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              {floorMealSheets.some((s) => s.floor.includes(floorConfig.prefix || 'Floor 1') && s.status === 'Confirmed by Kitchen') ? (
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Kitchen Confirmed for Cooking
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => sendFloorMealSheetToMess(floorConfig.label, mealReqs)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Transmit Sheet to Mess Kitchen</span>
                </button>
              )}
              {/* Total Residents pill */}
              <span
                className={`text-xs font-bold px-3 py-1.5 rounded-full border w-fit ${darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
              >
                Floor Total: {totalStudents} Residents
              </span>
            </div>
          </div>

          {/* 4 Bento Grid Cards for Breakfast, Lunch, Snacks, and Dinner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Breakfast',
                icon: Sun,
                time: '07:30 – 09:30 AM',
                data: mealReqs.breakfast,
                color: '#0f172a' // Dark Slate 900
              },
              {
                name: 'Lunch',
                icon: Utensils,
                time: '12:30 – 02:30 PM',
                data: mealReqs.lunch,
                color: '#1e293b' // Deep Slate 800
              },
              {
                name: 'Snacks',
                icon: Coffee,
                time: '05:00 – 06:00 PM',
                data: mealReqs.snacks,
                color: '#334155' // Slate 700
              },
              {
                name: 'Dinner',
                icon: Moon,
                time: '07:30 – 09:30 PM',
                data: mealReqs.dinner,
                color: '#475569' // Slate 600
              }
            ].map((meal) => {
              const Icon = meal.icon;
              // Circular geometry constants for SVG Donut Gauge
              const radius = 20;
              const circumference = 2 * Math.PI * radius; // 2 * PI * r
              // Offset calculations to fill percentage of ring
              const strokeDashoffset = circumference - (meal.data.percentage / 100) * circumference;
              // Count of residents who skipped this meal
              const optedOut = Math.max(0, totalStudents - meal.data.selected);

              return (
                <div
                  key={meal.name}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md flex flex-col justify-between ${darkMode ? 'bg-slate-850/60 border-slate-800' : 'bg-slate-50/60 border-slate-200/80'
                    }`}
                >
                  {/* Top Row: Meal Icon, Meal Name, Serving Schedule, and Donut Gauge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}
                      >
                        <Icon className="w-5 h-5" style={{ color: meal.color }} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm">{meal.name}</h4>
                        <p className={`text-[11px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {meal.time}
                        </p>
                      </div>
                    </div>

                    {/* Animated SVG Donut Gauge showing booking percentage */}
                    <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 48 48">
                        {/* Inactive background track ring */}
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke={darkMode ? '#334155' : '#e2e8f0'}
                          strokeWidth="4"
                          fill="transparent"
                        />
                        {/* Active filled progress ring */}
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke={meal.color}
                          strokeWidth="4"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      {/* Percentage label in center of ring */}
                      <span className="absolute font-black text-[10px]">{meal.data.percentage}%</span>
                    </div>
                  </div>

                  {/* Middle Row: Selected meal booking headcount */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    <span className="text-2xl font-black">{meal.data.selected}</span>
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      / {totalStudents} booked
                    </span>
                  </div>

                  {/* Bottom Row: Opted out count and High Demand badge */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{optedOut} opted out</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${meal.data.percentage >= 70
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                      {meal.data.percentage >= 70 ? 'High Demand' : 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LIVE PUBLISHED MESS MENU FROM MAIN KITCHEN */}
          <div className={`mt-6 pt-5 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#1b4d3e] dark:text-emerald-400" />
                  Tomorrow's Published Mess Menu (Live Kitchen Feed)
                </h4>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Published dishes live from Chef Ramesh at the Main Mess Kitchen
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 w-fit">
                Live Kitchen Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { meal: 'Breakfast', icon: '🌅', items: menu?.breakfast || 'Masala Dosa, Sambar, Poha with Chai' },
                { meal: 'Lunch', icon: '☀️', items: menu?.lunch || 'Rajma Chawal Thali, Paneer Butter Masala' },
                { meal: 'Snacks', icon: '☕', items: menu?.snacks || 'Samosa & Chai' },
                { meal: 'Dinner', icon: '🌙', items: menu?.dinner || 'Roti, Dal, Sabzi, Chicken Curry & Rice' }
              ].map((m) => (
                <div
                  key={m.meal}
                  className={`p-3.5 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-850/70 border-slate-800' : 'bg-slate-50/80 border-slate-200/70'
                    }`}
                >
                  <span className="font-mono font-bold text-[11px] text-slate-500 flex items-center gap-1.5 uppercase mb-1.5">
                    <span>{m.icon}</span>
                    <span>{m.meal}</span>
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white leading-relaxed">
                    {m.items}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ROOM MONITORING MATRIX TABLE */}
      {/* Render if activeTab is 'Room & Floor Monitoring' */}
      {(activeTab === 'Room & Floor Monitoring' || activeTab === 'Room Monitoring' || activeTab === 'Floor Overview' || activeTab === 'Dashboard') && (
        <section
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Table Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Complete {floorConfig.label} Room Monitoring Matrix
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time meal booking and submission audit for all assigned rooms.
              </p>
            </div>
            {/* Total rooms count badge */}
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                {scopedRooms.length} Total Rooms
              </span>
            </div>
          </div>

          {/* Scrollable table container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              {/* Table Column Headings */}
              <thead>
                <tr
                  className={`border-b font-bold uppercase text-[11px] tracking-wider ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}
                >
                  <th className="pb-3.5 pl-2">Room</th>
                  <th className="pb-3.5">Lead</th>
                  <th className="pb-3.5">Capacity</th>
                  <th className="pb-3.5">Meal Submissions</th>
                  <th className="pb-3.5">Booking Status</th>
                  <th className="pb-3.5">Compliance</th>
                  <th className="pb-3.5 text-right pr-2">Actions</th>
                </tr>
              </thead>
              {/* Table Body rows */}
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {scopedRooms.map((room) => {
                  // Low rate check (<60%)
                  const isLow = room.rate < 60;
                  // All submitted check
                  const isComplete = room.pending === 0;

                  return (
                    <tr
                      key={room.roomNo}
                      className={`transition-colors ${isLow
                          ? darkMode
                            ? 'bg-slate-800/40'
                            : 'bg-slate-50/70'
                          : ''
                        } ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'}`}
                    >
                      {/* Column 1: Room Number + FLAGGED badge if applicable */}
                      <td className="py-4 pl-2 font-black flex items-center gap-2">
                        <span>{room.roomNo}</span>
                        {room.flagged && (
                          <span className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                            FLAGGED
                          </span>
                        )}
                      </td>
                      {/* Column 2: Room Lead Name */}
                      <td className={`py-4 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {room.lead}
                      </td>
                      {/* Column 3: Total members capacity */}
                      <td className={`py-4 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {room.members}
                      </td>
                      {/* Column 4: Meal submissions count and percentage */}
                      <td className="py-4">
                        <span className={`font-bold ${isComplete ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                          {room.submitted}
                        </span>
                        <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}> / {room.members} ({room.rate}%)</span>
                      </td>
                      {/* Column 5: Booking status chip */}
                      <td className="py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-slate-950" />
                            All {room.members} Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                            {room.pending} Pending ({room.submitted}/{room.members})
                          </span>
                        )}
                      </td>
                      {/* Column 6: Rate status badge (Dark High-Contrast Theme) */}
                      <td className="py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${room.rate >= 75
                              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                              : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                          {room.rate >= 75 ? 'On Track' : 'Needs Action'}
                        </span>
                      </td>
                      {/* Column 7: Action buttons (Remind lead, Flag room) */}
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Remind Lead */}
                          <button
                            onClick={() => remindRoomLead(room.roomNo, room.lead)}
                            className={`font-semibold px-3 py-1.5 rounded-xl text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${darkMode
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                          >
                            <Bell className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                            Remind Lead
                          </button>
                          {/* Flag or Unflag Room */}
                          <button
                            onClick={() => flagRoom(room.roomNo)}
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${room.flagged
                                ? 'bg-rose-600 text-white border-rose-600'
                                : darkMode
                                  ? 'bg-slate-800 text-slate-400 hover:text-rose-400 border-slate-700'
                                  : 'bg-slate-100 text-slate-500 hover:text-rose-600 border-slate-200'
                              }`}
                            title="Flag Room"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBMISSION RATE CHART & ANALYTICS */}
      {/* Render if activeTab is 'Room & Floor Monitoring' */}
      {(activeTab === 'Room & Floor Monitoring' || activeTab === 'Room Monitoring' || activeTab === 'Floor Overview' || activeTab === 'Dashboard') && (
        <section
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Analytics Header with Legend and Average */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Room Meal Participation Analytics (%)
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Submission rate comparison across all {scopedRooms.length} rooms on {floorConfig.label}.
              </p>
            </div>

            {/* 2-Color Legend (Dark Solid: >=75%, Slate: <75%) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-1.5 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white"></span>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>≥75% On Track</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>&lt;75% Needs Attention</span>
                </div>
              </div>

              {/* Floor Average badge */}
              <span
                className={`px-3 py-1.5 rounded-xl font-bold border text-[11px] ${darkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
              >
                Floor Average: {participationPercentage}%
              </span>
            </div>
          </div>

          {/* Dynamic SVG Bar Chart rendered with Recharts */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scopedRooms} margin={{ top: 20, right: 15, left: -10, bottom: 5 }}>
                {/* Horizontal background gridlines */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                {/* X-Axis: Room numbers */}
                <XAxis
                  dataKey="roomNo"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: darkMode ? '#94a3b8' : '#64748b' }}
                  dy={8}
                />
                {/* Y-Axis: Percentage scale (0 to 100%) */}
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                  tick={{ fontSize: 11, fontWeight: 500, fill: darkMode ? '#94a3b8' : '#64748b' }}
                  ticks={[0, 25, 50, 75, 100]}
                />
                {/* Target Benchmark dotted line at 75% */}
                <ReferenceLine
                  y={75}
                  stroke={darkMode ? '#475569' : '#cbd5e1'}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Target: 75%',
                    position: 'insideTopRight',
                    fill: darkMode ? '#94a3b8' : '#64748b',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
                {/* Interactive Tooltip on bar hover */}
                <Tooltip
                  cursor={{ fill: darkMode ? 'rgba(51, 65, 85, 0.2)' : 'rgba(241, 245, 249, 0.6)', radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className={`p-3.5 rounded-2xl shadow-xl border text-xs min-w-[170px] ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
                            <span className="font-extrabold text-sm">{data.roomNo}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${data.rate >= 75
                                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                                }`}
                            >
                              {data.rate}%
                            </span>
                          </div>
                          <p className={`text-[11px] mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Lead: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{data.lead}</strong>
                          </p>
                          <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Submissions: <strong className="text-slate-900 dark:text-white font-bold">{data.submitted}</strong> / {data.members} Students
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* The bar elements with dynamic cell colors based on participation rate (Dark Monochrome High-Contrast Theme) */}
                <Bar dataKey="rate" barSize={34} radius={[8, 8, 2, 2]}>
                  {scopedRooms.map((entry, index) => {
                    const barColor = entry.rate >= 75 ? (darkMode ? '#f8fafc' : '#0f172a') : '#64748b';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* LOW PARTICIPATION TAB VIEW */}
      {/* Render if activeTab is 'Low Participation' */}
      {activeTab === 'Low Participation' && (
        <section
          className={`p-6 rounded-3xl border shadow-sm transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Header with Remind All Pending Leads button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                Low Participation Rooms (Action Required)
              </h3>
              <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Rooms on Floor 2 with submission rates below 60% or flagged for review.
              </p>
            </div>
            {/* Remind All Leads Button */}
            <button
              onClick={handleRemindAllLow}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Bell className="w-4 h-4" />
              Remind All Pending Leads
            </button>
          </div>

          {/* Conditional view: Success state if all rooms meet threshold, else list of warning cards */}
          {lowParticipationRooms.length === 0 ? (
            <div
              className={`p-10 text-center rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}
            >
              <CheckCircle2 className="w-10 h-10 text-slate-800 dark:text-slate-200 mx-auto mb-2" />
              <p className="font-extrabold text-base">All Rooms Meet Target!</p>
              <p className="text-xs mt-1">Every room on Floor 2 has satisfied the minimum submission quota.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowParticipationRooms.map((room) => (
                <div
                  key={room.roomNo}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/60 border-slate-200/90'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono font-black text-lg">{room.roomNo}</span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-white dark:bg-slate-700">
                        {room.rate}% Rate
                      </span>
                    </div>
                    <p className="text-xs font-semibold mb-2">Lead: {room.lead}</p>
                    <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {room.submitted} submitted of {room.members} students ({room.pending} pending)
                    </p>
                  </div>

                  {/* Action buttons inside card */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center gap-2">
                    {/* Remind Lead button */}
                    <button
                      onClick={() => remindRoomLead(room.roomNo, room.lead)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Remind Lead
                    </button>
                    {/* Flag Room button */}
                    <button
                      onClick={() => flagRoom(room.roomNo)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${room.flagged
                          ? 'bg-slate-800 text-white border-slate-800'
                          : darkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      title="Flag Room"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* REPORTS TAB */}
      {/* Render if activeTab is 'Reports' */}
      {activeTab === 'Reports' && (
        <section
          className={`p-8 rounded-3xl border shadow-sm text-center transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
            }`}
        >
          {/* Reports Icon */}
          <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black">Floor 1 Meal Booking & Kitchen Requisitions</h3>
          <p className={`text-xs sm:text-sm mt-1.5 max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Download and export daily student meal selections and tomorrow's dining preparation requisitions for Hostel Block D • Floor 1.
          </p>
          {/* Export Button */}
          <button
            onClick={() => addToast('Floor 1 Meal Requisition Report generated successfully!', 'success')}
            className="mt-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-950 font-bold py-2.5 px-6 rounded-2xl text-xs transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export Meal Roster PDF / CSV
          </button>
        </section>
      )}
    </main>
      </div >
    </div >
  );
};

// Export the component as default export
export default FloorInchargeDashboard;
