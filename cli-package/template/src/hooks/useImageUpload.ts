import { useState, useCallback } from 'react';
import { AzureUploadService, UploadResult } from '../utils/AzureUploaderService';
import { ImagePickerResult } from '../utils/imagePicker';
import { apiClient, API_ENDPOINTS } from '../services/api';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrl: string | null;
  isRetrying: boolean;
  retryCount: number;
}

export interface UseImageUploadOptions {
  containerName?: string;
  maxRetries?: number;
  retryDelay?: number;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onUploadComplete?: () => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    containerName = 'profile',
    maxRetries = 3,
    retryDelay = 1000,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onUploadComplete,
  } = options;

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
    isRetrying: false,
    retryCount: 0,
  });

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedUrl: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  const uploadImage = useCallback(async (imageResult: ImagePickerResult): Promise<UploadResult> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        retryCount: 0,
      }));

      onUploadStart?.();

      // Step 1: Get SAS token
      console.log('Getting SAS token for image upload...',imageResult?.fileName );
      const response = await apiClient.post(API_ENDPOINTS.AUTH.UPLOAD_SAS, {
        containerName,
        blobName: imageResult?.fileName || `image_${Date.now()}.jpg`,
      });

      if (response?.status !== 200) {
        throw new Error(response?.data?.message || 'Failed to get upload token');
      }

      const sasToken = response?.data?.data?.sasUrl;
      const blobUrl = response?.data?.data?.blobUrl;

      if (!sasToken) {
        throw new Error('Invalid response from upload token API');
      }

      // If blobUrl is not provided, derive it from sasUrl
      const finalBlobUrl = blobUrl || sasToken.split('?')[0];

      console.log('SAS token received, starting upload...');

      // Step 2: Upload file with retry mechanism
      const uploadResult = await AzureUploadService.uploadFileWithRetry({
        fileUri: imageResult.uri,
        sasUrl: sasToken,
        blobUrl: finalBlobUrl,
        options: {
          maxRetries,
          retryDelay,
        },
        onProgress: (progress) => {
          setUploadState(prev => ({ ...prev, progress }));
          onUploadProgress?.(progress);
        },
        onComplete: (url) => {
          setUploadState(prev => ({
            ...prev,
            uploadedUrl: url,
            isUploading: false,
            progress: 100,
          }));
          onUploadSuccess?.(url);
        },
        onError: (error) => {
          setUploadState(prev => ({
            ...prev,
            error: error.message,
            isUploading: false,
          }));
          onUploadError?.(error.message);
        },
        onCancelled: () => {
          setUploadState(prev => ({
            ...prev,
            isUploading: false,
            error: 'Upload was cancelled',
          }));
          onUploadError?.('Upload was cancelled');
        },
      });

      onUploadComplete?.();
      return uploadResult;

    } catch (error: any) {
      console.error('Image upload error:', error);
      const errorMessage = error?.message || 'Upload failed';
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));

      onUploadError?.(errorMessage);
      onUploadComplete?.();

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [
    containerName,
    maxRetries,
    retryDelay,
    onUploadStart,
    onUploadProgress,
    onUploadSuccess,
    onUploadError,
    onUploadComplete,
  ]);

  const retryUpload = useCallback(async (imageResult: ImagePickerResult): Promise<UploadResult> => {
    setUploadState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      error: null,
    }));

    const result = await uploadImage(imageResult);
    
    setUploadState(prev => ({
      ...prev,
      isRetrying: false,
    }));

    return result;
  }, [uploadImage]);

  const cancelUpload = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      error: 'Upload cancelled by user',
    }));
    onUploadError?.('Upload cancelled by user');
  }, [onUploadError]);

  return {
    uploadState,
    uploadImage,
    retryUpload,
    cancelUpload,
    resetUploadState,
  };
};
