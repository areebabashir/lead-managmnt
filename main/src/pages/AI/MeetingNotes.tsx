import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Calendar, 
  Save, 
  Clock,
  Sparkles,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { AudioUploader } from '@/components/meetingNotes/AudioUploader';
import { TranscriptEditor } from '@/components/meetingNotes/TranscriptEditor';
import { ParticipantsManager } from '@/components/meetingNotes/ParticipantsManager';
import { meetingNotesAPI, MeetingNoteParticipant } from '@/services/meetingNotesAPI';
import { useAuth } from '../../contexts/AuthContext';

// Workflow steps
type WorkflowStep = 'upload' | 'transcript' | 'details' | 'save';

interface TranscriptData {
  audioFileUrl: string;
  audioFileName: string;
  audioFileSize: number;
  transcript: string;
  confidence: number;
  duration: string;
  segments: any[];
  rawTranscriptData: any;
}

const MeetingNotes: React.FC = () => {
  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [loading, setLoading] = useState(false);
  
  // Audio and transcript data
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  // Meeting details
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [participants, setParticipants] = useState<MeetingNoteParticipant[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { hasPermission } = useAuth();

  // Handle audio upload success
  const handleAudioUploadSuccess = (data: TranscriptData) => {
    setTranscriptData(data);
    setEditedTranscript(data.transcript);
    setCurrentStep('transcript');
    setError('');
    setSuccess('Audio processed successfully! You can now edit the transcript.');
  };

  // Handle audio upload error
  const handleAudioUploadError = (error: string) => {
    setError(error);
    setCurrentStep('upload');
  };

  // Handle transcript changes
  const handleTranscriptChange = (transcript: string) => {
    setEditedTranscript(transcript);
  };

  // Generate AI summary
  const handleGenerateSummary = async () => {
    if (!editedTranscript.trim()) {
      setError('Please provide a transcript before generating summary');
      return;
    }

    try {
      setGeneratingSummary(true);
      setError('');

      const participantNames = participants.map(p => 
        p.type === 'simple' ? p.name || 'Unknown' : 'Contact'
      );

      const response = await meetingNotesAPI.generateSummary({
        transcript: editedTranscript,
        meetingTitle: meetingTitle || 'Meeting',
        participants: participantNames,
        duration: transcriptData?.duration,
        confidence: transcriptData?.confidence
      });

      if (response.success) {
        setSummary(response.data.summary);
        setSuccess('Summary generated successfully!');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Save meeting note
  const handleSaveMeetingNote = async () => {
    if (!transcriptData || !editedTranscript.trim() || !meetingTitle.trim()) {
      setError('Please provide meeting title and transcript before saving');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const meetingNoteData = {
        meetingTitle,
        meetingDate: new Date(meetingDate).toISOString(),
        participants,
        audioFileUrl: transcriptData.audioFileUrl,
        audioFileName: transcriptData.audioFileName,
        audioFileSize: transcriptData.audioFileSize,
        transcription: editedTranscript,
        rawTranscriptData: transcriptData.rawTranscriptData,
        summary: summary || undefined,
        duration: transcriptData.duration,
        confidence: transcriptData.confidence,
        tags,
        category: category || undefined
      };

      const response = await meetingNotesAPI.createMeetingNote(meetingNoteData);

      if (response.success) {
        setSuccess('Meeting note saved successfully!');
        setCurrentStep('save');
        
        toast({
          title: 'Meeting Note Saved',
          description: 'Your meeting note has been saved successfully.',
        });
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save meeting note');
    } finally {
      setLoading(false);
    }
  };

  // Reset to start new meeting note
  const handleStartNew = () => {
    setCurrentStep('upload');
    setTranscriptData(null);
    setEditedTranscript('');
    setSummary('');
    setMeetingTitle('');
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setParticipants([]);
    setTags([]);
    setCategory('');
    setError('');
    setSuccess('');
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Navigation between steps
  const handleNextStep = () => {
    if (currentStep === 'transcript' && editedTranscript.trim()) {
      setCurrentStep('details');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('transcript');
    } else if (currentStep === 'transcript') {
      setCurrentStep('upload');
    }
  };

  // Render workflow step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'upload', label: 'Upload Audio', icon: Upload },
      { key: 'transcript', label: 'Edit Transcript', icon: FileText },
      { key: 'details', label: 'Details & Summary', icon: Users },
      { key: 'save', label: 'Saved', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`
                  ml-3 text-sm font-medium
                  ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all duration-200
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meeting Notes
          </h1>
          <p className="text-gray-600">
            Upload your meeting audio, edit transcript, add meeting details, then generate AI-powered summary
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Meeting Audio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioUploader
                    onUploadSuccess={handleAudioUploadSuccess}
                    onUploadError={handleAudioUploadError}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'transcript' && transcriptData && (
            <motion.div
              key="transcript"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <TranscriptEditor
                initialTranscript={transcriptData.transcript}
                segments={transcriptData.segments}
                confidence={transcriptData.confidence}
                duration={transcriptData.duration}
                onTranscriptChange={handleTranscriptChange}
              />


              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex items-center gap-2"
                >
                  ← Back to Upload
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!editedTranscript.trim()}
                  className="flex items-center gap-2"
                >
                  Continue to Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Meeting Basic Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meeting-title">
                        Meeting Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="meeting-title"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="Enter meeting title..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-date">Meeting Date</Label>
                      <Input
                        id="meeting-date"
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Technical, Business, Planning..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-tag">Tags</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="new-tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                          className="flex items-center gap-2"
                        >
                          <Tag className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-red-500"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <ParticipantsManager
                participants={participants}
                onParticipantsChange={setParticipants}
              />

              {/* Summary Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Summary
                    </div>
                    <Button
                      onClick={handleGenerateSummary}
                      disabled={generatingSummary || !editedTranscript.trim() || !meetingTitle.trim()}
                      className="flex items-center gap-2"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-4 rounded-lg border whitespace-pre-wrap">
                        {summary}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">
                        Enter meeting title and participants above, then click "Generate Summary" to create an AI-powered summary with proper context
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio File Info */}
              {transcriptData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Audio File Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">File:</span>
                        <p className="font-medium">{transcriptData.audioFileName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <p className="font-medium">
                          {meetingNotesAPI.formatFileSize(transcriptData.audioFileSize)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">
                          {meetingNotesAPI.formatDuration(transcriptData.duration)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex items-center gap-2"
                >
                  ← Back to Transcript
                </Button>
                <Button
                  onClick={handleSaveMeetingNote}
                  disabled={loading || !meetingTitle.trim() || !editedTranscript.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Meeting Note
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 'save' && (
            <motion.div
              key="save"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Meeting Note Saved Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your meeting note has been saved and is now available in your meeting notes library.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={handleStartNew}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Create New Meeting Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Navigate to meeting notes manager
                        window.location.href = '/ai-assistant/meeting-notes-manager';
                      }}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View All Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MeetingNotes;