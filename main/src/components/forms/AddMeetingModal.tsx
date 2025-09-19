import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Users, MapPin, FileText, AlertCircle, Video, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { createMeeting, CreateMeetingData, Meeting } from '@/services/meetingAPI';
import { GoogleCalendarIntegration } from '@/services/googleCalendarAPI';
import { userAPI, User } from '@/services/userAPI';
import { contactAPI, Contact } from '@/services/contactAPI';
import GoogleCalendarAuth from './GoogleCalendarAuth';

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
  hostId: string; // Selected user as host
  guestIds: string[]; // Selected contacts as guests
  attendees: string; // Keep for backward compatibility
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
  hostId: '',
  guestIds: [],
  attendees: '',
  description: '',
  priority: 'medium',
  reminder: '15'
};

export default function AddMeetingModal({ isOpen, onClose, selectedDate, onMeetingAdded }: AddMeetingModalProps) {
  const [formData, setFormData] = useState<MeetingFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<Meeting | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedGuests, setSelectedGuests] = useState<Contact[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check Google Calendar connection status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkGoogleCalendarStatus();
      loadUsersAndContacts();
    }
  }, [isOpen]);

  // Load users and contacts for selection
  const loadUsersAndContacts = async () => {
    try {
      setLoadingData(true);
      const [usersResponse, contactsResponse] = await Promise.all([
        userAPI.getAllUsers(),
        contactAPI.getContacts({ limit: 1000 }) // Get all contacts
      ]);
      
      if (usersResponse.success) {
        setUsers(usersResponse.users);
      }
      
      if (contactsResponse.success) {
        setContacts(contactsResponse.data);
      }
    } catch (error) {
      console.error('Error loading users and contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load users and contacts",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const checkGoogleCalendarStatus = async () => {
    try {
      const connected = await GoogleCalendarIntegration.isConnected();
      setIsGoogleCalendarConnected(connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setIsGoogleCalendarConnected(false);
    }
  };

  const handleInputChange = (field: keyof MeetingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Meeting title is required';
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    
    if (!formData.hostId) {
      errors.hostId = 'Please select a meeting host';
    }
    
    if (formData.guestIds.length === 0) {
      errors.guestIds = 'Please select at least one guest';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    if (!validateForm()) {
        toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
          variant: "destructive"
        });
        return;
      }

    setIsLoading(true);

    try {

      // Create meeting data with timezone-safe date formatting
      const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Get host and guest details
      const selectedHost = users.find(user => user._id === formData.hostId);
      const selectedGuestContacts = contacts.filter(contact => formData.guestIds.includes(contact._id));
      
      // Prepare attendee emails (host + guests)
      const attendeeEmails = [
        selectedHost?.email,
        ...selectedGuestContacts.map(contact => contact.email)
      ].filter(Boolean);

      const meetingData: CreateMeetingData = {
        title: formData.title,
        type: formData.type,
        date: formatDateForAPI(selectedDate),
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        attendees: attendeeEmails,
        description: formData.description,
        priority: formData.priority,
        reminder: parseInt(formData.reminder),
        // Add host and guest information
        hostId: formData.hostId,
        hostName: selectedHost?.name || '',
        hostEmail: selectedHost?.email || '',
        guestIds: formData.guestIds,
        guestEmails: selectedGuestContacts.map(contact => contact.email),
        guestNames: selectedGuestContacts.map(contact => contact.fullName)
      };

      // Create meeting via API
      const meeting = await createMeeting(meetingData);
      setCreatedMeeting(meeting);

      // Show success message with Google Calendar info
      if (meeting.googleCalendarCreated && meeting.googleMeetLink) {
        toast({
          title: "Success",
          description: `${formData.type === 'meeting' ? 'Meeting' : 'Appointment'} scheduled successfully with Google Meet link!`,
        });
      } else {
        toast({
          title: "Success",
          description: `${formData.type === 'meeting' ? 'Meeting' : 'Appointment'} scheduled successfully!`,
        });
      }

      onMeetingAdded(meeting);

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
          {/* Google Calendar Integration */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Google Calendar Integration</span>
              </div>
              <GoogleCalendarAuth 
                onConnectionChange={setIsGoogleCalendarConnected}
                className="text-xs"
              />
            </div>
            {isGoogleCalendarConnected ? (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span>Meetings will be automatically added to Google Calendar with Google Meet links</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-700">
                <AlertCircle className="h-4 w-4" />
                <span>Connect Google Calendar to automatically create events with Google Meet links</span>
              </div>
            )}
          </div>

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
                className={`w-full ${formErrors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value: any) => handleInputChange('type', value)}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="meeting" className="bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Meeting</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="appointment" className="bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>Appointment</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="call" className="bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Call</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal" className="bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span>Personal</span>
                    </div>
                  </SelectItem>
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
                className={`w-full ${formErrors.startTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.startTime && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.startTime}
                </p>
              )}
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
                className={`w-full ${formErrors.endTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {formErrors.endTime && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.endTime}
                </p>
              )}
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
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="low" className="bg-white hover:bg-gray-50">Low</SelectItem>
                  <SelectItem value="medium" className="bg-white hover:bg-gray-50">Medium</SelectItem>
                  <SelectItem value="high" className="bg-white hover:bg-gray-50">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Host */}
          <div className="space-y-2">
            <Label htmlFor="host" className="text-sm font-medium">
              Meeting Host *
            </Label>
            {loadingData ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading users...</span>
              </div>
            ) : (
              <Select value={formData.hostId} onValueChange={(value) => handleInputChange('hostId', value)}>
                <SelectTrigger className={`w-full bg-white ${formErrors.hostId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                  <SelectValue placeholder="Select meeting host" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg">
                  {users.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 bg-white">No users available</div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user._id} value={user._id} className="bg-white hover:bg-gray-50">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {formErrors.hostId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.hostId}
              </p>
            )}
          </div>

          {/* Meeting Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="text-sm font-medium">
              Meeting Guests (Leads/Contacts) *
            </Label>
            {loadingData ? (
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading contacts...</span>
              </div>
            ) : (
              <div className={`border rounded-md ${formErrors.guestIds ? 'border-red-500' : ''}`}>
                {contacts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No contacts available. Please add contacts first.
                  </div>
                ) : (
                  <>
                    <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                      {contacts.map((contact) => (
                        <label key={contact._id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.guestIds.includes(contact._id)}
                            onChange={(e) => {
                              const newGuestIds = e.target.checked
                                ? [...formData.guestIds, contact._id]
                                : formData.guestIds.filter(id => id !== contact._id);
                              handleInputChange('guestIds', newGuestIds);
                            }}
                            className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
                            <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                            {contact.phoneNumber && (
                              <div className="text-xs text-gray-400">{contact.phoneNumber}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-600 flex items-center justify-between">
                      <span>Selected: {formData.guestIds.length} guest{formData.guestIds.length !== 1 ? 's' : ''}</span>
                      {formData.guestIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('guestIds', [])}
                          className="text-red-600 hover:text-red-700 text-xs underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </>
                )}
            </div>
            )}
            {formErrors.guestIds && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.guestIds}
              </p>
            )}
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
               <SelectTrigger className="bg-white">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-white border border-gray-200 shadow-lg">
                 <SelectItem value="5" className="bg-white hover:bg-gray-50">5 minutes before</SelectItem>
                 <SelectItem value="15" className="bg-white hover:bg-gray-50">15 minutes before</SelectItem>
                 <SelectItem value="30" className="bg-white hover:bg-gray-50">30 minutes before</SelectItem>
                 <SelectItem value="60" className="bg-white hover:bg-gray-50">1 hour before</SelectItem>
                 <SelectItem value="1440" className="bg-white hover:bg-gray-50">1 day before</SelectItem>
               </SelectContent>
             </Select>
          </div>

          {/* Success Section - Show Google Meet Link */}
          {createdMeeting && createdMeeting.googleMeetLink && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Meeting Created Successfully!</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Video className="h-4 w-4" />
                  <span>Google Meet Link:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={createdMeeting.googleMeetLink}
                    readOnly
                    className="text-sm bg-white border-green-300"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(createdMeeting.googleMeetLink, '_blank')}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                {createdMeeting.googleEventLink && (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(createdMeeting.googleEventLink, '_blank')}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Open in Google Calendar
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData(initialFormData);
                setCreatedMeeting(null);
                onClose();
              }}
              disabled={isLoading}
            >
              {createdMeeting ? 'Close' : 'Cancel'}
            </Button>
            {!createdMeeting && (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
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
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}


