import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Copy, 
  Download, 
  RefreshCw, 
  User, 
  FileText, 
  Settings,
  Sparkles,
  Clock,
  Target,
  MessageSquare,
  Save,
  History,
  Trash2,
  Edit,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  Search,
  Database
} from 'lucide-react';
import { aiAPI, EmailGenerationRequest } from '../../services/aiAPI';
import { userAPI, User as UserType } from '../../services/userAPI';
import { emailAPI, Contact, Email } from '../../services/emailAPI';
import { useAuth } from '../../contexts/AuthContext';

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  tone: string;
}

const EmailGenerator: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<Email | null>(null);
  const [emailHistory, setEmailHistory] = useState<Email[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const [formData, setFormData] = useState<EmailGenerationRequest>({
    emailType: 'follow_up',
    context: {
      subject: '',
      tone: 'professional',
      keyPoints: [''],
      callToAction: '',
      customInstructions: ''
    }
  });

  const [emailContent, setEmailContent] = useState({
    subject: '',
    body: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchContacts();
    fetchEmailHistory();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await emailAPI.getContactsForEmail(contactSearch);
      if (response.success) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchEmailHistory = async () => {
    try {
      const response = await emailAPI.getUserEmails(1, 20);
      if (response.success) {
        setEmailHistory(response.data.emails);
      }
    } catch (error) {
      console.error('Error fetching email history:', error);
      setEmailHistory([]);
    }
  };

  const handleGenerateEmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const requestData = {
        ...formData,
        contactId: selectedContact?._id,
        subject: emailContent.subject,
        body: emailContent.body
      };

      const response = await emailAPI.generateAndSaveEmail(requestData);
      if (response.success) {
        setGeneratedEmail(response.data.email);
        setEmailContent({
          subject: response.data.generatedContent.subject,
          body: response.data.generatedContent.body
        });
        setSuccess('Email generated and saved as draft!');
        fetchEmailHistory();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!generatedEmail) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await emailAPI.sendEmailNow(generatedEmail._id);
      if (response.success) {
        setSuccess('Email sent successfully!');
        setGeneratedEmail(response.data);
        fetchEmailHistory();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!generatedEmail || !scheduledDate || !scheduledTime) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const scheduleDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const response = await emailAPI.scheduleEmail(generatedEmail._id, scheduleDateTime.toISOString());
      
      if (response.success) {
        setSuccess('Email scheduled successfully!');
        setGeneratedEmail(response.data);
        setShowScheduleModal(false);
        fetchEmailHistory();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to schedule email');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedEmail) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await emailAPI.saveEmailDraft(
        generatedEmail._id,
        emailContent.subject,
        emailContent.body
      );
      
      if (response.success) {
        setSuccess('Email draft saved successfully!');
        setGeneratedEmail(response.data);
        fetchEmailHistory();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPointChange = (index: number, value: string) => {
    const newKeyPoints = [...formData.context.keyPoints];
    newKeyPoints[index] = value;
    setFormData({
      ...formData,
      context: { ...formData.context, keyPoints: newKeyPoints }
    });
  };

  const addKeyPoint = () => {
    setFormData({
      ...formData,
      context: { 
        ...formData.context, 
        keyPoints: [...formData.context.keyPoints, ''] 
      }
    });
  };

  const removeKeyPoint = (index: number) => {
    const newKeyPoints = formData.context.keyPoints.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      context: { ...formData.context, keyPoints: newKeyPoints }
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

  const downloadEmail = () => {
    const content = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `email-${formData.emailType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const emailTypes = [
    { value: 'follow_up', label: 'Follow Up', icon: Clock },
    { value: 'introduction', label: 'Introduction', icon: User },
    { value: 'proposal', label: 'Proposal', icon: FileText },
    { value: 'reminder', label: 'Reminder', icon: Target },
    { value: 'thank_you', label: 'Thank You', icon: MessageSquare }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Email Generator</h1>
          <p className="text-gray-600 mt-1">Generate, edit, and send professional emails with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/ai-assistant/email-manager'}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Database className="h-4 w-4" />
            Email Manager
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <History className="h-4 w-4" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Email Configuration
            </h2>

            <div className="space-y-4">
              {/* Contact Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Contact</label>
                <div className="relative">
                  <button
                    onClick={() => setShowContactDropdown(!showContactDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <span className="text-sm">
                      {selectedContact ? `${selectedContact.fullName} (${selectedContact.email})` : 'Select a contact...'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showContactDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            value={contactSearch}
                            onChange={(e) => setContactSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredContacts.map((contact) => (
                          <button
                            key={contact._id}
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactDropdown(false);
                              setContactSearch('');
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm">{contact.fullName}</div>
                            <div className="text-xs text-gray-500">{contact.email}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {emailTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, emailType: type.value as any })}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          formData.emailType === type.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.context.tone}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, tone: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {tones.map(tone => (
                    <option key={tone.value} value={tone.value}>{tone.label}</option>
                  ))}
                </select>
              </div>

              {/* Key Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Points</label>
                <div className="space-y-2">
                  {formData.context.keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleKeyPointChange(index, e.target.value)}
                        placeholder={`Key point ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {formData.context.keyPoints.length > 1 && (
                        <button
                          onClick={() => removeKeyPoint(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addKeyPoint}
                    className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    + Add Key Point
                  </button>
                </div>
              </div>

              {/* Call to Action */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                <input
                  type="text"
                  value={formData.context.callToAction}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, callToAction: e.target.value }
                  })}
                  placeholder="What should the recipient do next?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
                <textarea
                  value={formData.context.customInstructions}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, customInstructions: e.target.value }
                  })}
                  placeholder="Any specific instructions for the AI..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateEmail}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
                {loading ? 'Generating...' : 'Generate Email'}
              </button>
            </div>
          </div>

          {/* Email History */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Emails</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {emailHistory.map((email) => (
                  <div key={email._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(email.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {email.recipient.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {email.subject}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        email.status === 'sent' ? 'bg-green-100 text-green-800' :
                        email.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                        email.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {email.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Email Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Editor
              </h2>
              {generatedEmail && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(`${emailContent.subject}\n\n${emailContent.body}`)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadEmail}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {generatedEmail ? (
              <div className="space-y-4">
                {/* Subject Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={emailContent.subject}
                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Body Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                  <textarea
                    value={emailContent.body}
                    onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter email body..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSendNow}
                    disabled={loading || generatedEmail.status === 'sent'}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send Now
                  </button>
                  
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    disabled={loading || generatedEmail.status === 'sent'}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </button>
                  
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate an email to see the editor here</p>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Email</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSchedule}
                disabled={loading || !scheduledDate || !scheduledTime}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Email'}
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailGenerator;

                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">

                      <div className="p-2">

                        <div className="relative">

                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />

                          <input

                            type="text"

                            placeholder="Search contacts..."

                            value={contactSearch}

                            onChange={(e) => setContactSearch(e.target.value)}

                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                          />

                        </div>

                      </div>

                      <div className="max-h-48 overflow-y-auto">

                        {filteredContacts.map((contact) => (

                          <button

                            key={contact._id}

                            onClick={() => {

                              setSelectedContact(contact);

                              setShowContactDropdown(false);

                              setContactSearch('');

                            }}

                            className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"

                          >

                            <div className="font-medium text-sm">{contact.fullName}</div>

                            <div className="text-xs text-gray-500">{contact.email}</div>

                          </button>

                        ))}

                      </div>

                    </div>

                  )}

                </div>

              </div>



              {/* Email Type */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>

                <div className="grid grid-cols-1 gap-2">

                  {emailTypes.map((type) => {

                    const Icon = type.icon;

                    return (

                      <button

                        key={type.value}

                        onClick={() => setFormData({ ...formData, emailType: type.value as any })}

                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${

                          formData.emailType === type.value

                            ? 'border-orange-500 bg-orange-50 text-orange-700'

                            : 'border-gray-200 hover:border-gray-300'

                        }`}

                      >

                        <Icon className="h-4 w-4" />

                        <span className="text-sm font-medium">{type.label}</span>

                      </button>

                    );

                  })}

                </div>

              </div>



              {/* Tone */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>

                <select

                  value={formData.context.tone}

                  onChange={(e) => setFormData({

                    ...formData,

                    context: { ...formData.context, tone: e.target.value as any }

                  })}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                >

                  {tones.map(tone => (

                    <option key={tone.value} value={tone.value}>{tone.label}</option>

                  ))}

                </select>

              </div>



              {/* Key Points */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Key Points</label>

                <div className="space-y-2">

                  {formData.context.keyPoints.map((point, index) => (

                    <div key={index} className="flex gap-2">

                      <input

                        type="text"

                        value={point}

                        onChange={(e) => handleKeyPointChange(index, e.target.value)}

                        placeholder={`Key point ${index + 1}...`}

                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                      />

                      {formData.context.keyPoints.length > 1 && (

                        <button

                          onClick={() => removeKeyPoint(index)}

                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                        >

                          <Trash2 className="h-4 w-4" />

                        </button>

                      )}

                    </div>

                  ))}

                  <button

                    onClick={addKeyPoint}

                    className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors"

                  >

                    + Add Key Point

                  </button>

                </div>

              </div>



              {/* Call to Action */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>

                <input

                  type="text"

                  value={formData.context.callToAction}

                  onChange={(e) => setFormData({

                    ...formData,

                    context: { ...formData.context, callToAction: e.target.value }

                  })}

                  placeholder="What should the recipient do next?"

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>



              {/* Custom Instructions */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>

                <textarea

                  value={formData.context.customInstructions}

                  onChange={(e) => setFormData({

                    ...formData,

                    context: { ...formData.context, customInstructions: e.target.value }

                  })}

                  placeholder="Any specific instructions for the AI..."

                  rows={3}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>



              {/* Generate Button */}

              <button

                onClick={handleGenerateEmail}

                disabled={loading}

                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"

              >

                {loading ? (

                  <RefreshCw className="h-5 w-5 animate-spin" />

                ) : (

                  <Sparkles className="h-5 w-5" />

                )}

                {loading ? 'Generating...' : 'Generate Email'}

              </button>

            </div>

          </div>



          {/* Email History */}

          {showHistory && (

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Emails</h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">

                {emailHistory.map((email) => (

                  <div key={email._id} className="p-3 bg-gray-50 rounded-lg">

                    <div className="flex items-center justify-between mb-2">

                      <div className="flex items-center gap-2">

                        {getStatusIcon(email.status)}

                        <span className="text-sm font-medium text-gray-900">

                          {email.recipient.name}

                        </span>

                      </div>

                      <span className="text-xs text-gray-500">

                        {new Date(email.createdAt).toLocaleDateString()}

                      </span>

                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">

                      {email.subject}

                    </p>

                    <div className="flex items-center gap-2 mt-2">

                      <span className={`text-xs px-2 py-1 rounded-full ${

                        email.status === 'sent' ? 'bg-green-100 text-green-800' :

                        email.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :

                        email.status === 'draft' ? 'bg-gray-100 text-gray-800' :

                        'bg-red-100 text-red-800'

                      }`}>

                        {email.status}

                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>



        {/* Generated Email Editor */}

        <div className="lg:col-span-2">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <div className="flex items-center justify-between mb-4">

              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">

                <Mail className="h-5 w-5" />

                Email Editor

              </h2>

              {generatedEmail && (

                <div className="flex items-center gap-2">

                  <button

                    onClick={() => copyToClipboard(`${emailContent.subject}\n\n${emailContent.body}`)}

                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"

                  >

                    <Copy className="h-4 w-4" />

                    Copy

                  </button>

                  <button

                    onClick={downloadEmail}

                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"

                  >

                    <Download className="h-4 w-4" />

                    Download

                  </button>

                </div>

              )}

            </div>



            {generatedEmail ? (

              <div className="space-y-4">

                {/* Subject Editor */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>

                  <input

                    type="text"

                    value={emailContent.subject}

                    onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                    placeholder="Enter email subject..."

                  />

                </div>



                {/* Body Editor */}

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>

                  <textarea

                    value={emailContent.body}

                    onChange={(e) => setEmailContent({ ...emailContent, body: e.target.value })}

                    rows={12}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                    placeholder="Enter email body..."

                  />

                </div>



                {/* Action Buttons */}

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">

                  <button

                    onClick={handleSendNow}

                    disabled={loading || generatedEmail.status === 'sent'}

                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"

                  >

                    <Send className="h-4 w-4" />

                    Send Now

                  </button>

                  

                  <button

                    onClick={() => setShowScheduleModal(true)}

                    disabled={loading || generatedEmail.status === 'sent'}

                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"

                  >

                    <Calendar className="h-4 w-4" />

                    Schedule

                  </button>

                  

                  <button

                    onClick={handleSaveDraft}

                    disabled={loading}

                    className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"

                  >

                    <Save className="h-4 w-4" />

                    Save Draft

                  </button>

                </div>

              </div>

            ) : (

              <div className="text-center py-12">

                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />

                <p className="text-gray-500">Generate an email to see the editor here</p>

              </div>

            )}



            {/* Success/Error Messages */}

            {success && (

              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">

                {success}

              </div>

            )}

            {error && (

              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">

                {error}

              </div>

            )}

          </div>

        </div>

      </div>



      {/* Schedule Modal */}

      {showScheduleModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl p-6 w-full max-w-md">

            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Email</h3>

            

            <div className="space-y-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>

                <input

                  type="date"

                  value={scheduledDate}

                  onChange={(e) => setScheduledDate(e.target.value)}

                  min={new Date().toISOString().split('T')[0]}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

              

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>

                <input

                  type="time"

                  value={scheduledTime}

                  onChange={(e) => setScheduledTime(e.target.value)}

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                />

              </div>

            </div>

            

            <div className="flex items-center gap-3 mt-6">

              <button

                onClick={handleSchedule}

                disabled={loading || !scheduledDate || !scheduledTime}

                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"

              >

                {loading ? 'Scheduling...' : 'Schedule Email'}

              </button>

              <button

                onClick={() => setShowScheduleModal(false)}

                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"

              >

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



export default EmailGenerator;
