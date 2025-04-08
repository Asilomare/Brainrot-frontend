/**
 * Format a folder path to display a user-friendly folder name
 */
export const getFolderDisplayName = (path: string): string => {
  if (!path) return '';
  const folderName = path.split('/').pop() || path;
  return folderName.replace(/_/g, ' ');
}; 