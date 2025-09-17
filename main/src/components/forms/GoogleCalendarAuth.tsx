import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, ExternalLink, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { GoogleCalendarIntegration } from '@/services/googleCalendarAPI';

interface GoogleCalendarAuthProps {
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export default function GoogleCalendarAuth({ onConnectionChange, className = '' }: GoogleCalendarAuthProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsChecking(true);
      const connected = await GoogleCalendarIntegration.isConnected();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await GoogleCalendarIntegration.connect();
      
      // Check status after connection
      await checkConnectionStatus();
      
      toast({
        title: "Success",
        description: "Google Calendar connected successfully!",
      });
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await GoogleCalendarIntegration.disconnect();
      
      setIsConnected(false);
      onConnectionChange?.(false);
      
      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully!",
      });
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
        Checking Google Calendar status...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {isConnected ? (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Google Calendar Connected</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
            ) : (
              'Disconnect'
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <XCircle className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Google Calendar Not Connected</span>
          </div>
          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            Connect Google Calendar
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Compact version for smaller spaces
export function GoogleCalendarAuthCompact({ onConnectionChange }: { onConnectionChange?: (connected: boolean) => void }) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsChecking(true);
      const connected = await GoogleCalendarIntegration.isConnected();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await GoogleCalendarIntegration.connect();
      await checkConnectionStatus();
      
      toast({
        title: "Success",
        description: "Google Calendar connected successfully!",
      });
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect to Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await GoogleCalendarIntegration.disconnect();
      setIsConnected(false);
      onConnectionChange?.(false);
      
      toast({
        title: "Success",
        description: "Google Calendar disconnected successfully!",
      });
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
        Checking...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isConnected ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDisconnect}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs text-green-700 hover:bg-green-100 transition-colors"
        >
          <CheckCircle className="h-3 w-3" />
          {isLoading ? 'Disconnecting...' : 'Connected'}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <Calendar className="h-3 w-3" />
          {isLoading ? 'Connecting...' : 'Connect'}
        </motion.button>
      )}
    </div>
  );
}
