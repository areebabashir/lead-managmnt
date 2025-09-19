import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Search, Users, UserCheck, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { contactAPI, Contact } from '@/services/contactAPI';
import { userAPI, User } from '@/services/userAPI';
import { smsAPI, SMSMessage } from '@/services/smsAPI';

interface SMSRecipient {
  id: string;
  name: string;
  phone: string;
  type: 'lead' | 'staff';
}

export default function SMS() {
  const [leads, setLeads] = useState<Contact[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [selectedContact, setSelectedContact] = useState<SMSRecipient | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'staff'>('leads');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<SMSMessage[]>([]);

  // Load leads and staff on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leadsResponse, staffResponse] = await Promise.all([
        contactAPI.getContacts({ limit: 1000 }),
        userAPI.getAllUsers()
      ]);

      if (leadsResponse.success) {
        // Filter leads that have phone numbers
        const leadsWithPhone = leadsResponse.data.filter(lead => lead.phoneNumber);
        setLeads(leadsWithPhone);
      }

      if (staffResponse.success) {
        // Filter staff that have phone numbers
        const staffWithPhone = staffResponse.users.filter(user => user.phone);
        setStaff(staffWithPhone);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts and staff",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search term
  const filteredLeads = leads.filter(lead =>
    lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phoneNumber.includes(searchTerm)
  );

  const filteredStaff = staff.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // Select contact for messaging
  const selectContact = async (contact: SMSRecipient) => {
    setSelectedContact(contact);
    // Load conversation history
    await loadConversation(contact.id, contact.type);
  };

  // Load conversation history
  const loadConversation = async (recipientId: string, recipientType: 'lead' | 'staff') => {
    try {
      const response = await smsAPI.getConversation(recipientId, recipientType);
      if (response.success) {
        setConversation(response.data);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setConversation([]);
    }
  };

  // Send SMS using real Twilio API
  const sendSMS = async () => {
    if (!selectedContact) {
      toast({
        title: "Error",
        description: "Please select a contact",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Send SMS via Twilio API
      const response = await smsAPI.sendSMS({
        message: message.trim(),
        recipientId: selectedContact.id,
        recipientType: selectedContact.type
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `SMS sent to ${selectedContact.name}`,
        });

        // Clear message and reload conversation
        setMessage('');
        await loadConversation(selectedContact.id, selectedContact.type);
      } else {
        throw new Error(response.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Sidebar - Contact List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">SMS</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'leads'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'staff'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Customers
          </button>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-0">
              {activeTab === 'leads' ? (
                filteredLeads.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No leads found
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <div
                      key={lead._id}
                      onClick={() => selectContact({
                        id: lead._id,
                        name: lead.fullName,
                        phone: lead.phoneNumber,
                        type: 'lead'
                      })}
                      className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact?.id === lead._id && selectedContact?.type === 'lead'
                          ? 'bg-orange-50 border-orange-200'
                          : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600">
                          {lead.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {lead.phoneNumber}
                        </p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                filteredStaff.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No staff found
                  </div>
                ) : (
                  filteredStaff.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => selectContact({
                        id: user._id,
                        name: user.name,
                        phone: user.phone,
                        type: 'staff'
                      })}
                      className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact?.id === user._id && selectedContact?.type === 'staff'
                          ? 'bg-orange-50 border-orange-200'
                          : ''
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Message Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-orange-600">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-500">{selectedContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
              {conversation.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  Start a conversation with {selectedContact.name}
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((msg) => (
                    <div key={msg._id} className="flex justify-end">
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-orange-600 text-white rounded-lg px-4 py-2">
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(msg.sentAt).toLocaleTimeString()}
                          </span>
                          <Badge 
                            variant={msg.twilioStatus === 'delivered' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {msg.twilioStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Write your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendSMS();
                      }
                    }}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {message.length}/160 characters
                  </div>
                </div>
                <Button
                  onClick={sendSMS}
                  disabled={isSending || !message.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Contact Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a contact</h3>
              <p className="text-gray-500">Choose a contact from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}