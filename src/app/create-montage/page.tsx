"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FolderBrowser from '@/components/FolderBrowser';
import { getFolderDisplayName } from '@/lib/utils';
import { createMontageRequest } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ClipLoader } from 'react-spinners';
import PageLayout from '@/components/PageLayout';
import { Slider } from '@mui/material';

export default function CreateMontagePage() {
  const router = useRouter();
  
  // For video selection
  const [selectedVideoFolder, setSelectedVideoFolder] = useState<string>('');
  const [showVideoFolderBrowser, setShowVideoFolderBrowser] = useState<boolean>(false);
  
  // For music selection
  const [isMusicIncluded, setIsMusicIncluded] = useState<boolean>(false);
  const [selectedMusicFolder, setSelectedMusicFolder] = useState<string>('');
  const [showMusicFolderBrowser, setShowMusicFolderBrowser] = useState<boolean>(false);
  
  // For montage settings
  const [videoLength, setVideoLength] = useState<number>(15);
  const [numClips, setNumClips] = useState<number>(5);
  
  // For UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate clip duration for visualization
  const clipDuration = videoLength / numClips;

  // Handle video folder selection
  const handleVideoFolderSelect = (folder: string) => {
    setSelectedVideoFolder(folder);
    setShowVideoFolderBrowser(false);
    setErrorMessage(null);
  };

  // Handle music folder selection
  const handleMusicFolderSelect = (folder: string) => {
    setSelectedMusicFolder(folder);
    setShowMusicFolderBrowser(false);
    setErrorMessage(null);
  };

  // Toggle music inclusion
  const handleToggleMusicIncluded = () => {
    setIsMusicIncluded(!isMusicIncluded);
    if (!isMusicIncluded) {
      setSelectedMusicFolder('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedVideoFolder) {
      setErrorMessage('Please select a video folder');
      return;
    }
    
    if (isMusicIncluded && !selectedMusicFolder) {
      setErrorMessage('Please select a music folder or disable music inclusion');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      
      // Create montage request
      const requestData = {
        videoFolder: selectedVideoFolder,
        musicFolder: isMusicIncluded ? selectedMusicFolder : '',
        isMusicIncluded,
        videoLength,
        numClips,
        clipDuration
      };
      
      await createMontageRequest(requestData);
      
      // Show success message and redirect after delay
      setSuccessMessage('Montage request created successfully! Redirecting to montages page...');
      
      // Reset form
      setSelectedVideoFolder('');
      setSelectedMusicFolder('');
      setIsMusicIncluded(false);
      setVideoLength(15);
      setNumClips(5);
      
      // Redirect to montages page after 2 seconds
      setTimeout(() => {
        router.push('/montages');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating montage request:', error);
      setErrorMessage('Failed to create montage request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl text-slate-600 font-bold mb-6">Create a New Montage</h1>
          
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            {/* Video Folder Selection */}
            <div className="mb-6">
              <h2 className="text-xl text-slate-600 font-semibold mb-3">Video Selection</h2>
              <p className="text-gray-600 mb-3">Select a folder containing the videos you want to include in your montage.</p>
              
              {!showVideoFolderBrowser ? (
                <div className="mb-4">
                  {selectedVideoFolder ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{getFolderDisplayName(selectedVideoFolder)}</p>
                          <p className="text-sm text-gray-500">{selectedVideoFolder}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowVideoFolderBrowser(true)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowVideoFolderBrowser(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                      Browse Video Folders
                    </button>
                  )}
                </div>
              ) : (
                <div className="mb-4 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Select a Video Folder</h3>
                    <button
                      type="button"
                      onClick={() => setShowVideoFolderBrowser(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                  <FolderBrowser 
                    isVideo={true}
                    onSelectFolder={handleVideoFolderSelect}
                    selectedFolder={selectedVideoFolder}
                  />
                </div>
              )}
            </div>

            {/* Montage Settings */}
            <div className="mb-6 pt-4 border-t border-gray-200">
              <h2 className="text-xl text-slate-600 font-semibold mb-4">Montage Settings</h2>
              
              {/* Video Length Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-700">Video Length (seconds)</label>
                  <span className="text-gray-500">{videoLength}s</span>
                </div>
                <Slider
                  value={videoLength}
                  onChange={(_, value) => setVideoLength(value as number)}
                  min={5}
                  max={30}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  className="px-2"
                />
              </div>

              {/* Number of Clips Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-700">Number of Clips</label>
                  <span className="text-gray-500">{numClips}</span>
                </div>
                <Slider
                  value={numClips}
                  onChange={(_, value) => setNumClips(value as number)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  className="px-2"
                />
              </div>

              {/* Clip Distribution Visualization */}
              <div className="mt-8">
                <h3 className="text-lg text-slate-600 font-semibold mb-4">Clip Distribution</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Total Duration: {videoLength}s</span>
                    <span className="text-sm text-gray-500">Each Clip: {clipDuration.toFixed(1)}s</span>
                  </div>
                  <div className="flex h-16 gap-1">
                    {Array.from({ length: numClips }).map((_, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-indigo-500 rounded transition-all duration-300 hover:bg-indigo-600 group relative cursor-pointer"
                        style={{ minWidth: '20px' }}
                      >
                        {/* Clip Number (Always Visible) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {index + 1}
                          </span>
                        </div>
                        {/* Duration (Visible on Hover) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 rounded">
                          <span className="text-white text-xs font-medium">
                            {clipDuration.toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Music Selection */}
            <div className="mb-6 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isMusicIncluded"
                  checked={isMusicIncluded}
                  onChange={handleToggleMusicIncluded}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isMusicIncluded" className="ml-2 text-xl text-slate-600 font-semibold">
                  Include Music
                </label>
              </div>
              
              {isMusicIncluded && (
                <>
                  <p className="text-gray-600 mb-3">Select a folder containing music for your montage.</p>
                  
                  {!showMusicFolderBrowser ? (
                    <div className="mb-4">
                      {selectedMusicFolder ? (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded">
                            <div className="flex-1">
                              <p className="font-medium">{getFolderDisplayName(selectedMusicFolder)}</p>
                              <p className="text-sm text-gray-500">{selectedMusicFolder}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowMusicFolderBrowser(true)}
                              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowMusicFolderBrowser(true)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
                        >
                          Browse Music Folders
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Select a Music Folder</h3>
                        <button
                          type="button"
                          onClick={() => setShowMusicFolderBrowser(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                      <FolderBrowser 
                        isVideo={false}
                        onSelectFolder={handleMusicFolderSelect}
                        selectedFolder={selectedMusicFolder}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <ClipLoader size={16} color="#ffffff" className="mr-2" />
                    Creating Montage...
                  </span>
                ) : (
                  'Create Montage'
                )}
              </button>
            </div>
          </form>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
} 