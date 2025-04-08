import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileInfo, FileType } from '@/lib/types';
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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setErrors([]);

    const uploadPromises = acceptedFiles.map(file => {
      return new Promise<FileInfo>(async (resolve, reject) => {
        try {
          const uniqueFileName = `${uuidv4()}-${file.name}`;
          const key = `${folderName ? folderName + '/' : ''}${uniqueFileName}`;

          const presignedUrl = await getPresignedUploadUrl(
            key,
            file.type,
            type === 'video'
          );

          const xhr = new XMLHttpRequest();

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
                url: presignedUrl.split('?')[0],
                folder: folderName
              };
              onUploadComplete(fileInfo);
              resolve(fileInfo);
            } else {
              reject(new Error(`Upload failed for ${file.name}: Status ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error(`Network error during upload for ${file.name}`));
          };

          xhr.open('PUT', presignedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);

        } catch (err) {
          reject(new Error(`Failed to prepare upload for ${file.name}: ${err instanceof Error ? err.message : String(err)}`));
        }
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    const currentErrors: string[] = [];
    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error("Upload Error:", result.reason);
        const errorMessage = result.reason instanceof Error ? result.reason.message : 'An unknown upload error occurred.';
        currentErrors.push(errorMessage);
      }
    });

    setErrors(currentErrors);
    setIsUploading(false);

  }, [type, folderName, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
    disabled: isUploading
  });

  const rejectionMessages = fileRejections.flatMap(({ file, errors }) =>
    errors.map(e => `${file.name}: ${e.message}`)
  );

  const allErrors = [...rejectionMessages, ...errors];

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium">Uploading files...</p>
              <p className="text-sm text-gray-500">Please wait until all uploads are complete.</p>
            </div>
          </div>
        ) :
          <div className="space-y-2">
            <div className="flex justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop the files here' : `Drag and drop your ${type} files here`}
            </p>
            <p className="text-sm text-gray-500">
              or <span className="text-blue-500 font-medium">browse</span> to select files
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'video' ? 'MP4, MOV or WebM' : 'MP3, WAV or OGG'} files only (max {Math.round(maxSize / (1024 * 1024))}MB per file)
            </p>
          </div>
        }
      </div>

      {allErrors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium mb-1">Upload Issues:</p>
          <ul className="list-disc list-inside text-sm">
            {allErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}