import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Users, MapPin, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { createMeeting, CreateMeetingData } from '@/services/meetingAPI';

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onMeetingAdded: (meeting: any) => void;
}

interface MeetingFormData {
  title: string;
  type: 'meeting' | 'appointment' | 'call' | 'personal';
  startTime: string;
  endTime: string;
  location: string;
  attendees: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reminder: string;
}

const initialFormData: MeetingFormData = {
  title: '',
  type: 'meeting',
  startTime: '',
  endTime: '',
  location: '',
  attendees: '',
  description: '',
  priority: 'medium',
  reminder: '15'
};

export default function AddMeetingModal({ isOpen, onClose, selectedDate, onMeetingAdded }: AddMeetingModalProps) {
  const [formData, setFormData] = useState<MeetingFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a meeting title",
          variant: "destructive"
        });
        return;
      }

      if (!formData.startTime || !formData.endTime) {
        toast({
          title: "Error",
          description: "Please select start and end times",
          variant: "destructive"
        });
        return;
      }

      // Create meeting data with timezone-safe date formatting
      const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const meetingData: CreateMeetingData = {
        title: formData.title,
        type: formData.type,
        date: formatDateForAPI(selectedDate),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        attendees: formData.attendees.split(',').map(email => email.trim()).filter(Boolean),
        description: formData.description,
        priority: formData.priority,
        reminder: parseInt(formData.reminder)
      };

      // Create meeting via API
      const meeting = await createMeeting(meetingData);

      toast({
        title: "Success",
        description: `${formData.type === 'meeting' ? 'Meeting' : 'Appointment'} scheduled successfully!`,
      });

      onMeetingAdded(meeting);
      setFormData(initialFormData);
      onClose();

    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Schedule {formData.type === 'meeting' ? 'Meeting' : 'Appointment'}
              </h2>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter meeting title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium">
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium">
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Location and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="Meeting location or link"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value: any) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees" className="text-sm font-medium">
              Attendees
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="attendees"
                placeholder="Enter email addresses separated by commas"
                value={formData.attendees}
                onChange={(e) => handleInputChange('attendees', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                placeholder="Enter meeting description or agenda"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="pl-10 min-h-[100px]"
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminder" className="text-sm font-medium">
              Reminder
            </Label>
            <Select value={formData.reminder} onValueChange={(value) => handleInputChange('reminder', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule {formData.type === 'meeting' ? 'Meeting' : 'Appointment'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
