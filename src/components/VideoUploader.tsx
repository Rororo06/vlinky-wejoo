
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Video, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface VideoUploaderProps {
  onUploadSuccess?: (videoUrl: string, videoId: string) => void;
  requestId?: string;
  fanEmail?: string;
  creatorName?: string;
  inline?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onUploadSuccess,
  requestId,
  fanEmail,
  creatorName,
  inline = false
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detailedError, setDetailedError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is too large (>100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 100MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      // Set default title as file name without extension
      const defaultTitle = requestId 
        ? `Response for ${requestId}`
        : file.name.split('.').slice(0, -1).join('.');
        
      setVideoTitle(defaultTitle);
      setErrorMessage('');
      setDetailedError('');
    }
  };

  const uploadToBunny = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate requestId if this is for a fan request
    if (requestId === undefined && onUploadSuccess) {
      // Generate a unique ID if this is not for a specific request
      requestId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMessage('');
    setDetailedError('');

    try {
      // Convert file to base64 with progress tracking
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          // Reading progress
          const progress = Math.round((event.loaded / event.total) * 30);
          setUploadProgress(progress);
        }
      };
      
      reader.onloadend = async () => {
        const fileBase64 = reader.result as string;
        setUploadProgress(40);
        setIsProcessing(true);
        
        try {
          // Prepare additional data if this is for a fan request
          const additionalData = fanEmail ? {
            fanEmail,
            creatorName
          } : {};
          
          console.log("Uploading with params:", {
            fileName: selectedFile.name,
            title: videoTitle || selectedFile.name,
            requestId,
            ...additionalData
          });
          
          // Call Supabase Edge Function to upload to Bunny.net
          const { data, error } = await supabase.functions.invoke('bunny-upload', {
            body: {
              fileName: selectedFile.name,
              fileBase64,
              title: videoTitle || selectedFile.name,
              requestId,
              ...additionalData
            },
          });
          
          if (error) {
            console.error('Upload error:', error);
            setDetailedError(error.message || 'Failed to call the upload function');
            throw new Error(error.message || 'Failed to call the upload function');
          }
          
          if (!data || !data.success) {
            const errorMessage = data?.error || 'Upload failed: Unexpected response from server';
            const errorDetails = data?.details || 'No additional details available';
            console.error('Upload failed:', errorMessage, errorDetails);
            setDetailedError(`${errorMessage}. Details: ${errorDetails}`);
            throw new Error(errorMessage);
          }
          
          setUploadProgress(95);
          
          // If this is for a request, we don't need to save to video_uploads
          // as it will be updated in the video_requests table
          if (!fanEmail) {
            // Save to video_uploads table using direct query to bypass type issues
            const { error: dbError } = await supabase
              .from('video_uploads')
              .insert({
                creator_id: localStorage.getItem('creatorId'),
                video_url: data.videoUrl,
                video_id: data.requestId || requestId,
                title: videoTitle || selectedFile.name,
                status: 'ready'
              });
            
            if (dbError) {
              console.error('Database error:', dbError);
              setDetailedError(`Database error: ${dbError.message}`);
              throw new Error(`Database error: ${dbError.message}`);
            }
          }
          
          setUploadProgress(100);
          
          // Show different messages based on whether this is for a fan request
          if (fanEmail) {
            toast({
              title: "Response uploaded",
              description: "Your video response has been uploaded and sent to the fan.",
            });
          } else {
            toast({
              title: "Upload successful",
              description: "Your video has been uploaded and will be available shortly.",
            });
          }
          
          if (onUploadSuccess) {
            onUploadSuccess(data.videoUrl, requestId || data.requestId);
          }
          
          // Close dialog and reset state
          setIsDialogOpen(false);
          setSelectedFile(null);
          setVideoTitle('');
          setUploadProgress(0);
          setDetailedError('');
          
        } catch (invokeError) {
          console.error('Function invoke error:', invokeError);
          setErrorMessage(invokeError.message || "There was a problem uploading your video.");
          toast({
            title: "Upload failed",
            description: invokeError.message || "There was a problem uploading your video.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setErrorMessage("Failed to read the selected file.");
        setDetailedError("Browser could not read the file. Try a different file or browser.");
        toast({
          title: "File reading error",
          description: "Failed to read the selected file.",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      
      reader.readAsDataURL(selectedFile);
      
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || "An unexpected error occurred during upload.");
      setIsUploading(false);
      toast({
        title: "Upload error",
        description: "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setVideoTitle('');
    setUploadProgress(0);
    setErrorMessage('');
    setDetailedError('');
    setIsUploading(false);
    setIsProcessing(false);
  };

  // For inline use in dialogs, render the content without the dialog wrapper
  if (inline) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="video-title">Video Title</Label>
            <Input
              id="video-title"
              placeholder="Enter video title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="video-file">Video File</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-gray-500">
                Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Processing video...'}</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm space-y-2">
              <p className="font-medium">{errorMessage}</p>
              {detailedError && <p className="text-xs opacity-80">{detailedError}</p>}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            type="submit" 
            onClick={uploadToBunny} 
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (isProcessing ? "Processing..." : "Uploading...") : "Upload Video"}
          </Button>
        </div>
      </div>
    );
  }

  // For standalone use, include the dialog wrapper
  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)} 
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" /> Upload New Video
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        // Only allow closing if not actively uploading
        if (!isUploading || !isProcessing) {
          setIsDialogOpen(open);
          if (!open) resetUpload();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
            <DialogDescription>
              Upload a video file (MP4, WebM, MOV) up to 100MB.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="video-title">Video Title</Label>
              <Input
                id="video-title"
                placeholder="Enter video title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="video-file">Video File</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Processing video...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm space-y-2">
                <p className="font-medium">{errorMessage}</p>
                {detailedError && <p className="text-xs opacity-80">{detailedError}</p>}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (!isUploading) {
                  setIsDialogOpen(false);
                  resetUpload();
                }
              }} 
              disabled={isUploading && isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              onClick={uploadToBunny} 
              disabled={!selectedFile || isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? (isProcessing ? "Processing..." : "Uploading...") : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoUploader;
