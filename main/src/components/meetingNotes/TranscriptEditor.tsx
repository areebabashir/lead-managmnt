import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Save, 
  RotateCcw, 
  Type, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  FileText,
  Clock,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { meetingNotesAPI } from '@/services/meetingNotesAPI';

interface TranscriptSegment {
  text: string;
  confidence: number;
  endTime: string;
}

interface TranscriptEditorProps {
  initialTranscript: string;
  segments?: TranscriptSegment[];
  confidence?: number;
  duration?: string;
  onTranscriptChange: (transcript: string) => void;
  onSave?: (transcript: string) => void;
  className?: string;
  readOnly?: boolean;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  initialTranscript,
  segments = [],
  confidence = 0,
  duration = '0s',
  onTranscriptChange,
  onSave,
  className = '',
  readOnly = false
}) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [originalTranscript] = useState(initialTranscript);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSegments, setShowSegments] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTranscript(initialTranscript);
    updateCounts(initialTranscript);
  }, [initialTranscript]);

  useEffect(() => {
    onTranscriptChange(transcript);
    updateCounts(transcript);
    setHasUnsavedChanges(transcript !== originalTranscript);
  }, [transcript, originalTranscript, onTranscriptChange]);

  const updateCounts = (text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim() === '' ? 0 : text.trim().split(/\s+/).length);
  };

  const handleTranscriptChange = (value: string) => {
    setTranscript(value);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(transcript);
      toast({
        title: 'Transcript Saved',
        description: 'Your changes have been saved successfully.',
      });
    }
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setTranscript(originalTranscript);
    setHasUnsavedChanges(false);
    toast({
      title: 'Transcript Reset',
      description: 'Transcript has been reset to original version.',
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      toast({
        title: 'Copied to Clipboard',
        description: 'Transcript has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy transcript to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'Transcript file has been downloaded.',
    });
  };

  const handleSegmentClick = (index: number, segment: TranscriptSegment) => {
    setSelectedSegment(index);
    
    // Find the segment text in the transcript and select it
    if (textareaRef.current) {
      const segmentText = segment.text.trim();
      const transcriptText = textareaRef.current.value;
      const startIndex = transcriptText.indexOf(segmentText);
      
      if (startIndex !== -1) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(startIndex, startIndex + segmentText.length);
      }
    }
  };

  const getConfidenceColor = (conf: number) => {
    return meetingNotesAPI.getConfidenceColor(conf);
  };

  const getConfidenceLabel = (conf: number) => {
    return meetingNotesAPI.getConfidenceLabel(conf);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats and Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Meeting Transcript
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {!readOnly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Preview
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                  
                  {hasUnsavedChanges && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={handleSave}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                    </>
                  )}
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Type className="h-4 w-4" />
              {wordCount} words, {charCount} characters
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {meetingNotesAPI.formatDuration(duration)}
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Confidence:</span>
              <Badge 
                variant="outline" 
                className={`${getConfidenceColor(confidence)} border-current`}
              >
                {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
              </Badge>
            </div>
            
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Confidence Warning */}
      {confidence < 0.6 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            This transcript has low confidence ({Math.round(confidence * 100)}%). 
            Please review and edit carefully for accuracy.
          </AlertDescription>
        </Alert>
      )}

      {/* Editor Tabs */}
      <Tabs value={showSegments ? 'segments' : 'editor'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="editor" 
            onClick={() => setShowSegments(false)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger 
            value="segments" 
            onClick={() => setShowSegments(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Segments ({segments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing && !readOnly ? (
              <Textarea
                ref={textareaRef}
                value={transcript}
                onChange={(e) => handleTranscriptChange(e.target.value)}
                placeholder="Your meeting transcript will appear here..."
                className="min-h-[400px] resize-none font-mono text-sm leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div 
                    className="min-h-[400px] font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-900 bg-gray-50 p-4 rounded-lg border"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {transcript || 'No transcript available yet.'}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="segments" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {segments.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {segments.map((segment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-200
                      ${selectedSegment === index 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => handleSegmentClick(index, segment)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          {segment.text.trim()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                        <span>{segment.endTime}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(segment.confidence)} border-current`}
                        >
                          {Math.round(segment.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transcript segments available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Segments will appear here after audio processing
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      {!readOnly && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span>💡 Tip: Click on segments above to jump to that part in the editor</span>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-orange-600">● Unsaved changes</span>
            )}
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+S</kbd>
            <span>to save</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Keyboard shortcuts
export const useTranscriptKeyboardShortcuts = (onSave?: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            if (onSave) onSave();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);
};

