import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  User, 
  Mail, 
  Building, 
  UserCheck,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { contactAPI } from '@/services/contactAPI';
import { MeetingNoteParticipant } from '@/services/meetingNotesAPI';

interface Contact {
  _id: string;
  fullName: string;
  email: string;
  company?: string;
  phoneNumber?: string;
}

interface ParticipantsManagerProps {
  participants: MeetingNoteParticipant[];
  onParticipantsChange: (participants: MeetingNoteParticipant[]) => void;
  className?: string;
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  participants,
  onParticipantsChange,
  className = ''
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await contactAPI.getContacts();
      if (response.success && Array.isArray(response.data)) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const addSimpleParticipant = () => {
    if (!newParticipant.name.trim()) return;

    const participant: MeetingNoteParticipant = {
      name: newParticipant.name.trim(),
      email: newParticipant.email.trim() || undefined,
      type: 'simple'
    };

    onParticipantsChange([...participants, participant]);
    setNewParticipant({ name: '', email: '' });
    setShowAddForm(false);
  };

  const addContactParticipant = (contact: Contact) => {
    // Check if contact is already added
    const exists = participants.some(p => p.contactId === contact._id);
    if (exists) return;

    const participant: MeetingNoteParticipant = {
      contactId: contact._id,
      type: 'contact'
    };

    onParticipantsChange([...participants, participant]);
    setShowContactSelector(false);
    setSearchQuery('');
  };

  const removeParticipant = (index: number) => {
    const newParticipants = participants.filter((_, i) => i !== index);
    onParticipantsChange(newParticipants);
  };

  const updateSimpleParticipant = (index: number, field: 'name' | 'email', value: string) => {
    const newParticipants = [...participants];
    if (newParticipants[index].type === 'simple') {
      newParticipants[index] = {
        ...newParticipants[index],
        [field]: value
      };
      onParticipantsChange(newParticipants);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getContactById = (contactId: string): Contact | undefined => {
    return contacts.find(c => c._id === contactId);
  };

  const renderParticipant = (participant: MeetingNoteParticipant, index: number) => {
    if (participant.type === 'contact') {
      const contact = getContactById(participant.contactId!);
      return (
        <motion.div
          key={`contact-${participant.contactId}-${index}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {contact?.fullName || 'Unknown Contact'}
              </p>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {contact?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </span>
                )}
                {contact?.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {contact.company}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-primary border-primary">
              Contact
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeParticipant(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={`simple-${index}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={participant.name || ''}
              onChange={(e) => updateSimpleParticipant(index, 'name', e.target.value)}
              placeholder="Participant name"
              className="border-0 bg-transparent p-0 font-medium text-gray-900 focus-visible:ring-0"
            />
            <Input
              value={participant.email || ''}
              onChange={(e) => updateSimpleParticipant(index, 'email', e.target.value)}
              placeholder="Email (optional)"
              className="border-0 bg-transparent p-0 text-sm text-gray-500 focus-visible:ring-0"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-gray-600">
            Manual
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeParticipant(index)}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Meeting Participants
            {participants.length > 0 && (
              <Badge variant="outline">{participants.length}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Add from Contacts */}
            <Popover open={showContactSelector} onOpenChange={setShowContactSelector}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  From Contacts
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput 
                    placeholder="Search contacts..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>
                    {loadingContacts ? 'Loading contacts...' : 'No contacts found.'}
                  </CommandEmpty>
                  <CommandGroup className="max-h-60 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <CommandItem
                        key={contact._id}
                        onSelect={() => addContactParticipant(contact)}
                        className="flex items-center space-x-3 p-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{contact.fullName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{contact.email}</span>
                            {contact.company && (
                              <>
                                <span>•</span>
                                <span>{contact.company}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Add Manual Participant */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Manual
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Manual Participant Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Add Participant</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="participant-name" className="text-xs text-gray-600">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="participant-name"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    placeholder="Enter participant name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="participant-email" className="text-xs text-gray-600">
                    Email (optional)
                  </Label>
                  <Input
                    id="participant-email"
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                    placeholder="Enter email address"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={addSimpleParticipant}
                  disabled={!newParticipant.name.trim()}
                >
                  Add Participant
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants List */}
        <div className="space-y-3">
          <AnimatePresence>
            {participants.map((participant, index) => renderParticipant(participant, index))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {participants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No participants added yet</p>
            <p className="text-sm mb-4">
              Add participants from your contacts or manually enter their details
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowContactSelector(true)}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                From Contacts
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Manual
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick Stats */}
        {participants.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
            <div className="flex items-center gap-4">
              <span>
                {participants.filter(p => p.type === 'contact').length} from contacts
              </span>
              <span>
                {participants.filter(p => p.type === 'simple').length} manual entries
              </span>
            </div>
            <span>Total: {participants.length} participants</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

