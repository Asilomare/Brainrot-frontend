'use client';

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import FileUploader from '@/components/FileUploader';
import FolderBrowser from '@/components/FolderBrowser';
import CreateFolderForm from '@/components/CreateFolderForm';
import { FileInfo } from '@/lib/types';
import { listFolders } from '@/lib/s3';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UploadVideoPage() {
  const [folderName, setFolderName] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState<boolean>(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFolderBrowser, setShowFolderBrowser] = useState<boolean>(false);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false);
  const [parentFolderForNewFolder, setParentFolderForNewFolder] = useState<string | null>(null);
  
  // File types accepted for video uploads
  const acceptedFileTypes = {
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
    'video/webm': ['.webm']
  };
  
  // Maximum file size (100MB)
  const maxFileSize = 100 * 1024 * 1024;

  // Fetch existing top-level folders when the component mounts
  useEffect(() => {
    async function fetchFolders() {
      try {
        setIsLoadingFolders(true);
        const folders = await listFolders(true); // true for video folders
        setExistingFolders(folders);
        setError(null);
      } catch (err) {
        console.error('Error fetching folders:', err);
        setError('Failed to load existing folders. Please try again.');
      } finally {
        setIsLoadingFolders(false);
      }
    }

    fetchFolders();
  }, []);
  
  // Handle folder selection from the folder browser
  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolder(folderPath);
    setFolderName(folderPath);
    
    // Extract just the folder name for display
    const folderNameOnly = folderPath.split('/').pop() || folderPath;
    setFolderName(folderNameOnly);
    
    setIsCreatingFolder(true);
    setShowFolderBrowser(false);
  };
  
  // Handle creating a new folder or subfolder
  const handleCreateFolder = (newFolderName: string, parentPath: string | null | undefined) => {
    let fullPath = newFolderName;
    
    // If there's a parent path, combine them
    if (parentPath) {
      fullPath = `${parentPath}/${newFolderName}`;
    }
    
    setSelectedFolder(fullPath);
    setFolderName(newFolderName);
    setIsCreatingFolder(true);
    setIsCreatingNewFolder(false);
    setParentFolderForNewFolder(null);
  };
  
  // Handle initiating new subfolder creation
  const handleNewSubfolder = (parentPath: string | null = null) => {
    setParentFolderForNewFolder(parentPath);
    setIsCreatingNewFolder(true);
    setShowFolderBrowser(false);
  };
  
  // Handle upload complete
  const handleUploadComplete = (fileInfo: FileInfo) => {
    setUploadedFiles(prev => [...prev, fileInfo]);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Get display name for folder path
  const getFolderDisplayName = (path: string): string => {
    // If it's a multi-level path, show the full path with slashes replaced by " / "
    if (path.includes('/')) {
      return path.replace(/_/g, ' ').replace(/\//g, ' / ');
    }
    
    // Otherwise just replace underscores with spaces
    return path.replace(/_/g, ' ');
  };
  
  // Reset all states when user wants to upload to a different folder
  const handleReset = () => {
    setUploadedFiles([]);
    setFolderName('');
    setIsCreatingFolder(false);
    setSelectedFolder(null);
    setShowFolderBrowser(false);
    setIsCreatingNewFolder(false);
    setParentFolderForNewFolder(null);
  };
  
  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Videos</h1>
              <p className="mt-1 text-sm text-gray-500">Upload your videos to use in montage creation.</p>
            </div>

            {/* Error message if folders failed to load */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Folder Selection Area */}
            {!isCreatingFolder && !isCreatingNewFolder && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Choose Where to Upload Videos
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Select an existing folder or create a new one for your videos.
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  {/* Toggle folder browser */}
                  {!showFolderBrowser ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setShowFolderBrowser(true)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                          </svg>
                          Browse Existing Folders
                        </button>
                        
                        <button
                          onClick={() => handleNewSubfolder()}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Create New Folder
                        </button>
                      </div>
                      
                      {existingFolders.length === 0 && !isLoadingFolders && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                          </svg>
                          <p className="mt-2">No folders found. Create a new folder to get started.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-medium text-gray-900">
                          Select a Folder
                        </h4>
                        <button
                          onClick={() => setShowFolderBrowser(false)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <FolderBrowser 
                        isVideo={true}
                        onSelectFolder={handleFolderSelect}
                        selectedFolder={selectedFolder}
                      />
                      
                      <div className="flex justify-between pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleNewSubfolder(selectedFolder)}
                          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                          disabled={!selectedFolder}
                        >
                          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Create Subfolder Here
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Create New Folder Form */}
            {isCreatingNewFolder && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {parentFolderForNewFolder ? 'Create New Subfolder' : 'Create New Folder'}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {parentFolderForNewFolder 
                      ? `Add a subfolder inside ${getFolderDisplayName(parentFolderForNewFolder)}`
                      : 'Create a new top-level folder for your videos'}
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <CreateFolderForm
                    parentPath={parentFolderForNewFolder}
                    onCreateFolder={handleCreateFolder}
                    onCancel={() => {
                      setIsCreatingNewFolder(false);
                      setParentFolderForNewFolder(null);
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Selected Folder & File Uploader section */}
            {isCreatingFolder && (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Selected Folder</h3>
                        <p className="mt-1 text-sm text-indigo-600 font-medium">
                          {selectedFolder ? getFolderDisplayName(selectedFolder) : folderName.replace(/_/g, ' ')}
                        </p>
                      </div>
                      
                      {uploadedFiles.length === 0 && (
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Choose Different Folder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              
                <div className="bg-white shadow sm:rounded-md">
                  <div className="px-4 py-5 sm:p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Upload Video to {selectedFolder ? getFolderDisplayName(selectedFolder) : folderName.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag and drop your video files here, or click to browse.
                      </p>
                    </div>
                    
                    <FileUploader
                      type="video"
                      accept={acceptedFileTypes}
                      maxSize={maxFileSize}
                      onUploadComplete={handleUploadComplete}
                      folderName={selectedFolder || folderName}
                    />
                  </div>
                </div>
              </>
            )}
            
            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white shadow sm:rounded-md">
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Videos</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {uploadedFiles.map((file) => (
                        <li key={file.id} className="p-4 hover:bg-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <svg className="h-10 w-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)} • Uploaded {file.uploadedAt.toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Uploaded Successfully
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-500">
                      {uploadedFiles.length} video{uploadedFiles.length !== 1 ? 's' : ''} uploaded to &quot;{selectedFolder ? getFolderDisplayName(selectedFolder) : folderName.replace(/_/g, ' ')}&quot;
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Upload to a Different Folder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
} 