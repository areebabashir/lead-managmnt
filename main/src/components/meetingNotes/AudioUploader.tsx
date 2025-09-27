import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileAudio, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  PlayCircle,
  StopCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { meetingNotesAPI } from '@/services/meetingNotesAPI';

interface AudioUploaderProps {
  onUploadSuccess: (data: {
    audioFileUrl: string;
    audioFileName: string;
    audioFileSize: number;
    transcript: string;
    confidence: number;
    duration: string;
    segments: any[];
    rawTranscriptData: any;
  }) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className = ''
}) => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    const validation = meetingNotesAPI.validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setUploadState('error');
      onUploadError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadState('idle');
  }, [onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    if (disabled || uploadState === 'uploading' || uploadState === 'processing') return;
    fileInputRef.current?.click();
  }, [disabled, uploadState]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState('uploading');
      setUploadProgress(0);
      setError('');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await meetingNotesAPI.generateTranscript(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState('processing');

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadState('success');
      onUploadSuccess(response.data);

    } catch (error: any) {
      setUploadState('error');
      setError(error.message || 'Failed to process audio file');
      onUploadError(error.message || 'Failed to process audio file');
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setError('');
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setAudioElement(null);
    }
    setIsPlaying(false);
  };

  const handlePlayPreview = () => {
    if (!selectedFile) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
      return;
    }

    if (audioElement) {
      audioElement.play();
      setIsPlaying(true);
      return;
    }

    const audio = new Audio();
    audio.src = URL.createObjectURL(selectedFile);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    audio.addEventListener('error', () => {
      setError('Unable to preview audio file');
    });
    
    setAudioElement(audio);
    audio.play();
    setIsPlaying(true);
  };

  const getStateIcon = () => {
    switch (uploadState) {
      case 'uploading':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-6 w-6 animate-spin text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Upload className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStateMessage = () => {
    switch (uploadState) {
      case 'uploading':
        return 'Uploading audio file...';
      case 'processing':
        return 'Processing with Google Speech-to-Text...';
      case 'success':
        return 'Transcript generated successfully!';
      case 'error':
        return error || 'Upload failed';
      default:
        return selectedFile 
          ? `${selectedFile.name} (${meetingNotesAPI.formatFileSize(selectedFile.size)})` 
          : 'Drop your WAV audio file here or click to browse';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : selectedFile 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }
          ${disabled || uploadState === 'uploading' || uploadState === 'processing' 
            ? 'opacity-50 cursor-not-allowed' 
            : ''
          }
        `}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,audio/wav,audio/wave"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploadState === 'uploading' || uploadState === 'processing'}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {getStateIcon()}
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {getStateMessage()}
            </p>
            
            {!selectedFile && (
              <p className="text-sm text-gray-500">
                Supports WAV files up to 50MB
              </p>
            )}
          </div>

          {selectedFile && uploadState === 'idle' && (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPreview();
                }}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <StopCircle className="h-4 w-4" />
                    Stop Preview
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* File Details */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileAudio className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {meetingNotesAPI.formatFileSize(selectedFile.size)} • WAV Audio
                </p>
              </div>
            </div>
            
            {uploadState === 'idle' && (
              <Button
                onClick={handleUpload}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Generate Transcript
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      {(uploadState === 'uploading' || uploadState === 'processing') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-center text-gray-600">
            {uploadState === 'uploading' 
              ? `Uploading... ${uploadProgress}%` 
              : 'Processing with AI...'
            }
          </p>
        </motion.div>
      )}

      {/* Error Alert */}
      {uploadState === 'error' && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Success Alert */}
      {uploadState === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Audio file processed successfully! Transcript is ready for editing.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Instructions */}
      {uploadState === 'idle' && !selectedFile && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            📝 Upload your meeting recording to automatically generate a transcript
          </p>
          <p className="text-xs text-gray-500">
            The transcript will be processed using Google Speech-to-Text AI
          </p>
        </div>
      )}
    </div>
  );
};
