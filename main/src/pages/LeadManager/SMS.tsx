import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';

const mockSMSHistory = [
  { 
    id: 1, 
    message: 'Welcome to our service! We\'re excited to have you on board.', 
    recipients: 150, 
    delivered: 147,
    failed: 3,
    status: 'sent', 
    date: '2024-01-15',
    time: '10:30 AM',
    campaign: 'Welcome Campaign'
  },
  { 
    id: 2, 
    message: 'Special offer just for you - 20% off your next purchase!', 
    recipients: 89, 
    delivered: 85,
    failed: 4,
    status: 'delivered', 
    date: '2024-01-14',
    time: '2:15 PM',
    campaign: 'Promotion Campaign'
  },
  { 
    id: 3, 
    message: 'Reminder: Your appointment is scheduled for tomorrow at 3 PM', 
    recipients: 45, 
    delivered: 42,
    failed: 3,
    status: 'pending', 
    date: '2024-01-13',
    time: '9:00 AM',
    campaign: 'Appointment Reminders'
  },
  { 
    id: 4, 
    message: 'Thank you for your purchase! Track your order with code #12345', 
    recipients: 23, 
    delivered: 23,
    failed: 0,
    status: 'delivered', 
    date: '2024-01-12',
    time: '4:45 PM',
    campaign: 'Order Confirmations'
  },
  { 
    id: 5, 
    message: 'Don\'t miss out! Sale ends tonight at midnight.', 
    recipients: 200, 
    delivered: 195,
    failed: 5,
    status: 'failed', 
    date: '2024-01-11',
    time: '6:00 PM',
    campaign: 'Flash Sale'
  }
];

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const variants = {
    sent: 'bg-orange-100 text-orange-500 ',
    delivered: 'bg-orange-100 text-orange-500 ',
    pending: 'bg-orange-100 text-orange-500',
    failed: 'bg-orange-100 text-orange-500',
    default: 'bg-orange-100 text-orange-500'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

const StatusIcon = ({ status }: { status: string }) => {
  const icons = {
    sent: <Send className="h-4 w-4 text-orange-500" />,
    delivered: <CheckCircle className="h-4 w-4 text-orange-500" />,
    pending: <Clock className="h-4 w-4 text-orange-500" />,
    failed: <XCircle className="h-4 w-4 text-orange-500" />
  };
  
  return icons[status] || <AlertCircle className="h-4 w-4 text-gray-600" />;
};

export default function LeadManagerSMS() {
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState(254);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);

  const characterCount = message.length;
  const messageCount = Math.ceil(characterCount / 160) || 1;

  const filteredHistory = mockSMSHistory.filter(sms => {
    const matchesSearch = sms.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sms.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sms.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSent = mockSMSHistory.reduce((sum, sms) => sum + sms.recipients, 0);
  const totalDelivered = mockSMSHistory.reduce((sum, sms) => sum + sms.delivered, 0);
  const deliveryRate = ((totalDelivered / totalSent) * 100).toFixed(1);

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Management</h1>
          <p className="text-gray-600 mt-2">Send bulk SMS and manage campaigns</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalSent.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Send className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalDelivered.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{deliveryRate}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contacts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">1,547</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send SMS Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Send className="h-5 w-5 text-black" />
            Send New SMS
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className={`${characterCount > 160 ? 'text-red-600' : 'text-gray-500'}`}>
                  {characterCount}/160 characters ({messageCount} message{messageCount > 1 ? 's' : ''})
                </span>
                {characterCount > 160 && (
                  <span className="text-red-600">Message will be split into {messageCount} parts</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <div 
                onClick={() => setShowContactModal(true)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{selectedContacts} contacts selected</span>
                </div>
                <button className="text-orange-500 text-sm font-medium ">
                  Change Selection
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent"
                />
                <input
                  type="time"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Save as Draft
              </button>
              <button 
                disabled={!message.trim() || selectedContacts === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium  transition-colors disabled:bg-orange-100 disabled:text-black disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Send Now
              </button>
            </div>
          </div>
        </div>

        {/* SMS History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-black" />
              SMS History
            </h2>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* History List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredHistory.map((sms, index) => (
              <motion.div
                key={sms.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <StatusIcon status={sms.status} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{sms.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{sms.campaign}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 text-gray-400 hover:text-orange-500 rounded">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Badge variant={sms.status}>{sms.status}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {sms.recipients} sent
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-black" />
                      {sms.delivered} delivered
                    </span>
                    {sms.failed > 0 && (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-black" />
                        {sms.failed} failed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sms.date} at {sms.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No SMS messages found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Selection Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-lg mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <label className="flex items-center gap-2 font-medium text-gray-700">
                      <input type="checkbox" className="rounded" defaultChecked />
                      All Leads (254 contacts)
                    </label>
                  </div>
                  <div className="p-3 space-y-2">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="rounded" defaultChecked />
                      New Leads (45 contacts)
                    </label>
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Qualified Leads (89 contacts)
                    </label>
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="rounded" defaultChecked />
                      Active Customers (120 contacts)
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-black">
                    <strong>254 contacts</strong> selected • Estimated cost: <strong>$12.70</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md  transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}