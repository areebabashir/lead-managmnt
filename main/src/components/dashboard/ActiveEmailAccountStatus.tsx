import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { emailAccountAPI, EmailAccount } from '../../services/emailAccountAPI';

interface ActiveEmailAccountStatusProps {
  onConnectionChange?: (connected: boolean) => void;
}

const ActiveEmailAccountStatus: React.FC<ActiveEmailAccountStatusProps> = ({ onConnectionChange }) => {
  const [activeAccount, setActiveAccount] = useState<EmailAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveEmailAccount();
  }, []);

  const fetchActiveEmailAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await emailAccountAPI.getActiveEmailAccount();
      
      if (response.success && response.emailAccount) {
        setActiveAccount(response.emailAccount);
        onConnectionChange?.(true);
      } else {
        setActiveAccount(null);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Error fetching active email account:', error);
      setError('Failed to load email account status');
      setActiveAccount(null);
      onConnectionChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionStatus = () => {
    if (isLoading) {
      return {
        icon: AlertCircle,
        text: 'Checking connection...',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }

    if (error || !activeAccount) {
      return {
        icon: XCircle,
        text: 'No active email account',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    if (activeAccount.hasGoogleToken) {
      return {
        icon: CheckCircle,
        text: 'Connected & Active',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }

    return {
      icon: AlertCircle,
      text: 'Not connected',
      color: 'text-primary',
      bgColor: 'bg-primary/5',
      borderColor: 'border-primary/20'
    };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${status.bgColor} ${status.borderColor} border rounded-lg p-3`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Active Email Account</span>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
          <span className={`text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>
      
      {activeAccount ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 font-medium">
              {activeAccount.displayName || activeAccount.email}
            </span>
            <span className="text-xs text-gray-500">
              {activeAccount.email}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              Last synced: {activeAccount.metadata?.lastSynced 
                ? new Date(activeAccount.metadata.lastSynced).toLocaleDateString()
                : 'Never'
              }
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeAccount.settings?.syncInbox 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Inbox {activeAccount.settings?.syncInbox ? 'On' : 'Off'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeAccount.settings?.syncCalendar 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                Calendar {activeAccount.settings?.syncCalendar ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-600">
          {error || 'No email account is currently active. Please configure one in Settings.'}
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => window.location.href = '/support/settings'}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
        >
          <Settings className="h-3 w-3" />
          Manage Email Accounts
        </button>
      </div>
    </motion.div>
  );
};

export default ActiveEmailAccountStatus;
