import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  Download, 
  Copy, 
  Tag, 
  Folder, 
  User, 
  Zap,
  CheckCircle,
  AlertCircle,
  FileAudio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { MeetingNote, meetingNotesAPI } from '@/services/meetingNotesAPI';

interface MeetingNoteDetailModalProps {
  meetingNote: MeetingNote | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (note: MeetingNote) => void;
  onDelete?: (note: MeetingNote) => void;
}

export const MeetingNoteDetailModal: React.FC<MeetingNoteDetailModalProps> = ({
  meetingNote,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!meetingNote) return null;

  const handleCopyTranscript = async () => {
    if (!meetingNote.transcription) return;
    
    try {
      await navigator.clipboard.writeText(meetingNote.transcription);
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

  const handleCopySummary = async () => {
    if (!meetingNote.summary) return;
    
    try {
      await navigator.clipboard.writeText(meetingNote.summary);
      toast({
        title: 'Copied to Clipboard',
        description: 'Summary has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy summary to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTranscript = () => {
    if (!meetingNote.transcription) return;
    
    const blob = new Blob([meetingNote.transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingNote.meetingTitle}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'Transcript file has been downloaded.',
    });
  };

  const handleDownloadSummary = () => {
    if (!meetingNote.summary) return;
    
    const blob = new Blob([meetingNote.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingNote.meetingTitle}-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Download Started',
      description: 'Summary file has been downloaded.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Zap className="h-4 w-4 text-primary" />
        </motion.div>;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const renderParticipant = (participant: any, index: number) => {
    if (participant.type === 'contact' && participant.contactId) {
      return (
        <div key={index} className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
          <User className="h-4 w-4 text-primary" />
          <div>
            <p className="font-medium text-sm">{participant.contactId.fullName}</p>
            <p className="text-xs text-gray-600">{participant.contactId.email}</p>
            {participant.contactId.company && (
              <p className="text-xs text-gray-500">{participant.contactId.company}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs text-primary border-primary">
            Contact
          </Badge>
        </div>
      );
    }

    return (
      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <User className="h-4 w-4 text-gray-600" />
        <div>
          <p className="font-medium text-sm">{participant.name || 'Unknown'}</p>
          {participant.email && (
            <p className="text-xs text-gray-600">{participant.email}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          Manual
        </Badge>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {meetingNote.meetingTitle}
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(meetingNote)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(meetingNote)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meeting Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date & Time</p>
                  <p className="text-lg">{formatDate(meetingNote.meetingDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Created By</p>
                  <p className="text-lg">{meetingNote.createdBy.name}</p>
                  <p className="text-sm text-gray-500">{meetingNote.createdBy.email}</p>
                </div>
              </div>

              {meetingNote.category && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <Folder className="h-3 w-3" />
                    {meetingNote.category}
                  </Badge>
                </div>
              )}

              {meetingNote.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {meetingNote.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({meetingNote.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetingNote.participants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {meetingNote.participants.map(renderParticipant)}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No participants added</p>
              )}
            </CardContent>
          </Card>

          {/* Audio File Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Audio File Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">File Name</p>
                  <p className="text-sm">{meetingNote.audioFileName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Size</p>
                  <p className="text-sm">
                    {meetingNote.audioFileSize 
                      ? meetingNotesAPI.formatFileSize(meetingNote.audioFileSize)
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-sm">
                    {meetingNote.duration 
                      ? meetingNotesAPI.formatDuration(meetingNote.duration)
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>

              {meetingNote.confidence && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">Transcript Confidence</p>
                  <Badge 
                    variant="outline" 
                    className={`${meetingNotesAPI.getConfidenceColor(meetingNote.confidence)} border-current`}
                  >
                    {meetingNotesAPI.getConfidenceLabel(meetingNote.confidence)} ({Math.round(meetingNote.confidence * 100)}%)
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transcript" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transcript
                {getStatusIcon(meetingNote.transcriptionStatus)}
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Summary
                {getStatusIcon(meetingNote.summaryStatus)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Transcript
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(meetingNote.transcriptionStatus)}
                        {getStatusText(meetingNote.transcriptionStatus)}
                      </Badge>
                    </CardTitle>
                    
                    {meetingNote.transcription && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyTranscript}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadTranscript}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {meetingNote.transcription ? (
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                        {meetingNote.transcription}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No transcript available</p>
                      <p className="text-sm mt-1">
                        Status: {getStatusText(meetingNote.transcriptionStatus)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI Summary
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getStatusIcon(meetingNote.summaryStatus)}
                        {getStatusText(meetingNote.summaryStatus)}
                      </Badge>
                    </CardTitle>
                    
                    {meetingNote.summary && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopySummary}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadSummary}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {meetingNote.summary ? (
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {meetingNote.summary}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No summary available</p>
                      <p className="text-sm mt-1">
                        Status: {getStatusText(meetingNote.summaryStatus)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Created</p>
                  <p>{formatDate(meetingNote.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Last Updated</p>
                  <p>{formatDate(meetingNote.updatedAt)}</p>
                </div>
                {meetingNote.updatedBy && (
                  <div>
                    <p className="font-medium text-gray-600">Updated By</p>
                    <p>{meetingNote.updatedBy.name}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-600">Status</p>
                  <Badge variant={meetingNote.isActive ? "default" : "secondary"}>
                    {meetingNote.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

