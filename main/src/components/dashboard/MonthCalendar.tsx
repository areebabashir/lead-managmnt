import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'call' | 'task' | 'personal';
  color: string;
  attendees?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface CalendarDayData {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

// Mock Events Data
const mockCalendarEvents: Record<string, CalendarEvent[]> = {
  '2025-09-04': [
    { id: '1', title: 'Team Standup', time: '09:00', type: 'meeting', color: 'bg-orange-500' },
    { id: '2', title: 'Client Call', time: '14:30', type: 'call', color: 'bg-blue-500' },
  ],
};

// Helpers
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatMonthTitle(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(date: Date): CalendarDayData[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const today = new Date();
  const days: CalendarDayData[] = [];

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    const dateKey = day.toISOString().split('T')[0];
    const events = mockCalendarEvents[dateKey] || [];
    days.push({
      date: day,
      events,
      isCurrentMonth: day.getMonth() === month,
      isToday: day.toDateString() === today.toDateString(),
      isSelected: false,
    });
  }
  return days;
}

// Components
const EventDot = ({ event }: { event: CalendarEvent }) => (
  <div className={`text-xs px-1 py-0.5 rounded-full text-white ${event.color}`}>{event.title}</div>
);

const CalendarDay = ({
  dayData,
  onClick,
}: {
  dayData: CalendarDayData;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-2 min-h-[100px] border border-gray-200/50 cursor-pointer transition-all duration-300 group overflow-hidden
        ${dayData.isCurrentMonth ? 'bg-white/80 hover:bg-white hover:shadow-md' : 'bg-gray-50/50 text-gray-400'}
        ${dayData.isToday ? 'ring-2 ring-blue-500 ring-offset-2 bg-gradient-to-br from-blue-50 to-purple-50' : ''}
        ${dayData.isSelected ? 'ring-2 ring-purple-500 ring-offset-2 bg-gradient-to-br from-purple-50 to-pink-50' : ''}
      `}
    >
      <div className={`flex items-center justify-between mb-1 text-sm font-semibold`}>
        <span className={dayData.isToday ? 'text-blue-600' : ''}>{dayData.date.getDate()}</span>
        {dayData.events.length > 0 && (
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {dayData.events.length}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {dayData.events.slice(0, 2).map((event) => (
          <EventDot key={event.id} event={event} />
        ))}
        {dayData.events.length > 2 && (
          <div className="text-xs text-gray-500 font-medium px-1 py-0.5 bg-gray-100 rounded-md">
            +{dayData.events.length - 2} more
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

// Main Calendar
export default function MonthCalendar() {
  const [month, setMonth] = useState<Date>(new Date());
  const [days, setDays] = useState<CalendarDayData[]>([]);

  useEffect(() => {
    setDays(getDaysInMonth(month));
  }, [month]);

  const handlePrev = () => setMonth((m) => addMonths(m, -1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));
  const handleToday = () => setMonth(new Date());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{formatMonthTitle(month)}</h3>
        <div className="flex items-center gap-1">
          <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button onClick={handleToday} className="text-xs px-2 py-1 bg-orange-600 text-white rounded">
            Today
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 text-center mb-1">
        {weekDays.map((day) => (
          <div key={day} className="font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData) => (
          <CalendarDay key={dayData.date.toISOString()} dayData={dayData} />
        ))}
      </div>

      <div className="mt-3 p-2 bg-orange-100 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-black">Upcoming Events</span>
          <span className="text-xs text-black">2 today</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            <span className="text-xs text-black">Team Standup - 9:00 AM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
            <span className="text-xs text-black">Client Call - 2:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
