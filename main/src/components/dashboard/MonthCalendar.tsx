import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Calendar as CalIcon,
  Clock,
  Users,
  MapPin,
  Star,
  Zap,
  Target,
  Coffee,
  Video,
  Phone
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'call' | 'task' | 'personal';
  color: string;
  attendees?: number;
  location?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DayData {
  date: Date;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const eventTypes = {
  meeting: { icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100', text: 'text-blue-800' },
  call: { icon: Phone, color: 'from-green-500 to-green-600', bg: 'bg-green-100', text: 'text-green-800' },
  task: { icon: Target, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-100', text: 'text-purple-800' },
  personal: { icon: Coffee, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-100', text: 'text-orange-800' }
};

const mockEvents: { [key: string]: Event[] } = {
  '2024-12-15': [
    { id: '1', title: 'Team Standup', time: '9:00 AM', type: 'meeting', color: 'blue', attendees: 8, priority: 'high' },
    { id: '2', title: 'Client Call', time: '2:30 PM', type: 'call', color: 'green', priority: 'medium' }
  ],
  '2024-12-16': [
    { id: '3', title: 'Project Review', time: '10:00 AM', type: 'meeting', color: 'purple', attendees: 5, priority: 'high' },
    { id: '4', title: 'Coffee Break', time: '3:00 PM', type: 'personal', color: 'orange', priority: 'low' }
  ],
  '2024-12-20': [
    { id: '5', title: 'Sprint Planning', time: '9:00 AM', type: 'meeting', color: 'blue', attendees: 12, priority: 'high' },
    { id: '6', title: 'Code Review', time: '11:30 AM', type: 'task', color: 'purple', priority: 'medium' },
    { id: '7', title: 'Client Presentation', time: '4:00 PM', type: 'call', color: 'green', priority: 'high' }
  ]
};

function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function getDaysInMonth(date: Date): DayData[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const today = new Date();
  const days: DayData[] = [];

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    
    const dateKey = day.toISOString().split('T')[0];
    const events = mockEvents[dateKey] || [];
    
    days.push({
      date: day,
      events,
      isCurrentMonth: day.getMonth() === month,
      isToday: day.toDateString() === today.toDateString(),
      isSelected: false
    });
  }
  return days;
}

const ViewToggle = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
        : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-800 border border-gray-200'
    }`}
  >
    {children}
  </motion.button>
);

const EventDot = ({ event, index }: { event: Event; index: number }) => {
  const eventType = eventTypes[event.type];
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium truncate
        ${eventType.bg} ${eventType.text} border border-white/50
      `}
      title={`${event.title} at ${event.time}`}
    >
      <eventType.icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{event.title}</span>
      {event.priority === 'high' && <Star className="w-2 h-2 fill-current" />}
    </motion.div>
  );
};

const CalendarDay = ({ dayData, onClick }: { dayData: DayData; onClick: () => void }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-3 min-h-[120px] border border-gray-200/50 cursor-pointer
        transition-all duration-300 group overflow-hidden
        ${dayData.isCurrentMonth 
          ? 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md' 
          : 'bg-gray-50/50 text-gray-400'
        }
        ${dayData.isToday 
          ? 'ring-2 ring-blue-500 ring-offset-2 bg-gradient-to-br from-blue-50 to-purple-50' 
          : ''
        }
        ${dayData.isSelected 
          ? 'ring-2 ring-purple-500 ring-offset-2 bg-gradient-to-br from-purple-50 to-pink-50' 
          : ''
        }
      `}
    >
      {/* Background decoration */}
      {dayData.events.length > 0 && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-2xl" />
      )}
      
      {/* Date number */}
      <div className={`
        flex items-center justify-between mb-2
        ${dayData.isToday ? 'text-blue-600 font-bold' : ''}
        ${!dayData.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
      `}>
        <span className="text-sm font-semibold">{dayData.date.getDate()}</span>
        {dayData.events.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {dayData.events.length}
          </motion.div>
        )}
      </div>

      {/* Events */}
      <div className="space-y-1">
        {dayData.events.slice(0, 2).map((event, index) => (
          <EventDot key={event.id} event={event} index={index} />
        ))}
        {dayData.events.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md"
          >
            +{dayData.events.length - 2} more
          </motion.div>
        )}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

const QuickStats = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl border border-white/20"
  >
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium text-gray-700">12 events this week</span>
    </div>
    <div className="w-px h-4 bg-gray-300" />
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-blue-500" />
      <span className="text-sm font-medium text-gray-700">Next: Team Standup in 2h</span>
    </div>
  </motion.div>
);

export default function MonthCalendar() {
  const [month, setMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [days, setDays] = useState<DayData[]>([]);

  useEffect(() => {
    setDays(getDaysInMonth(month));
  }, [month]);

  const handlePrev = () => setMonth((m) => addMonths(m, -1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));
  const handleToday = () => setMonth(new Date());

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6"
      >
        {/* Top Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
            >
              <CalIcon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formatMonthTitle(month)}</h2>
              <p className="text-sm text-gray-500">Your schedule at a glance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToday}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        {/* View Toggle & Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <ViewToggle active={view === 'month'} onClick={() => setView('month')}>
              Month
            </ViewToggle>
            <ViewToggle active={view === 'week'} onClick={() => setView('week')}>
              Week
            </ViewToggle>
            <ViewToggle active={view === 'day'} onClick={() => setView('day')}>
              Day
            </ViewToggle>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 text-gray-600 hover:bg-white hover:text-gray-800 border border-gray-200 rounded-xl transition-all duration-300"
            >
              <Filter className="w-4 h-4" />
              Filter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-center py-3 text-sm font-semibold text-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
            >
              {day.slice(0, 3)}
            </motion.div>
          ))}
        </div>

        {/* Calendar Days */}
        <motion.div 
          layout
          className="grid grid-cols-7 gap-1 rounded-xl overflow-hidden shadow-sm"
        >
          <AnimatePresence mode="wait">
            {days.map((dayData, index) => (
              <motion.div
                key={dayData.date.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.01 }}
              >
                <CalendarDay
                  dayData={dayData}
                  onClick={() => setSelectedDate(dayData.date)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Event Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming This Week</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(mockEvents).flat().slice(0, 3).map((event, index) => {
              const eventType = eventTypes[event.type];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200/50 hover:shadow-md transition-all duration-300"
                >
                  <div className={`p-2 bg-gradient-to-r ${eventType.color} rounded-lg`}>
                    <eventType.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}