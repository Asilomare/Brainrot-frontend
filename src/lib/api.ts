import { MontageRequest } from './types';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.brainrot.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Creates a new montage request and submits it to the API
 */
export const createMontageRequest = async (requestData: {
  prompt?: string;
  videoFolder?: string;
  musicFolder: string;
  isMusicIncluded: boolean;
}): Promise<MontageRequest> => {
  if (!API_URL) {
    throw new Error("Missing API_URL environment variable");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/montage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create montage request: ${response.status}`);
    }

    const data = await response.json();
    return data.request;
  } catch (error) {
    console.error('Error creating montage request:', error);
    throw error;
  }
};

/**
 * Fetches all montage requests from the API
 */
export const fetchMontageRequests = async (): Promise<MontageRequest[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/montage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // console.log(response);
    // console.log(await response.json());

    if (!response.ok) {
      throw new Error(`Failed to fetch montage requests: ${response.status}`);
    }

    const data = await response.json();
    return data.requests || [];
  } catch (error) {
    console.error('Error fetching montage requests:', error);
    throw error;
  }
};

/**
 * Get a specific montage request by ID
 * @param id - The montage request ID
 * @returns Promise with the montage request data
 */
export async function getMontageRequest(id: string): Promise<MontageRequest> {
  try {
    const response = await fetch(`${API_BASE_URL}/montage/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error fetching montage request: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    return {
      id: data.uuid,
      videoFolder: data.videoFolder,
      musicFolder: data.musicFolder || '',
      status: data.status,
      // @ts-expect-error dev
      createdAt: new Date(data.createdAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      outputUrl: data.outputUrl,
      isMusicIncluded: data.isMusicIncluded,
    };
  } catch (error) {
    console.error(`Failed to fetch montage request ${id}:`, error);
    throw error;
  }
} 