import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Bucket names
const VIDEO_BUCKET = process.env.NEXT_PUBLIC_VIDEO_BUCKET_NAME || 'video-uploads';
const MUSIC_BUCKET = process.env.NEXT_PUBLIC_MUSIC_BUCKET_NAME || 'music-uploads';

// Generate a presigned URL for uploading
export async function getPresignedUploadUrl(
  key: string, 
  contentType: string, 
  isVideo: boolean = true
): Promise<string> {
  const bucketName = isVideo ? VIDEO_BUCKET : MUSIC_BUCKET;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    // URL expires in 5 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// List top-level folders in a bucket
export async function listFolders(isVideo: boolean = true): Promise<string[]> {
  try {
    const bucketName = isVideo ? VIDEO_BUCKET : MUSIC_BUCKET;
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: '/',
    });
    
    const response = await s3Client.send(command);
    
    // Extract common prefixes (folders)
    const folders: string[] = [];
    
    // Process CommonPrefixes (folders)
    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      response.CommonPrefixes.forEach(prefix => {
        if (prefix.Prefix) {
          // Remove trailing slash and add to folders
          const folderName = prefix.Prefix.replace(/\/$/, '');
          folders.push(folderName);
        }
      });
    }
    
    return folders;
  } catch (error) {
    console.error('Error listing folders:', error);
    throw error;
  }
}

// List subfolders within a parent folder
export async function listSubfolders(
  parentPath: string,
  isVideo: boolean = true
): Promise<string[]> {
  try {
    const bucketName = isVideo ? VIDEO_BUCKET : MUSIC_BUCKET;
    
    // Make sure the parent path has a trailing slash for S3 prefix
    const prefix = parentPath.endsWith('/') ? parentPath : `${parentPath}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/'
    });
    
    const response = await s3Client.send(command);
    
    // Extract common prefixes (subfolders)
    const subfolders: string[] = [];
    
    // Process CommonPrefixes (folders)
    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      response.CommonPrefixes.forEach(commonPrefix => {
        if (commonPrefix.Prefix && commonPrefix.Prefix !== prefix) {
          // Remove trailing slash and add to folders
          const fullPath = commonPrefix.Prefix.replace(/\/$/, '');
          subfolders.push(fullPath);
        }
      });
    }
    
    return subfolders;
  } catch (error) {
    console.error('Error listing subfolders:', error);
    throw error;
  }
}

// Get full folder hierarchy
export async function getFolderHierarchy(
  isVideo: boolean = true
): Promise<FolderNode[]> {
  try {
    // Get top-level folders first
    const topLevelFolders = await listFolders(isVideo);
    
    // Convert to folder nodes
    const hierarchy: FolderNode[] = topLevelFolders.map(path => {
      const name = path.split('/').pop() || path;
      return {
        name,
        path,
        parentPath: '',
        isExpanded: false,
        children: []
      };
    });
    
    return hierarchy;
  } catch (error) {
    console.error('Error getting folder hierarchy:', error);
    throw error;
  }
}

// Get subfolders for a specific folder
export async function expandFolder(
  folderPath: string,
  isVideo: boolean = true
): Promise<FolderNode[]> {
  try {
    const subfolders = await listSubfolders(folderPath, isVideo);
    
    // Convert to folder nodes
    return subfolders.map(path => {
      const name = path.split('/').pop() || path;
      return {
        name,
        path,
        parentPath: folderPath,
        isExpanded: false,
        children: []
      };
    });
  } catch (error) {
    console.error('Error expanding folder:', error);
    throw error;
  }
}

// Get file tree with nested folders and files
export async function getFileTree(isVideo: boolean = true, prefix: string = ''): Promise<FileTreeNode[]> {
  try {
    const bucketName = isVideo ? VIDEO_BUCKET : MUSIC_BUCKET;
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix ? `${prefix}/` : '',
      Delimiter: '/'
    });
    
    const response = await s3Client.send(command);
    const tree: FileTreeNode[] = [];
    
    // Process CommonPrefixes (folders)
    if (response.CommonPrefixes && response.CommonPrefixes.length > 0) {
      for (const commonPrefix of response.CommonPrefixes) {
        if (commonPrefix.Prefix) {
          const folderName = commonPrefix.Prefix.replace(/\/$/, '').split('/').pop() || '';
          const folderPath = commonPrefix.Prefix.replace(/\/$/, '');
          
          tree.push({
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: [] // Will be populated when folder is expanded
          });
        }
      }
    }
    
    // Process Contents (files)
    if (response.Contents && response.Contents.length > 0) {
      for (const content of response.Contents) {
        if (content.Key && !content.Key.endsWith('/')) {
          // Skip the "folder placeholder" objects
          if (content.Key !== prefix && content.Key !== `${prefix}/`) {
            const fileName = content.Key.split('/').pop() || '';
            
            tree.push({
              name: fileName,
              path: content.Key,
              type: 'file',
              size: content.Size || 0,
              lastModified: content.LastModified || new Date()
            });
          }
        }
      }
    }
    
    return tree;
  } catch (error) {
    console.error('Error getting file tree:', error);
    throw error;
  }
}

// File tree node type
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  children?: FileTreeNode[];
}

// Folder node type for folder hierarchy
export interface FolderNode {
  name: string;
  path: string;
  parentPath: string;
  isExpanded: boolean;
  children: FolderNode[];
} 