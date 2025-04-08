import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileInfo, FileType, UploadStatus } from '@/lib/types';
import { getPresignedUploadUrl } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

interface FileUploaderProps {
  type: FileType;
  accept: Record<string, string[]>;
  maxSize: number;
  onUploadComplete: (fileInfo: FileInfo) => void;
  folderName?: string;
}

export default function FileUploader({ 
  type, 
  accept, 
  maxSize, 
  onUploadComplete,
  folderName = ''
}: FileUploaderProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Only process the first file
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    
    try {
      // Create a unique filename with original extension
      const fileExtension = file.name.split('.').pop();
      const key = `${folderName ? folderName + '/' : ''}${uuidv4()}.${fileExtension}`;
      
      // Get presigned URL for upload
      const presignedUrl = await getPresignedUploadUrl(
        key, 
        file.type, 
        type === 'video'
      );
      
      // Upload the file directly to S3
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          const fileInfo: FileInfo = {
            id: uuidv4(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            uploadedAt: new Date(),
            status: 'success',
            progress: 100,
            url: presignedUrl.split('?')[0], // Remove query params to get the base URL
            folder: folderName
          };
          
          onUploadComplete(fileInfo);
          setUploading(false);
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };
      
      xhr.onerror = () => {
        setError('An error occurred during the upload');
        setUploading(false);
      };
      
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setUploading(false);
    }
  }, [type, folderName, onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: uploading
  });
  
  // Handle file rejection errors
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.name} className="text-red-500 text-sm mt-2">
      {errors.map(e => <p key={e.code}>{e.message}</p>)}
    </div>
  ));

  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium">Uploading... {uploadProgress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop the file here' : `Drag and drop your ${type} file here`}
            </p>
            <p className="text-sm text-gray-500">
              or <span className="text-blue-500 font-medium">browse</span> to select a file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'video' ? 'MP4, MOV or WebM' : 'MP3, WAV or OGG'} files only (max {Math.round(maxSize / (1024 * 1024))}MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {fileRejectionItems.length > 0 && (
        <div className="mt-3">
          {fileRejectionItems}
        </div>
      )}
    </div>
  );
} 