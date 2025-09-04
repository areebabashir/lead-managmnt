import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Calendar, 
  CheckSquare, 
  ArrowRight, 
  Download, 
  Copy, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Clock,
  Target,
  MessageSquare,
  History,
  Edit
} from 'lucide-react';
import { aiAPI, MeetingNotesRequest } from '../../services/aiAPI';
import { useAuth } from '../../contexts/AuthContext';

interface MeetingNote {
  id: string;
  title?: string;
  date?: string;
  participants?: string[];
  agenda?: string[];
  keyPoints?: string[];
  actionItems?: string[];
  nextSteps?: string[];
  notes?: string;
  response?: string;
  metadata?: any;
  createdAt: string;
}

const MeetingNotes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [meetingHistory, setMeetingHistory] = useState<MeetingNote[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [formData, setFormData] = useState<MeetingNotesRequest>({
    meetingTitle: '',
    participants: [''],
    agenda: [''],
    keyPoints: [''],
    actionItems: [''],
    nextSteps: [''],
    additionalNotes: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchMeetingHistory();
  }, []);

  const fetchMeetingHistory = async () => {
    try {
      const response = await aiAPI.getAIInteractions(20, 0);
      if (response.success && Array.isArray(response.data)) {
        const meetingInteractions = response.data.filter((item: any) => item.type === 'meeting_notes');
        setMeetingHistory(meetingInteractions);
      } else {
        setMeetingHistory([]);
      }
    } catch (error) {
      console.error('Error fetching meeting history:', error);
      setMeetingHistory([]);
    }
  };

  const handleGenerateNotes = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await aiAPI.generateMeetingNotes(formData);
      if (response.success) {
        setGeneratedNotes(response.data.response);
        setSuccess('Meeting notes generated successfully!');
        fetchMeetingHistory(); // Refresh history
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate meeting notes');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayFieldChange = (field: keyof MeetingNotesRequest, index: number, value: string) => {
    const newArray = [...(formData[field] as string[])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: keyof MeetingNotesRequest) => {
    const currentArray = formData[field] as string[];
    setFormData({ ...formData, [field]: [...currentArray, ''] });
  };

  const removeArrayItem = (field: keyof MeetingNotesRequest, index: number) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Meeting notes copied to clipboard!');
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedNotes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `meeting-notes-${formData.meetingTitle || 'meeting'}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderArrayField = (
    field: keyof MeetingNotesRequest,
    label: string,
    placeholder: string,
    icon: React.ComponentType<any>
  ) => {
    const Icon = icon;
    const array = formData[field] as string[];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </label>
        <div className="space-y-2">
          {array.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                placeholder={`${placeholder} ${index + 1}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {array.length > 1 && (
                <button
                  onClick={() => removeArrayItem(field, index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addArrayItem(field)}
            className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {label.slice(0, -1)}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Meeting Notes</h1>
          <p className="text-gray-600 mt-1">Generate comprehensive meeting notes with AI assistance</p>
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
        {/* Meeting Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Details
            </h2>

            <div className="space-y-4">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  value={formData.meetingTitle}
                  onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                  placeholder="Enter meeting title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Participants */}
              {renderArrayField('participants', 'Participants', 'Participant name', Users)}

              {/* Agenda */}
              {renderArrayField('agenda', 'Agenda Items', 'Agenda item', CheckSquare)}

              {/* Key Points */}
              {renderArrayField('keyPoints', 'Key Points', 'Key point', MessageSquare)}

              {/* Action Items */}
              {renderArrayField('actionItems', 'Action Items', 'Action item', Target)}

              {/* Next Steps */}
              {renderArrayField('nextSteps', 'Next Steps', 'Next step', ArrowRight)}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional notes or context..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateNotes}
                disabled={loading || !formData.meetingTitle}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                {loading ? 'Generating...' : 'Generate Meeting Notes'}
              </button>
            </div>
          </div>

          {/* Meeting History */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Meetings</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {meetingHistory.map((meeting, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {meeting.title || meeting.metadata?.meetingTitle || 'Meeting'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {(meeting.notes || meeting.response || '').substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Notes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Meeting Notes
              </h2>
              {generatedNotes && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedNotes)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadNotes}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {generatedNotes ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {generatedNotes}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate meeting notes to see the result here</p>
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

export default MeetingNotes;
