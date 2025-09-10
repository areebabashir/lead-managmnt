import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import AddMeetingModal from '../forms/AddMeetingModal';
import { getMeetings, Meeting } from '@/services/meetingAPI';

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

// Empty initial events - will be populated from API
const mockCalendarEvents: Record<string, CalendarEvent[]> = {};

// Helpers
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatMonthTitle(date: Date) {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function getDaysInMonth(date: Date, events: Record<string, CalendarEvent[]> = mockCalendarEvents): CalendarDayData[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const today = new Date();
  const days: CalendarDayData[] = [];

  // Helper function to format date without timezone issues
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  for (let i = 0; i < 42; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    const dateKey = formatDateKey(day);
    const dayEvents = events[dateKey] || [];
    days.push({
      date: day,
      events: dayEvents,
      isCurrentMonth: day.getMonth() === month,
      isToday: day.toDateString() === today.toDateString(),
      isSelected: false,
    });
  }
  return days;
}

// Components
const EventDot = ({ event }: { event: CalendarEvent }) => {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'appointment':
        return 'bg-green-500';
      case 'call':
        return 'bg-purple-500';
      case 'personal':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return '👥';
      case 'appointment':
        return '📅';
      case 'call':
        return '📞';
      case 'personal':
        return '👤';
      default:
        return '📌';
    }
  };

  return (
    <div className={`text-xs px-2 py-1 rounded-full text-white ${getEventColor(event.type)} flex items-center gap-1`}>
      <span className="text-xs">{getEventIcon(event.type)}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
};

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
        ${dayData.events.length > 0 && !dayData.isToday && !dayData.isSelected ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm' : ''}
      `}
    >
      <div className={`flex items-center justify-between mb-1 text-sm font-semibold`}>
        <span className={`
          ${dayData.isToday ? 'text-blue-600' : ''}
          ${dayData.events.length > 0 && !dayData.isToday ? 'text-blue-700 font-bold' : ''}
          ${dayData.events.length === 0 && !dayData.isToday ? 'text-gray-700' : ''}
        `}>{dayData.date.getDate()}</span>
        {dayData.events.length > 0 && (
          <div className="flex items-center gap-1">
            {/* Show different colored dots for different meeting types */}
            {dayData.events.slice(0, 3).map((event, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  event.type === 'meeting' ? 'bg-blue-500' :
                  event.type === 'appointment' ? 'bg-green-500' :
                  event.type === 'call' ? 'bg-purple-500' :
                  event.type === 'personal' ? 'bg-orange-500' : 'bg-gray-500'
                }`}
                title={`${event.type}: ${event.title}`}
              />
            ))}
            {dayData.events.length > 3 && (
              <div className="w-2 h-2 bg-gray-400 rounded-full" title={`+${dayData.events.length - 3} more events`} />
            )}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDays(getDaysInMonth(month, calendarEvents));
  }, [month, calendarEvents]);

  // Load meetings from API
  useEffect(() => {
    loadMeetings();
  }, [month]);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const meetings = await getMeetings();
      
      // Convert meetings to calendar events
      const eventsMap: Record<string, CalendarEvent[]> = {};
      
      meetings.forEach((meeting: Meeting) => {
        const dateKey = meeting.date;
        if (!eventsMap[dateKey]) {
          eventsMap[dateKey] = [];
        }
        
        const calendarEvent: CalendarEvent = {
          id: meeting._id || '',
          title: meeting.title,
          time: meeting.startTime,
          type: meeting.type,
          color: getEventColor(meeting.type),
          attendees: meeting.attendees?.length || 0,
          priority: meeting.priority
        };
        
        eventsMap[dateKey].push(calendarEvent);
      });
      
      setCalendarEvents(eventsMap);
    } catch (error) {
      console.error('Error loading meetings:', error);
      // Keep using mock data if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'appointment':
        return 'bg-green-500';
      case 'call':
        return 'bg-purple-500';
      case 'personal':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handlePrev = () => setMonth((m) => addMonths(m, -1));
  const handleNext = () => setMonth((m) => addMonths(m, 1));
  const handleToday = () => setMonth(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleMeetingAdded = (meeting: any) => {
    // Reload meetings to get the latest data
    loadMeetings();
  };

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
          <CalendarDay 
            key={dayData.date.toISOString()} 
            dayData={dayData} 
            onClick={() => handleDayClick(dayData.date)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Calendar Legend</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-gray-600 mb-1">Event Types:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Meeting</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Appointment</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Call</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Personal</span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2 mb-1">Date Colors:</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded"></div>
            <span className="text-gray-600">Dates with meetings</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events - Show real data */}
      {(() => {
        // Get upcoming events from the current calendar events
        const today = new Date();
        const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const upcomingEvents = Object.entries(calendarEvents)
          .filter(([dateKey]) => dateKey >= todayString)
          .flatMap(([_, events]) => events)
          .sort((a, b) => {
            const dateA = new Date(`${Object.keys(calendarEvents).find(key => calendarEvents[key].includes(a))}T${a.time}`);
            const dateB = new Date(`${Object.keys(calendarEvents).find(key => calendarEvents[key].includes(b))}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3); // Show only next 3 events

        if (upcomingEvents.length === 0) {
          return (
            <div className="mt-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">Upcoming Events</span>
                <span className="text-xs text-gray-500">Click any date to schedule</span>
              </div>
              <div className="text-xs text-gray-500 text-center py-2">
                No upcoming events scheduled
              </div>
            </div>
          );
        }

        return (
          <div className="mt-3 p-2 bg-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-black">Upcoming Events</span>
              <span className="text-xs text-black">Click any date to schedule</span>
            </div>
            <div className="space-y-1">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'meeting' ? 'bg-blue-500' :
                    event.type === 'appointment' ? 'bg-green-500' :
                    event.type === 'call' ? 'bg-purple-500' :
                    event.type === 'personal' ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-xs text-black">{event.title} - {event.time}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Meeting Modal */}
      <AddMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onMeetingAdded={handleMeetingAdded}
      />
    </div>
  );
}
