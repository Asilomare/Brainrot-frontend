import { useState, useEffect } from 'react';
import { FileType } from '@/lib/types';
import { listFolders } from '@/lib/s3';

interface FolderSelectorProps {
  type: FileType;
  onSelect: (folder: string) => void;
  selectedFolder?: string;
}

export default function FolderSelector({ 
  type, 
  onSelect, 
  selectedFolder 
}: FolderSelectorProps) {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFolders() {
      try {
        setLoading(true);
        const folderList = await listFolders(type === 'video');
        setFolders(folderList);
        setError(null);
      } catch (e) {
        setError(String(e) || 'Failed to load folders');
      } finally {
        setLoading(false);
      }
    }

    fetchFolders();
  }, [type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading folders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 text-gray-500 text-center">
        <p>No {type} folders found</p>
        <p className="text-sm mt-1">Upload {type}s first to create folders</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => onSelect(folder)}
            className={`
              p-4 border rounded-lg transition-all text-center
              ${selectedFolder === folder 
                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-200' 
                : 'bg-white hover:bg-gray-50 border-gray-200'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <svg 
                className={`h-8 w-8 mb-2 ${selectedFolder === folder ? 'text-blue-500' : 'text-gray-400'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                ></path>
              </svg>
              <span className={`font-medium ${selectedFolder === folder ? 'text-blue-700' : 'text-gray-700'}`}>
                {folder.replace(/_/g, ' ')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 