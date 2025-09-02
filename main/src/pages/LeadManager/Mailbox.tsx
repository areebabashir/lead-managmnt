import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Reply, 
  Forward, 
  Trash, 
  Plus, 
  Search,
  Filter,
  Star,
  Archive,
  MoreVertical,
  Paperclip,
  Clock,
  User,
  Send,
  X,
  Calendar
} from 'lucide-react';

const mockEmails = [
  { 
    id: 1, 
    from: 'john.smith@techsolutions.com', 
    fromName: 'John Smith',
    subject: 'Follow up on proposal - Tech Solutions Project', 
    preview: 'Thank you for the meeting yesterday. I wanted to follow up on the proposal we discussed...', 
    time: '2 hours ago',
    date: '2024-01-15',
    unread: true,
    starred: false,
    hasAttachment: true,
    label: 'Business'
  },
  { 
    id: 2, 
    from: 'sarah.johnson@marketing.com', 
    fromName: 'Sarah Johnson',
    subject: 'Meeting reschedule request for next week', 
    preview: 'I need to reschedule our meeting due to a conflict. Are you available on Thursday...', 
    time: '4 hours ago',
    date: '2024-01-15',
    unread: true,
    starred: true,
    hasAttachment: false,
    label: 'Important'
  },
  { 
    id: 3, 
    from: 'mike.davis@company.com', 
    fromName: 'Mike Davis',
    subject: 'Contract review completed - Ready for signature', 
    preview: 'The legal team has completed the contract review. Everything looks good and ready...', 
    time: '1 day ago',
    date: '2024-01-14',
    unread: false,
    starred: false,
    hasAttachment: true,
    label: 'Legal'
  },
  { 
    id: 4, 
    from: 'alice.cooper@design.com', 
    fromName: 'Alice Cooper',
    subject: 'Design mockups for review', 
    preview: 'Hi! I\'ve completed the initial design mockups for your project. Please review...', 
    time: '2 days ago',
    date: '2024-01-13',
    unread: false,
    starred: true,
    hasAttachment: true,
    label: 'Design'
  },
  { 
    id: 5, 
    from: 'support@vendor.com', 
    fromName: 'Vendor Support',
    subject: 'Monthly service report - January 2024', 
    preview: 'Please find attached your monthly service report covering all activities...', 
    time: '3 days ago',
    date: '2024-01-12',
    unread: false,
    starred: false,
    hasAttachment: true,
    label: 'Reports'
  }
];

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: string }) => {
  const variants = {
    Business: 'bg-blue-100 text-blue-800 border-blue-200',
    Important: 'bg-red-100 text-red-800 border-red-200',
    Legal: 'bg-purple-100 text-purple-800 border-purple-200',
    Design: 'bg-green-100 text-green-800 border-green-200',
    Reports: 'bg-gray-100 text-gray-800 border-gray-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

export default function LeadManagerMailbox() {
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const filteredEmails = mockEmails.filter(email => {
    const matchesSearch = email.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && email.unread) ||
                         (statusFilter === 'read' && !email.unread) ||
                         (statusFilter === 'starred' && email.starred);
    return matchesSearch && matchesStatus;
  });

  const toggleEmailSelection = (emailId: number) => {
    setSelectedEmails(prev =>
      prev.includes(emailId)
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const unreadCount = mockEmails.filter(email => email.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mailbox</h1>
          <p className="text-gray-600 mt-2">Manage your email communications</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowComposeModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Compose Email
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{mockEmails.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{unreadCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Starred</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{mockEmails.filter(e => e.starred).length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails by sender, subject, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Emails</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="starred">Starred</option>
          </select>
        </div>
      </div>

      {/* Emails Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Inbox ({filteredEmails.length})</h2>
            {selectedEmails.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedEmails.length} selected</span>
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmails(filteredEmails.map(email => email.id));
                      } else {
                        setSelectedEmails([]);
                      }
                    }}
                  />
                </th>
                <th className="p-4 text-left w-16"></th>
                <th className="p-4 text-left text-gray-700 font-medium">From</th>
                <th className="p-4 text-left text-gray-700 font-medium">Subject</th>
                <th className="p-4 text-left text-gray-700 font-medium">Label</th>
                <th className="p-4 text-left text-gray-700 font-medium">Time</th>
                <th className="p-4 text-left text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map((email, index) => (
                <motion.tr
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer ${
                    email.unread ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleEmailSelection(email.id);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className={`transition-colors ${email.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        <Star className={`h-4 w-4 ${email.starred ? 'fill-current' : ''}`} />
                      </button>
                      {email.hasAttachment && (
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                        {email.fromName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`font-medium text-gray-900 ${email.unread ? 'font-semibold' : ''}`}>
                          {email.fromName}
                        </div>
                        <div className="text-sm text-gray-500">{email.from}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className={`text-gray-900 ${email.unread ? 'font-semibold' : 'font-medium'}`}>
                        {email.subject}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {email.preview}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={email.label}>{email.label}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{email.time}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Forward className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmails.length === 0 && (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No emails found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Compose Email Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowComposeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Compose Email</h3>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="email"
                    placeholder="Enter recipient email addresses..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
                    <input
                      type="email"
                      placeholder="CC recipients..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
                    <input
                      type="email"
                      placeholder="BCC recipients..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter email subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    placeholder="Type your message here..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                    <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">Support for PDF, DOC, XLS, images</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    Save Draft
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                    Schedule
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Send className="h-4 w-4" />
                    Send Email
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Detail Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEmail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedEmail.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">From: {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Reply className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Forward className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="prose max-w-none">
                  <p>Thank you for the meeting yesterday. I wanted to follow up on the proposal we discussed and provide some additional information that might be helpful for your decision-making process.</p>
                  
                  <p>As we mentioned, our solution can help streamline your lead management process by:</p>
                  
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Automating lead scoring and qualification</li>
                    <li>Integrating with your existing CRM system</li>
                    <li>Providing real-time analytics and reporting</li>
                    <li>Reducing manual data entry by 80%</li>
                  </ul>
                  
                  <p>I've attached the detailed proposal document for your review. Please let me know if you have any questions or if you'd like to schedule another meeting to discuss the implementation timeline.</p>
                  
                  <p>Best regards,<br />John Smith<br />Tech Solutions Inc.</p>
                </div>
                
                {selectedEmail.hasAttachment && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Paperclip className="h-4 w-4" />
                      <span>proposal-document.pdf (2.3 MB)</span>
                      <button className="ml-auto text-blue-600 hover:text-blue-700">Download</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}