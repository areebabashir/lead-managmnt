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
  Edit
} from 'lucide-react';
import { aiAPI, EmailGenerationRequest } from '../../services/aiAPI';
import { userAPI, User as UserType } from '../../services/userAPI';
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
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchUsers();
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

  const fetchEmailHistory = async () => {
    try {
      const response = await aiAPI.getAIInteractions(20, 0);
      if (response.success && Array.isArray(response.data)) {
        const emailInteractions = response.data.filter((item: any) => item.type === 'email');
        setEmailHistory(emailInteractions);
      } else {
        setEmailHistory([]);
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

      const response = await aiAPI.generateEmail(formData);
      if (response.success) {
        setGeneratedEmail(response.data.response);
        setSuccess('Email generated successfully!');
        fetchEmailHistory(); // Refresh history
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate email');
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
    const element = document.createElement('a');
    const file = new Blob([generatedEmail], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `email-${formData.emailType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Email Generator</h1>
          <p className="text-gray-600 mt-1">Generate professional emails with AI assistance</p>
        </div>
        <div className="flex items-center gap-3">
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

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  value={formData.context.subject}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, subject: e.target.value }
                  })}
                  placeholder="Enter email subject..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
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
                {emailHistory.map((email, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {email.metadata?.emailType || 'Email'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {email.response.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Email */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Generated Email
              </h2>
              {generatedEmail && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedEmail)}
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
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {generatedEmail}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate an email to see the result here</p>
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
    </div>
  );
};

export default EmailGenerator;
