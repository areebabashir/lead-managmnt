import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleCalendarIntegration } from '@/services/googleCalendarAPI';

interface GoogleCalendarAuthProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export default function GoogleCalendarAuth({ onConnectionChange, className = '' }: GoogleCalendarAuthProps) {
  const [connectionStatus, setConnectionStatus] = useState<{ 
    connected: boolean; 
    message?: string; 
    error?: string; 
    checking: boolean;
  }>({ connected: false, checking: true });

  useEffect(() => {
    checkConnectionStatus();
    // Check status every 30 seconds to keep it updated
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, checking: true }));
      const status = await GoogleCalendarIntegration.getConnectionStatus();
      
      setConnectionStatus({
        connected: status.connected,
        message: status.message || (status.connected ? 'Google Calendar is connected and ready' : 'Google Calendar connection failed'),
        error: undefined,
        checking: false
      });
      
      onConnectionChange?.(status.connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setConnectionStatus({
        connected: false,
        message: 'Failed to check Google Calendar status',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        checking: false
      });
      onConnectionChange?.(false);
    }
  };

  if (connectionStatus.checking) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>Checking Google Calendar status...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {connectionStatus.connected ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
        >
            <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-700">Google Calendar Connected</span>
            {connectionStatus.message && (
              <span className="text-xs text-green-600">{connectionStatus.message}</span>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <XCircle className="h-4 w-4 text-red-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-700">Google Calendar Not Connected</span>
            {connectionStatus.error && (
              <span className="text-xs text-red-600">{connectionStatus.error}</span>
            )}
            {connectionStatus.message && !connectionStatus.error && (
              <span className="text-xs text-red-600">{connectionStatus.message}</span>
            )}
          </div>
        </motion.div>
      )}
      
      {/* Manual refresh button */}
      <button
        onClick={checkConnectionStatus}
        disabled={connectionStatus.checking}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Refresh connection status"
      >
        <RefreshCw className={`h-4 w-4 ${connectionStatus.checking ? 'animate-spin' : ''}`} />
      </button>
    </motion.div>
  );
}

// Compact version for smaller spaces
export function GoogleCalendarAuthCompact({ onConnectionChange }: { onConnectionChange?: (connected: boolean) => void }) {
  const [connectionStatus, setConnectionStatus] = useState<{ 
    connected: boolean; 
    error?: string; 
    checking: boolean;
  }>({ connected: false, checking: true });

  useEffect(() => {
    checkConnectionStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, checking: true }));
      const connected = await GoogleCalendarIntegration.isConnected();
      setConnectionStatus({
        connected,
        error: undefined,
        checking: false
      });
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setConnectionStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        checking: false
      });
      onConnectionChange?.(false);
    }
  };

  if (connectionStatus.checking) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {connectionStatus.connected ? (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          <CheckCircle className="h-3 w-3" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700" title={connectionStatus.error}>
          <XCircle className="h-3 w-3" />
          <span>Not Connected</span>
        </div>
      )}
    </div>
  );
}