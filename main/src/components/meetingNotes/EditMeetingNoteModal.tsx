import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Tag, 
  Folder,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ParticipantsManager } from './ParticipantsManager';
import { MeetingNote, MeetingNoteParticipant, UpdateMeetingNoteRequest } from '@/services/meetingNotesAPI';

interface EditMeetingNoteModalProps {
  meetingNote: MeetingNote;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNote: UpdateMeetingNoteRequest) => Promise<void>;
}

export const EditMeetingNoteModal: React.FC<EditMeetingNoteModalProps> = ({
  meetingNote,
  isOpen,
  onClose,
  onSave
}) => {
  // Form state
  const [meetingTitle, setMeetingTitle] = useState(meetingNote.meetingTitle);
  const [meetingDate, setMeetingDate] = useState(
    new Date(meetingNote.meetingDate).toISOString().split('T')[0]
  );
  const [participants, setParticipants] = useState<MeetingNoteParticipant[]>(meetingNote.participants);
  const [transcription, setTranscription] = useState(meetingNote.transcription || '');
  const [summary, setSummary] = useState(meetingNote.summary || '');
  const [tags, setTags] = useState<string[]>(meetingNote.tags);
  const [category, setCategory] = useState(meetingNote.category || '');
  const [newTag, setNewTag] = useState('');
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const originalDate = new Date(meetingNote.meetingDate).toISOString().split('T')[0];
    const hasChanged = 
      meetingTitle !== meetingNote.meetingTitle ||
      meetingDate !== originalDate ||
      transcription !== (meetingNote.transcription || '') ||
      summary !== (meetingNote.summary || '') ||
      category !== (meetingNote.category || '') ||
      JSON.stringify(tags) !== JSON.stringify(meetingNote.tags) ||
      JSON.stringify(participants) !== JSON.stringify(meetingNote.participants);
    
    setHasChanges(hasChanged);
  }, [meetingTitle, meetingDate, transcription, summary, category, tags, participants, meetingNote]);

  const handleSave = async () => {
    if (!meetingTitle.trim()) {
      return;
    }

    try {
      setSaving(true);
      
      const updateData: UpdateMeetingNoteRequest = {
        meetingTitle,
        meetingDate: new Date(meetingDate).toISOString(),
        participants,
        transcription,
        summary,
        tags,
        category: category || undefined
      };

      await onSave(updateData);
    } catch (error) {
      console.error('Error saving meeting note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onKeyDown={handleKeyPress}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Meeting Note
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Details */}
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
                  <Label htmlFor="edit-meeting-title">
                    Meeting Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-meeting-title"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Enter meeting title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-meeting-date">Meeting Date</Label>
                  <Input
                    id="edit-meeting-date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Technical, Business, Planning..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-new-tag">Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="edit-new-tag"
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

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="Meeting transcript..."
                className="min-h-[200px] resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                {transcription.length} characters, {transcription.trim().split(/\s+/).length} words
              </p>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Meeting summary..."
                className="min-h-[150px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-orange-600">● You have unsaved changes</span>
              ) : (
                <span>No changes made</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !meetingTitle.trim() || !hasChanges}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-xs text-gray-500 text-center pt-2">
            💡 Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to save
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

