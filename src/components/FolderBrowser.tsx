'use client';

import React, { useState, useEffect } from 'react';
import { FolderNode, getFolderHierarchy, expandFolder } from '@/lib/s3';

interface FolderBrowserProps {
  isVideo: boolean;
  onSelectFolder: (folderPath: string) => void;
  selectedFolder?: string | null;
}

export default function FolderBrowser({ isVideo, onSelectFolder, selectedFolder }: FolderBrowserProps) {
  const [folderHierarchy, setFolderHierarchy] = useState<FolderNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [pendingFolderExpansions, setPendingFolderExpansions] = useState<string[]>([]);

  // Initial load of folder hierarchy
  useEffect(() => {
    async function loadFolderHierarchy() {
      try {
        setIsLoading(true);
        const hierarchy = await getFolderHierarchy(isVideo);
        setFolderHierarchy(hierarchy);
        setError(null);
      } catch (err) {
        console.error('Error loading folder hierarchy:', err);
        setError('Failed to load folders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadFolderHierarchy();
  }, [isVideo]);

  // Handle folder expansion
  useEffect(() => {
    if (pendingFolderExpansions.length > 0) {
      const folderToExpand = pendingFolderExpansions[0];
      
      async function expandFolderAndUpdateHierarchy() {
        try {
          setIsLoading(true);
          const subfolders = await expandFolder(folderToExpand, isVideo);
          
          // Update the folder hierarchy with the new subfolders
          setFolderHierarchy(prevHierarchy => {
            return updateHierarchyWithSubfolders(prevHierarchy, folderToExpand, subfolders);
          });
          
          // Mark as expanded
          setExpandedFolders(prev => ({
            ...prev,
            [folderToExpand]: true
          }));
          
          setError(null);
        } catch (err) {
          console.error('Error expanding folder:', err);
          setError(`Failed to load subfolders for ${folderToExpand.split('/').pop()}`);
        } finally {
          setIsLoading(false);
          setPendingFolderExpansions(prev => prev.filter(f => f !== folderToExpand));
        }
      }
      
      expandFolderAndUpdateHierarchy();
    }
  }, [pendingFolderExpansions, isVideo]);

  // Helper function to update the hierarchy with subfolders
  const updateHierarchyWithSubfolders = (
    hierarchy: FolderNode[],
    parentPath: string,
    subfolders: FolderNode[]
  ): FolderNode[] => {
    return hierarchy.map(folder => {
      if (folder.path === parentPath) {
        return {
          ...folder,
          children: subfolders,
          isExpanded: true
        };
      } else if (folder.children && folder.children.length > 0) {
        return {
          ...folder,
          children: updateHierarchyWithSubfolders(folder.children, parentPath, subfolders)
        };
      }
      return folder;
    });
  };

  // Toggle folder expansion
  const toggleFolder = (folderPath: string) => {
    const isCurrentlyExpanded = expandedFolders[folderPath];
    
    if (!isCurrentlyExpanded) {
      setPendingFolderExpansions(prev => [...prev, folderPath]);
    } else {
      // Just toggle the UI state for collapse
      setExpandedFolders(prev => ({
        ...prev,
        [folderPath]: false
      }));
      
      // Update the folder hierarchy to reflect the collapsed state
      setFolderHierarchy(prevHierarchy => {
        return updateHierarchyFolderState(prevHierarchy, folderPath, false);
      });
    }
  };

  // Update the expanded state in the hierarchy
  const updateHierarchyFolderState = (
    hierarchy: FolderNode[],
    folderPath: string,
    isExpanded: boolean
  ): FolderNode[] => {
    return hierarchy.map(folder => {
      if (folder.path === folderPath) {
        return {
          ...folder,
          isExpanded
        };
      } else if (folder.children && folder.children.length > 0) {
        return {
          ...folder,
          children: updateHierarchyFolderState(folder.children, folderPath, isExpanded)
        };
      }
      return folder;
    });
  };

  // Render a folder and its children recursively
  const renderFolder = (folder: FolderNode, level = 0) => {
    const isExpanded = expandedFolders[folder.path] || false;
    const isSelected = selectedFolder === folder.path;
    const hasChildren = folder.children && folder.children.length > 0;
    
    return (
      <li key={folder.path} style={{ paddingLeft: `${level * 8}px` }}>
        <div 
          className={`flex items-center py-2 ${isSelected ? 'bg-indigo-50' : ''} rounded px-2`}
        >
          <button
            onClick={() => toggleFolder(folder.path)}
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
          >
            <svg 
              className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          
          <div className={`flex-shrink-0 ${isVideo ? 'text-indigo-600' : 'text-purple-600'}`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
          </div>
          
          <button
            onClick={() => onSelectFolder(folder.path)}
            className={`ml-2 text-left flex-grow ${isSelected ? 'font-semibold text-indigo-700' : 'text-gray-800'} hover:text-indigo-600 focus:outline-none`}
          >
            {folder.name}
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <ul className="ml-6 border-l border-gray-200 pl-2 mt-1">
            {folder.children.map(childFolder => renderFolder(childFolder, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
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
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-700">Loading folders...</span>
          </div>
        </div>
      )}
      
      {folderHierarchy.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
          </svg>
          <p className="mt-2">No folders found. Create a new folder to get started.</p>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto pr-2">
          <ul className="space-y-1">
            {folderHierarchy.map(folder => renderFolder(folder))}
          </ul>
        </div>
      )}
    </div>
  );
} 