import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Copy, 
  Download, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  History, 
  Settings,
  Lightbulb,
  FileText,
  MessageSquare,
  Target,
  Zap
} from 'lucide-react';
import { aiAPI, CustomPromptRequest } from '../../services/aiAPI';
import { useAuth } from '../../contexts/AuthContext';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

interface PromptHistory {
  id: string;
  prompt: string;
  response: string;
  category?: string;
  createdAt: string;
}

const CustomPrompts: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<PromptTemplate[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const [formData, setFormData] = useState<CustomPromptRequest>({
    prompt: '',
    context: {
      type: 'general',
      additionalInfo: ''
    }
  });

  const [saveTemplateData, setSaveTemplateData] = useState({
    name: '',
    description: '',
    category: 'general'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchPromptHistory();
    fetchSavedTemplates();
  }, []);

  const fetchPromptHistory = async () => {
    try {
      const response = await aiAPI.getAIInteractions(20, 0);
      if (response.success && Array.isArray(response.data)) {
        const customInteractions = response.data.filter((item: any) => item.type === 'custom_prompt');
        setPromptHistory(customInteractions);
      } else {
        setPromptHistory([]);
      }
    } catch (error) {
      console.error('Error fetching prompt history:', error);
      setPromptHistory([]);
    }
  };

  const fetchSavedTemplates = async () => {
    try {
      const response = await aiAPI.getAITemplates();
      if (response.success && Array.isArray(response.data)) {
        setSavedTemplates(response.data);
      } else {
        setSavedTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setSavedTemplates([]);
    }
  };

  const handleGenerateResponse = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await aiAPI.generateCustomPrompt(formData);
      if (response.success) {
        setGeneratedResponse(response.data.response);
        setSuccess('Response generated successfully!');
        fetchPromptHistory(); // Refresh history
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate response');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setError('');
      setSuccess('');

      const templateData = {
        name: saveTemplateData.name,
        description: saveTemplateData.description,
        category: saveTemplateData.category,
        prompt: formData.prompt,
        isFavorite: false
      };

      const response = await aiAPI.saveAITemplate(templateData);
      if (response.success) {
        setSuccess('Template saved successfully!');
        setShowSaveModal(false);
        setSaveTemplateData({ name: '', description: '', category: 'general' });
        fetchSavedTemplates(); // Refresh templates
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save template');
    }
  };

  const handleUseTemplate = (template: PromptTemplate) => {
    setFormData({
      ...formData,
      prompt: template.prompt,
      context: {
        ...formData.context,
        type: template.category
      }
    });
    setShowTemplates(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Response copied to clipboard!');
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadResponse = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedResponse], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ai-response-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const promptCategories = [
    { value: 'general', label: 'General', icon: MessageSquare },
    { value: 'business', label: 'Business', icon: Target },
    { value: 'creative', label: 'Creative', icon: Lightbulb },
    { value: 'technical', label: 'Technical', icon: Settings },
    { value: 'analysis', label: 'Analysis', icon: FileText }
  ];

  const quickPrompts = [
    {
      name: 'Email Draft',
      prompt: 'Write a professional email to [recipient] about [topic]. The tone should be [tone] and include [key points].',
      category: 'business'
    },
    {
      name: 'Meeting Summary',
      prompt: 'Summarize the following meeting notes and extract key action items: [meeting notes]',
      category: 'business'
    },
    {
      name: 'Content Ideas',
      prompt: 'Generate 10 creative content ideas for [topic/industry] that would engage our target audience.',
      category: 'creative'
    },
    {
      name: 'Problem Analysis',
      prompt: 'Analyze this problem and provide potential solutions: [problem description]',
      category: 'analysis'
    },
    {
      name: 'Technical Explanation',
      prompt: 'Explain [technical concept] in simple terms that a non-technical person can understand.',
      category: 'technical'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Custom Prompts</h1>
          <p className="text-gray-600 mt-1">Create custom AI prompts for any task</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-4 w-4" />
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
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
        {/* Prompt Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Prompts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Prompts
            </h2>
            <div className="space-y-2">
              {quickPrompts.map((quickPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({
                    ...formData,
                    prompt: quickPrompt.prompt,
                    context: { ...formData.context, type: quickPrompt.category }
                  })}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">{quickPrompt.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{quickPrompt.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Custom Prompt
            </h2>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.context?.type || 'general'}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, type: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {promptCategories.map(category => {
                    const Icon = category.icon;
                    return (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Prompt</label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Enter your custom prompt here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context</label>
                <textarea
                  value={formData.context?.additionalInfo || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    context: { ...formData.context, additionalInfo: e.target.value }
                  })}
                  placeholder="Any additional context or information..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleGenerateResponse}
                  disabled={loading || !formData.prompt.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {loading ? 'Generating...' : 'Generate Response'}
                </button>

                {formData.prompt.trim() && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Save as Template
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Saved Templates */}
          {showTemplates && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Templates</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedTemplates.map((template) => (
                  <div key={template.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                      {template.isFavorite && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="text-xs text-orange-600 hover:text-orange-700"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt History */}
          {showHistory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prompts</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {promptHistory.map((prompt, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {prompt.category || 'Custom Prompt'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {prompt.prompt.substring(0, 100)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generated Response */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Response
              </h2>
              {generatedResponse && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedResponse)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadResponse}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {generatedResponse ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                    {generatedResponse}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate a response to see the result here</p>
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

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save as Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={saveTemplateData.name}
                  onChange={(e) => setSaveTemplateData({ ...saveTemplateData, name: e.target.value })}
                  placeholder="Enter template name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={saveTemplateData.description}
                  onChange={(e) => setSaveTemplateData({ ...saveTemplateData, description: e.target.value })}
                  placeholder="Enter description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={saveTemplateData.category}
                  onChange={(e) => setSaveTemplateData({ ...saveTemplateData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {promptCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CustomPrompts;
