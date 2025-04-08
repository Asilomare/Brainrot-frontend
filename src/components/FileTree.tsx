import { useState, useEffect } from 'react';
import { FileTreeNode, getFileTree } from '@/lib/s3';
import { FileType } from '@/lib/types';

interface FileTreeProps {
  type: FileType;
  onSelect: (path: string) => void;
  selectedPath?: string;
}

export default function FileTree({ type, onSelect, selectedPath }: FileTreeProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Load the initial file tree
  useEffect(() => {
    loadInitialTree();
  }, [type]);

  const loadInitialTree = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const initialTree = await getFileTree(type === 'video');
      setTree(initialTree);
    } catch (err: any) {
      setError(err.message || 'Failed to load file tree');
    } finally {
      setIsLoading(false);
    }
  };

  // Expand or collapse a folder
  const toggleFolder = async (node: FileTreeNode, expanded: boolean) => {
    try {
      setExpandedFolders(prev => ({ ...prev, [node.path]: expanded }));
      
      if (expanded && (!node.children || node.children.length === 0)) {
        // Load children for this folder
        const children = await getFileTree(type === 'video', node.path);
        
        // Update the tree with the new children
        setTree(prevTree => {
          return updateNodeInTree(prevTree, node.path, { ...node, children });
        });
      }
    } catch (err: any) {
      console.error('Error toggling folder:', err);
    }
  };

  // Helper function to update a node in the tree
  const updateNodeInTree = (tree: FileTreeNode[], path: string, updatedNode: FileTreeNode): FileTreeNode[] => {
    return tree.map(node => {
      if (node.path === path) {
        return updatedNode;
      } else if (node.children && node.children.length > 0) {
        return { ...node, children: updateNodeInTree(node.children, path, updatedNode) };
      }
      return node;
    });
  };

  // Format the file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Render a single node in the tree
  const renderNode = (node: FileTreeNode, level: number = 0) => {
    const isExpanded = expandedFolders[node.path] || false;
    const isSelected = selectedPath === node.path;
    const indentPadding = `${level * 1.5}rem`;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className={`
              flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 transition-colors
              ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
            `}
            style={{ paddingLeft: indentPadding }}
            onClick={() => {
              toggleFolder(node, !isExpanded);
              onSelect(node.path);
            }}
          >
            <span className="mr-2">
              {isExpanded ? (
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              ) : (
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              )}
            </span>
            <svg 
              className={`h-5 w-5 mr-2 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}
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
            <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
              {node.name}
            </span>
          </div>
          
          {isExpanded && node.children && (
            <div className="ml-4">
              {node.children.map(childNode => renderNode(childNode, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      // File node
      return (
        <div 
          key={node.path}
          className={`
            flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 transition-colors
            ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}
          `}
          style={{ paddingLeft: `calc(${indentPadding} + 1.5rem)` }}
          onClick={() => onSelect(node.path)}
        >
          {type === 'video' ? (
            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
            </svg>
          )}
          <span className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{node.name}</span>
          {node.size !== undefined && (
            <span className="ml-2 text-xs text-gray-500">({formatFileSize(node.size)})</span>
          )}
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading file tree...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <p>{error}</p>
        <button 
          onClick={loadInitialTree}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 text-gray-500 text-center">
        <p>No {type} files found</p>
        <p className="text-sm mt-1">Upload {type} files first to browse them</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 border-b">
        <div className="flex items-center">
          <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          <span className="font-medium text-gray-700">
            {type === 'video' ? 'Video Files' : 'Music Files'}
          </span>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {tree.map(node => renderNode(node))}
      </div>
    </div>
  );
} 