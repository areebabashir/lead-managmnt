import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Copy,
  Download,
  MoreVertical,
  ChevronDown,
  Inbox,
  Star,
  StarOff,
  MailOpen,
  MailCheck,
  RotateCcw,
  Paperclip
} from 'lucide-react';
import { emailAPI, Email, Contact } from '../../services/emailAPI';
import { useAuth } from '../../contexts/AuthContext';

const EmailManager: React.FC = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'sent' | 'inbox'>('sent');
  
  // Sent emails state
  const [sentEmails, setSentEmails] = useState<Email[]>([]);
  const [sentCurrentPage, setSentCurrentPage] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  
  // Inbox emails state
  const [inboxEmails, setInboxEmails] = useState<Email[]>([]);
  const [inboxCurrentPage, setInboxCurrentPage] = useState(1);
  const [inboxTotalPages, setInboxTotalPages] = useState(1);
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Sent emails filters
  const [statusFilter, setStatusFilter] = useState('sent');
  
  // Inbox filters
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'starred'>('all');
  
  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const { hasPermission } = useAuth();

  // Load emails based on active tab
  useEffect(() => {
    if (activeTab === 'sent') {
      fetchSentEmails();
    } else {
      fetchInboxEmails();
    }
  }, [activeTab, sentCurrentPage, statusFilter, inboxCurrentPage, inboxFilter]);

  // Auto-sync inbox on first load
  useEffect(() => {
    if (activeTab === 'inbox' && inboxEmails.length === 0) {
      handleSyncInbox();
    }
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Fetch sent emails
  const fetchSentEmails = async () => {
    try {
      setLoading(true);
      const response = await emailAPI.getUserEmails(sentCurrentPage, 20, statusFilter);
      if (response.success) {
        setSentEmails(response.data.emails);
        setSentTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch sent emails');
    } finally {
      setLoading(false);
    }
  };

  // Fetch inbox emails
  const fetchInboxEmails = async () => {
    try {
      setLoading(true);
      const filters = {
        unreadOnly: inboxFilter === 'unread',
        starredOnly: inboxFilter === 'starred'
      };
      const response = await emailAPI.getInboxEmails(inboxCurrentPage, 20, filters);
      if (response.success) {
        setInboxEmails(response.data.emails);
        setInboxTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch inbox emails');
    } finally {
      setLoading(false);
    }
  };

  // Sync inbox emails
  const handleSyncInbox = async () => {
    try {
      setSyncing(true);
      const response = await emailAPI.syncInboxEmails(10);
      if (response.success) {
        setSuccess(`Synced ${response.data.synced} emails from Gmail`);
        setLastSyncTime(new Date());
        fetchInboxEmails(); // Refresh inbox after sync
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sync inbox');
    } finally {
      setSyncing(false);
    }
  };

  // Inbox-specific handlers
  const handleMarkAsRead = async (emailId: string, isRead: boolean) => {
    try {
      const response = await emailAPI.markEmailAsRead(emailId, isRead);
      if (response.success) {
        setSuccess(`Email marked as ${isRead ? 'read' : 'unread'}`);
        fetchInboxEmails(); // Refresh inbox
      }
    } catch (error: any) {
      setError(error.message || 'Failed to mark email');
    }
  };

  const handleToggleStar = async (emailId: string) => {
    try {
      const response = await emailAPI.toggleEmailStar(emailId);
      if (response.success) {
        setSuccess('Email star toggled');
        fetchInboxEmails(); // Refresh inbox
      }
    } catch (error: any) {
      setError(error.message || 'Failed to toggle star');
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;

    try {
      setLoading(true);
      const response = await emailAPI.deleteEmail(emailId);
      if (response.success) {
        setSuccess('Email deleted successfully');
        if (activeTab === 'sent') {
          fetchSentEmails();
        } else {
          fetchInboxEmails();
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete email');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduled = async (emailId: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled email?')) return;

    try {
      setLoading(true);
      const response = await emailAPI.cancelScheduledEmail(emailId);
      if (response.success) {
        setSuccess('Scheduled email cancelled successfully');
        fetchSentEmails();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to cancel email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async (emailId: string) => {
    try {
      setLoading(true);
      const response = await emailAPI.sendEmailNow(emailId);
      if (response.success) {
        setSuccess('Email sent successfully');
        fetchSentEmails();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />;
      case 'sending':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'received':
        return <Mail className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      case 'received':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get current emails based on active tab
  const getCurrentEmails = () => {
    return activeTab === 'sent' ? sentEmails : inboxEmails;
  };

  const getCurrentPage = () => {
    return activeTab === 'sent' ? sentCurrentPage : inboxCurrentPage;
  };

  const getTotalPages = () => {
    return activeTab === 'sent' ? sentTotalPages : inboxTotalPages;
  };

  const setCurrentPage = (page: number) => {
    if (activeTab === 'sent') {
      setSentCurrentPage(page);
    } else {
      setInboxCurrentPage(page);
    }
  };

  const filteredEmails = getCurrentEmails().filter(email => {
    const searchLower = searchTerm.toLowerCase();
    return email.subject.toLowerCase().includes(searchLower) ||
           email.recipient.name.toLowerCase().includes(searchLower) ||
           email.recipient.email.toLowerCase().includes(searchLower) ||
           email.sender.name.toLowerCase().includes(searchLower) ||
           email.sender.email.toLowerCase().includes(searchLower);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Email copied to clipboard!');
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadEmail = (email: Email) => {
    const content = `Subject: ${email.subject}\n\n${email.body}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `email-${email._id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Manager</h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'sent' ? 'Manage your sent emails - drafts, scheduled, and sent' : 'Manage your inbox - received emails from Gmail'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/ai-assistant/email'}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Generate Email
          </button>
          {activeTab === 'inbox' && (
            <button
              onClick={handleSyncInbox}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {syncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {syncing ? 'Syncing...' : 'Sync Inbox'}
            </button>
          )}
          <button
            onClick={activeTab === 'sent' ? fetchSentEmails : fetchInboxEmails}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Sent Items
            </div>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'inbox'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Inbox className="h-4 w-4" />
              Inbox
              {inboxEmails.some(email => !email.metadata?.isRead) && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {inboxEmails.filter(email => !email.metadata?.isRead).length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'sent' 
                  ? "Search emails by subject, recipient name, or email..." 
                  : "Search emails by subject, sender name, or email..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            {activeTab === 'sent' ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            ) : (
              <select
                value={inboxFilter}
                onChange={(e) => setInboxFilter(e.target.value as 'all' | 'unread' | 'starred')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Emails</option>
                <option value="unread">Unread Only</option>
                <option value="starred">Starred Only</option>
              </select>
            )}
          </div>
        </div>
        {activeTab === 'inbox' && lastSyncTime && (
          <div className="mt-3 text-sm text-gray-500">
            Last synced: {lastSyncTime.toLocaleString()}
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
            <p className="text-gray-600">Loading emails...</p>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {activeTab === 'sent' ? 'No sent emails found' : 'No inbox emails found'}
            </p>
            {activeTab === 'inbox' && (
              <button
                onClick={handleSyncInbox}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sync Inbox
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email) => (
              <div key={email._id} className={`p-6 hover:bg-gray-50 transition-colors ${!email.metadata?.isRead && activeTab === 'inbox' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(email.status)}
                      <h3 className={`text-lg font-medium truncate ${!email.metadata?.isRead && activeTab === 'inbox' ? 'font-bold' : 'text-gray-900'}`}>
                        {email.subject}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                        {email.status}
                      </span>
                      {email.metadata?.isStarred && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      {email.metadata?.attachments && email.metadata.attachments.length > 0 && (
                        <Paperclip className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      {activeTab === 'sent' ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">To:</span>
                          <span>{email.recipient.name}</span>
                          <span className="text-gray-400">({email.recipient.email})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">From:</span>
                          <span>{email.sender.name}</span>
                          <span className="text-gray-400">({email.sender.email})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {activeTab === 'sent' ? (
                        <>
                          <span>Created: {formatDate(email.createdAt)}</span>
                          {email.sentDate && (
                            <span>Sent: {formatDate(email.sentDate)}</span>
                          )}
                          {email.scheduledDate && email.status === 'scheduled' && (
                            <span>Scheduled: {formatDate(email.scheduledDate)}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Received: {formatDate(email.metadata?.receivedDate || email.createdAt)}</span>
                          {email.metadata?.isRead ? (
                            <span className="text-green-600">✓ Read</span>
                          ) : (
                            <span className="text-blue-600 font-medium">● Unread</span>
                          )}
                        </>
                      )}
                    </div>
                    
                    {activeTab === 'sent' && email.tracking.opened && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ Opened {email.tracking.openedAt && formatDate(email.tracking.openedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {/* Inbox-specific actions */}
                    {activeTab === 'inbox' && (
                      <>
                        <button
                          onClick={() => handleMarkAsRead(email._id, !email.metadata?.isRead)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={email.metadata?.isRead ? "Mark as Unread" : "Mark as Read"}
                        >
                          {email.metadata?.isRead ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleToggleStar(email._id)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title={email.metadata?.isStarred ? "Unstar" : "Star"}
                        >
                          {email.metadata?.isStarred ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedEmail(email);
                        setShowEmailModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="View Email"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(`${email.subject}\n\n${email.body}`)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Copy Email"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => downloadEmail(email)}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Download Email"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === email._id ? null : email._id)}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {openDropdownId === email._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          {activeTab === 'sent' ? (
                            <>
                              {/* Debug info - remove this after testing */}
                              <div className="px-4 py-2 text-xs text-gray-500 border-b">
                                Status: {email.status}
                              </div>
                              
                              {/* Draft email options */}
                              {email.status === 'draft' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      handleSendNow(email._id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Send className="h-4 w-4" />
                                    Send Now
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOpenDropdownId(null);
                                      // Navigate to email generator with this email
                                      window.location.href = '/ai/email-generator';
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                </>
                              )}
                              
                              {/* Scheduled email options */}
                              {email.status === 'scheduled' && (
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleCancelScheduled(email._id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancel Schedule
                                </button>
                              )}
                              
                              {/* Failed email options */}
                              {email.status === 'failed' && (
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleSendNow(email._id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Send className="h-4 w-4" />
                                  Retry Send
                                </button>
                              )}
                              
                              {/* Sending email options */}
                              {email.status === 'sending' && (
                                <div className="w-full text-left px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Currently Sending...
                                </div>
                              )}
                              
                              {/* Sent email options */}
                              {email.status === 'sent' && (
                                <div className="w-full text-left px-4 py-2 text-sm text-green-600 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  Email Sent Successfully
                                </div>
                              )}
                              
                              {/* Delete option for non-sent emails */}
                              {email.status !== 'sent' && email.status !== 'sending' && (
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    handleDeleteEmail(email._id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Inbox email options */}
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleMarkAsRead(email._id, !email.metadata?.isRead);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {email.metadata?.isRead ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                                {email.metadata?.isRead ? 'Mark as Unread' : 'Mark as Read'}
                              </button>
                              
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleToggleStar(email._id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                {email.metadata?.isStarred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                                {email.metadata?.isStarred ? 'Unstar' : 'Star'}
                              </button>
                              
                              <button
                                onClick={() => {
                                  setOpenDropdownId(null);
                                  handleDeleteEmail(email._id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {getTotalPages() > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, getCurrentPage() - 1))}
            disabled={getCurrentPage() === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {getCurrentPage()} of {getTotalPages()}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(getTotalPages(), getCurrentPage() + 1))}
            disabled={getCurrentPage() === getTotalPages()}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900">{selectedEmail.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeTab === 'sent' ? 'Recipient' : 'Sender'}
                </label>
                <p className="text-gray-900">
                  {activeTab === 'sent' 
                    ? `${selectedEmail.recipient.name} (${selectedEmail.recipient.email})`
                    : `${selectedEmail.sender.name} (${selectedEmail.sender.email})`
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedEmail.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmail.status)}`}>
                    {selectedEmail.status}
                  </span>
                  {activeTab === 'inbox' && selectedEmail.metadata?.isStarred && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
              
              {activeTab === 'inbox' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Read Status</label>
                  <div className="flex items-center gap-2">
                    {selectedEmail.metadata?.isRead ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <MailCheck className="h-4 w-4" />
                        Read
                      </span>
                    ) : (
                      <span className="text-blue-600 flex items-center gap-1">
                        <MailOpen className="h-4 w-4" />
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {selectedEmail.body}
                  </pre>
                </div>
              </div>
              
              {selectedEmail.aiContext && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Context</label>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Type:</strong> {selectedEmail.aiContext.emailType}<br/>
                      <strong>Tone:</strong> {selectedEmail.aiContext.tone}<br/>
                      <strong>Generated by:</strong> {selectedEmail.aiContext.generatedBy}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmailManager;



              >

                <option value="all">All Emails</option>

                <option value="unread">Unread Only</option>

                <option value="starred">Starred Only</option>

              </select>

            )}

          </div>

        </div>

        {activeTab === 'inbox' && lastSyncTime && (

          <div className="mt-3 text-sm text-gray-500">

            Last synced: {lastSyncTime.toLocaleString()}

          </div>

        )}

      </div>



      {/* Email List */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">

        {loading ? (

          <div className="p-8 text-center">

            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />

            <p className="text-gray-600">Loading emails...</p>

          </div>

        ) : filteredEmails.length === 0 ? (

          <div className="p-8 text-center">

            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />

            <p className="text-gray-600">

              {activeTab === 'sent' ? 'No sent emails found' : 'No inbox emails found'}

            </p>

            {activeTab === 'inbox' && (

              <button

                onClick={handleSyncInbox}

                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"

              >

                Sync Inbox

              </button>

            )}

          </div>

        ) : (

          <div className="divide-y divide-gray-200">

            {filteredEmails.map((email) => (

              <div key={email._id} className={`p-6 hover:bg-gray-50 transition-colors ${!email.metadata?.isRead && activeTab === 'inbox' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>

                <div className="flex items-start justify-between">

                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-3 mb-2">

                      {getStatusIcon(email.status)}

                      <h3 className={`text-lg font-medium truncate ${!email.metadata?.isRead && activeTab === 'inbox' ? 'font-bold' : 'text-gray-900'}`}>

                        {email.subject}

                      </h3>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>

                        {email.status}

                      </span>

                      {email.metadata?.isStarred && (

                        <Star className="h-4 w-4 text-yellow-500 fill-current" />

                      )}

                      {email.metadata?.attachments && email.metadata.attachments.length > 0 && (

                        <Paperclip className="h-4 w-4 text-gray-400" />

                      )}

                    </div>

                    

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">

                      {activeTab === 'sent' ? (

                        <div className="flex items-center gap-1">

                          <span className="font-medium">To:</span>

                          <span>{email.recipient.name}</span>

                          <span className="text-gray-400">({email.recipient.email})</span>

                        </div>

                      ) : (

                        <div className="flex items-center gap-1">

                          <span className="font-medium">From:</span>

                          <span>{email.sender.name}</span>

                          <span className="text-gray-400">({email.sender.email})</span>

                        </div>

                      )}

                    </div>

                    

                    <div className="flex items-center gap-4 text-sm text-gray-500">

                      {activeTab === 'sent' ? (

                        <>

                          <span>Created: {formatDate(email.createdAt)}</span>

                          {email.sentDate && (

                            <span>Sent: {formatDate(email.sentDate)}</span>

                          )}

                          {email.scheduledDate && email.status === 'scheduled' && (

                            <span>Scheduled: {formatDate(email.scheduledDate)}</span>

                          )}

                        </>

                      ) : (

                        <>

                          <span>Received: {formatDate(email.metadata?.receivedDate || email.createdAt)}</span>

                          {email.metadata?.isRead ? (

                            <span className="text-green-600">✓ Read</span>

                          ) : (

                            <span className="text-blue-600 font-medium">● Unread</span>

                          )}

                        </>

                      )}

                    </div>

                    

                    {activeTab === 'sent' && email.tracking.opened && (

                      <div className="mt-2 text-sm text-green-600">

                        ✓ Opened {email.tracking.openedAt && formatDate(email.tracking.openedAt)}

                      </div>

                    )}

                  </div>

                  

                  <div className="flex items-center gap-2 ml-4">

                    {/* Inbox-specific actions */}

                    {activeTab === 'inbox' && (

                      <>

                        <button

                          onClick={() => handleMarkAsRead(email._id, !email.metadata?.isRead)}

                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                          title={email.metadata?.isRead ? "Mark as Unread" : "Mark as Read"}

                        >

                          {email.metadata?.isRead ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}

                        </button>

                        

                        <button

                          onClick={() => handleToggleStar(email._id)}

                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"

                          title={email.metadata?.isStarred ? "Unstar" : "Star"}

                        >

                          {email.metadata?.isStarred ? (

                            <Star className="h-4 w-4 text-yellow-500 fill-current" />

                          ) : (

                            <StarOff className="h-4 w-4" />

                          )}

                        </button>

                      </>

                    )}

                    

                    <button

                      onClick={() => {

                        setSelectedEmail(email);

                        setShowEmailModal(true);

                      }}

                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"

                      title="View Email"

                    >

                      <Eye className="h-4 w-4" />

                    </button>

                    

                    <button

                      onClick={() => copyToClipboard(`${email.subject}\n\n${email.body}`)}

                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"

                      title="Copy Email"

                    >

                      <Copy className="h-4 w-4" />

                    </button>

                    

                    <button

                      onClick={() => downloadEmail(email)}

                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"

                      title="Download Email"

                    >

                      <Download className="h-4 w-4" />

                    </button>

                    

                    <div className="relative">

                      <button 

                        onClick={() => setOpenDropdownId(openDropdownId === email._id ? null : email._id)}

                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"

                      >

                        <MoreVertical className="h-4 w-4" />

                      </button>

                      

                      {openDropdownId === email._id && (

                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">

                          {activeTab === 'sent' ? (

                            <>

                              {/* Debug info - remove this after testing */}

                              <div className="px-4 py-2 text-xs text-gray-500 border-b">

                                Status: {email.status}

                              </div>

                              

                              {/* Draft email options */}

                              {email.status === 'draft' && (

                                <>

                                  <button

                                    onClick={() => {

                                      setOpenDropdownId(null);

                                      handleSendNow(email._id);

                                    }}

                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                                  >

                                    <Send className="h-4 w-4" />

                                    Send Now

                                  </button>

                                  <button

                                    onClick={() => {

                                      setOpenDropdownId(null);

                                      // Navigate to email generator with this email

                                      window.location.href = '/ai/email-generator';

                                    }}

                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                                  >

                                    <Edit className="h-4 w-4" />

                                    Edit

                                  </button>

                                </>

                              )}

                              

                              {/* Scheduled email options */}

                              {email.status === 'scheduled' && (

                                <button

                                  onClick={() => {

                                    setOpenDropdownId(null);

                                    handleCancelScheduled(email._id);

                                  }}

                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"

                                >

                                  <XCircle className="h-4 w-4" />

                                  Cancel Schedule

                                </button>

                              )}

                              

                              {/* Failed email options */}

                              {email.status === 'failed' && (

                                <button

                                  onClick={() => {

                                    setOpenDropdownId(null);

                                    handleSendNow(email._id);

                                  }}

                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                                >

                                  <Send className="h-4 w-4" />

                                  Retry Send

                                </button>

                              )}

                              

                              {/* Sending email options */}

                              {email.status === 'sending' && (

                                <div className="w-full text-left px-4 py-2 text-sm text-gray-500 flex items-center gap-2">

                                  <RefreshCw className="h-4 w-4 animate-spin" />

                                  Currently Sending...

                                </div>

                              )}

                              

                              {/* Sent email options */}

                              {email.status === 'sent' && (

                                <div className="w-full text-left px-4 py-2 text-sm text-green-600 flex items-center gap-2">

                                  <CheckCircle className="h-4 w-4" />

                                  Email Sent Successfully

                                </div>

                              )}

                              

                              {/* Delete option for non-sent emails */}

                              {email.status !== 'sent' && email.status !== 'sending' && (

                                <button

                                  onClick={() => {

                                    setOpenDropdownId(null);

                                    handleDeleteEmail(email._id);

                                  }}

                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"

                                >

                                  <Trash2 className="h-4 w-4" />

                                  Delete

                                </button>

                              )}

                            </>

                          ) : (

                            <>

                              {/* Inbox email options */}

                              <button

                                onClick={() => {

                                  setOpenDropdownId(null);

                                  handleMarkAsRead(email._id, !email.metadata?.isRead);

                                }}

                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                              >

                                {email.metadata?.isRead ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}

                                {email.metadata?.isRead ? 'Mark as Unread' : 'Mark as Read'}

                              </button>

                              

                              <button

                                onClick={() => {

                                  setOpenDropdownId(null);

                                  handleToggleStar(email._id);

                                }}

                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"

                              >

                                {email.metadata?.isStarred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}

                                {email.metadata?.isStarred ? 'Unstar' : 'Star'}

                              </button>

                              

                              <button

                                onClick={() => {

                                  setOpenDropdownId(null);

                                  handleDeleteEmail(email._id);

                                }}

                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"

                              >

                                <Trash2 className="h-4 w-4" />

                                Delete

                              </button>

                            </>

                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>



      {/* Pagination */}

      {getTotalPages() > 1 && (

        <div className="flex items-center justify-center gap-2">

          <button

            onClick={() => setCurrentPage(Math.max(1, getCurrentPage() - 1))}

            disabled={getCurrentPage() === 1}

            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"

          >

            Previous

          </button>

          

          <span className="px-4 py-2 text-sm text-gray-600">

            Page {getCurrentPage()} of {getTotalPages()}

          </span>

          

          <button

            onClick={() => setCurrentPage(Math.min(getTotalPages(), getCurrentPage() + 1))}

            disabled={getCurrentPage() === getTotalPages()}

            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"

          >

            Next

          </button>

        </div>

      )}



      {/* Email Detail Modal */}

      {showEmailModal && selectedEmail && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

            <div className="p-6 border-b border-gray-200">

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>

                <button

                  onClick={() => setShowEmailModal(false)}

                  className="text-gray-400 hover:text-gray-600"

                >

                  <XCircle className="h-6 w-6" />

                </button>

              </div>

            </div>

            

            <div className="p-6 space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>

                <p className="text-gray-900">{selectedEmail.subject}</p>

              </div>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  {activeTab === 'sent' ? 'Recipient' : 'Sender'}

                </label>

                <p className="text-gray-900">

                  {activeTab === 'sent' 

                    ? `${selectedEmail.recipient.name} (${selectedEmail.recipient.email})`

                    : `${selectedEmail.sender.name} (${selectedEmail.sender.email})`

                  }

                </p>

              </div>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>

                <div className="flex items-center gap-2">

                  {getStatusIcon(selectedEmail.status)}

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmail.status)}`}>

                    {selectedEmail.status}

                  </span>

                  {activeTab === 'inbox' && selectedEmail.metadata?.isStarred && (

                    <Star className="h-4 w-4 text-yellow-500 fill-current" />

                  )}

                </div>

              </div>

              

              {activeTab === 'inbox' && (

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Read Status</label>

                  <div className="flex items-center gap-2">

                    {selectedEmail.metadata?.isRead ? (

                      <span className="text-green-600 flex items-center gap-1">

                        <MailCheck className="h-4 w-4" />

                        Read

                      </span>

                    ) : (

                      <span className="text-blue-600 flex items-center gap-1">

                        <MailOpen className="h-4 w-4" />

                        Unread

                      </span>

                    )}

                  </div>

                </div>

              )}

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">

                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">

                    {selectedEmail.body}

                  </pre>

                </div>

              </div>

              

              {selectedEmail.aiContext && (

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Context</label>

                  <div className="bg-blue-50 rounded-lg p-4">

                    <p className="text-sm text-gray-700">

                      <strong>Type:</strong> {selectedEmail.aiContext.emailType}<br/>

                      <strong>Tone:</strong> {selectedEmail.aiContext.tone}<br/>

                      <strong>Generated by:</strong> {selectedEmail.aiContext.generatedBy}

                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}



      {/* Success/Error Messages */}

      {success && (

        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">

          {success}

        </div>

      )}

      {error && (

        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50">

          {error}

        </div>

      )}

    </div>

  );

};



export default EmailManager;




