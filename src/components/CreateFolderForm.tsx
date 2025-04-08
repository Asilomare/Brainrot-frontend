'use client';

import { useState } from 'react';

interface CreateFolderFormProps {
  parentPath?: string | null;
  onCreateFolder: (folderName: string, parentPath?: string | null) => void;
  onCancel: () => void;
}

export default function CreateFolderForm({ 
  parentPath, 
  onCreateFolder, 
  onCancel 
}: CreateFolderFormProps) {
  const [folderName, setFolderName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate folder name
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    // Format folder name (remove spaces, lowercase)
    const formattedFolderName = folderName.trim().replace(/\s+/g, '_').toLowerCase();
    
    // Call the parent handler
    onCreateFolder(formattedFolderName, parentPath);
    
    // Reset the form
    setFolderName('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <div className="flex items-center">
          <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700">
            {parentPath ? 'New Subfolder Name' : 'New Folder Name'}
          </label>
        </div>
        
        <div className="mt-1 flex rounded-md shadow-sm">
          {parentPath && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              {parentPath}/
            </span>
          )}
          <input
            type="text"
            id="folder-name"
            name="folder-name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={parentPath ? "subfolder_name" : "folder_name"}
            className={`${
              parentPath ? 'rounded-r-md' : 'rounded-md'
            } flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-black`}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        <p className="mt-1 text-xs text-gray-500">
          Folder name will be formatted to use underscores instead of spaces.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Folder
        </button>
      </div>
    </form>
  );
} 