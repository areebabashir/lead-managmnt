import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Mail, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap,
  Sparkles,
  BarChart3,
  Activity,
  Target,
  ArrowRight,
  Star,
  RefreshCw
} from 'lucide-react';
import { aiAPI } from '../../services/aiAPI';
import { useAuth } from '../../contexts/AuthContext';

interface AIStats {
  totalInteractions: number;
  interactionsByType: {
    email: number;
    meeting_notes: number;
    custom_prompt: number;
  };
  recentActivity: any[];
  topPrompts: any[];
  usageTrends: any[];
}

const AIAssistant: React.FC = () => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState([
    {
      title: 'Generate Email',
      description: 'Create professional emails',
      icon: Mail,
      href: '/ai-assistant/email',
      color: 'bg-primary'
    },
    {
      title: 'Meeting Notes',
      description: 'Summarize meeting discussions',
      icon: FileText,
      href: '/ai-assistant/meetings',
      color: 'bg-green-500'
    },
    {
      title: 'Custom Prompts',
      description: 'Ask anything with AI',
      icon: MessageSquare,
      href: '/ai-assistant/prompts',
      color: 'bg-primary'
    }
  ]);

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchAIStats();
  }, []);

  const fetchAIStats = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getAIStats();
      if (response.success) {
        setStats(response.data);
      } else {
        // Set default stats if API fails
        setStats({
          totalInteractions: 0,
          interactionsByType: {
            email: 0,
            meeting_notes: 0,
            custom_prompt: 0
          },
          recentActivity: [],
          topPrompts: [],
          usageTrends: []
        });
      }
    } catch (error) {
      console.error('Error fetching AI stats:', error);
      // Set default stats on error
      setStats({
        totalInteractions: 0,
        interactionsByType: {
          email: 0,
          meeting_notes: 0,
          custom_prompt: 0
        },
        recentActivity: [],
        topPrompts: [],
        usageTrends: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (type: string) => {
    if (!stats) return 0;
    const total = stats.interactionsByType.email + stats.interactionsByType.meeting_notes + stats.interactionsByType.custom_prompt;
    const count = stats.interactionsByType[type as keyof typeof stats.interactionsByType];
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-1">Your intelligent sales companion</p>
        </div>
        <button
          onClick={fetchAIStats}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => window.location.href = action.href}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInteractions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Emails Generated</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interactionsByType.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Meeting Notes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interactionsByType.meeting_notes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Custom Prompts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interactionsByType.custom_prompt}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Distribution */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Usage Distribution
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Email Generation</span>
                  <span className="text-sm text-gray-600">{getUsagePercentage('email')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('email')}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Meeting Notes</span>
                  <span className="text-sm text-gray-600">{getUsagePercentage('meeting_notes')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('meeting_notes')}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Custom Prompts</span>
                  <span className="text-sm text-gray-600">{getUsagePercentage('custom_prompt')}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getUsagePercentage('custom_prompt')}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {stats && stats.recentActivity && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bot className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.type === 'email' ? 'Email Generated' :
                       activity.type === 'meeting_notes' ? 'Meeting Notes Created' :
                       'Custom Prompt Used'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Features Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Features Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Generation</h3>
            <p className="text-sm text-gray-600">
              Generate professional emails with AI assistance. Choose from various templates and customize tone and content.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Meeting Notes</h3>
            <p className="text-sm text-gray-600">
              Transform meeting discussions into structured notes with key points, action items, and next steps.
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Custom Prompts</h3>
            <p className="text-sm text-gray-600">
              Ask anything with custom AI prompts. Get creative, analytical, or technical assistance for any task.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-900">Ready to get started?</h3>
            <p className="text-orange-700 mt-1">
              Choose from our AI-powered tools to enhance your sales productivity and communication.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/ai-assistant/email'}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Email Generator
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
