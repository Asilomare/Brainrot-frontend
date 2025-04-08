// File types
export type FileType = 'video' | 'music';

// Upload status
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

// Upload file info
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadedAt: Date;
  status: UploadStatus;
  progress?: number;
  folder?: string;
  url?: string;
}

// Montage data
export interface MontageRequest {
  id: string;
  videoFolder: string;
  musicFolder: string;
  isMusicIncluded: boolean;
  videoLength: number;
  numClips: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt?: string;
  result?: {
    bucket: string;
    key: string;
    s3Url: string;
    publicUrl: string;
    orientation: 'portrait' | 'landscape';
    completedAt: string;
    error?: string;
  };
}

// Montage output
export interface MontageOutput {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  createdAt: Date;
  duration: number;
  videoFolder: string;
  musicFolder: string;
} 