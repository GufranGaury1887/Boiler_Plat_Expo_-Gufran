import Upload, { UploadOptions } from "react-native-background-upload";
import { Platform } from "react-native";
import { UploadDebugUtil } from "./UploadDebugUtil";

// These types help ensure the component using this service provides the correct functions.
type ProgressCallback = (progress: number) => void;
type CompletionCallback = (uploadedUrl: string) => void;
type ErrorCallback = (error: Error) => void;
type CancelCallback = () => void;

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class AzureUploadService {
  /**
   * Convert file URI to format compatible with Android upload service
   * Android only supports absolute paths (/) and content:// URIs
   */
  private static normalizeFileUriForAndroid(fileUri: string): string {
    if (Platform.OS !== "android") {
      return fileUri;
    }

    console.log(`Normalizing file URI for Android: ${fileUri}`);

    if (fileUri.startsWith("file://")) {
      // Remove file:// prefix to get absolute path
      const absolutePath = fileUri.replace("file://", "");
      console.log(`Converted file:// to absolute path: ${absolutePath}`);
      return absolutePath;
    } else if (fileUri.startsWith("content://")) {
      // Keep content:// URIs as is
      console.log(`Using content URI: ${fileUri}`);
      return fileUri;
    } else if (fileUri.startsWith("/")) {
      // Already an absolute path, keep as is
      console.log(`Using absolute path: ${fileUri}`);
      return fileUri;
    } else {
      // If it's a relative path, make it absolute (fallback)
      const absolutePath = `/${fileUri}`;
      console.log(`Converted to absolute path: ${absolutePath}`);
      return absolutePath;
    }
  }

  /**
   * Alternative file existence check using React Native's built-in methods
   */
  private static async checkFileExistsAlternative(fileUri: string): Promise<boolean> {
    try {
      // For Android, try to access the file directly using the legacy API
      if (Platform.OS === "android") {
        const normalizedPath = this.normalizeFileUriForAndroid(fileUri);
        
        // Try using the legacy expo-file-system API as fallback
        const { getInfoAsync } = require('expo-file-system/legacy');
        const fileInfo = await getInfoAsync(normalizedPath);
        console.log(`Alternative file check - Path: ${normalizedPath}, Exists: ${fileInfo.exists}`);
        return fileInfo.exists;
      }
      
      // For iOS, use the original method
      return await UploadDebugUtil.checkFileExists(fileUri);
    } catch (error) {
      console.error(`Alternative file check failed for ${fileUri}:`, error);
      return false;
    }
  }

  /**
   * Upload file with retry mechanism and comprehensive error handling
   */
  public static async uploadFileWithRetry({
    fileUri,
    sasUrl,
    blobUrl,
    options = {},
    onProgress,
    onComplete,
    onError,
    onCancelled,
  }: {
    fileUri: string;
    sasUrl: string;
    blobUrl: string;
    options?: UploadOptions;
    onProgress?: ProgressCallback;
    onComplete?: CompletionCallback;
    onError?: ErrorCallback;
    onCancelled?: CancelCallback;
  }): Promise<UploadResult> {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries}`);
        
        const result = await this.uploadFile({
          fileUri,
          sasUrl,
          blobUrl,
          onProgress,
          onComplete,
          onError,
          onCancelled,
        });

        return {
          success: true,
          url: result,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`Upload attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Upload failed after all retry attempts',
    };
  }

  /**
   * Validate file before upload
   */
  private static validateFile(fileUri: string): { isValid: boolean; error?: string } {
    if (!fileUri) {
      return { isValid: false, error: 'File URI is required' };
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasValidExtension = allowedExtensions.some(ext => 
      fileUri.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      return { 
        isValid: false, 
        error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` 
      };
    }

    return { isValid: true };
  }

  public static async uploadFile({
    fileUri,
    sasUrl,
    blobUrl,
    onProgress,
    onComplete,
    onError,
    onCancelled,
  }: {
    fileUri: string;
    sasUrl: string;
    blobUrl: string;
    onProgress?: ProgressCallback;
    onComplete?: CompletionCallback;
    onError?: ErrorCallback;
    onCancelled?: CancelCallback;
  }): Promise<string> {
    try {
      console.log(`Starting upload for file: ${fileUri}`);
      console.log(`Platform: ${Platform.OS}`);
      console.log(`SAS URL: ${sasUrl}`);

      // Validate file before upload
      const validation = this.validateFile(fileUri);
      if (!validation.isValid) {
        const error = new Error(validation.error || 'File validation failed');
        if (onError) {
          onError(error);
        }
        throw error;
      }

      // Debug upload service on Android
      if (Platform.OS === "android") {
        UploadDebugUtil.debugUploadService();
        UploadDebugUtil.logUploadServiceStatus();
      }

      // Normalize file URI for Android
      const normalizedFileUri = this.normalizeFileUriForAndroid(fileUri);

      // Check if file exists (helpful for debugging)
      let fileExists = false;
      try {
        fileExists = await UploadDebugUtil.checkFileExists(fileUri);
      } catch (error) {
        console.warn(`Primary file check failed, trying alternative method: ${error}`);
        try {
          fileExists = await this.checkFileExistsAlternative(fileUri);
        } catch (altError) {
          console.warn(`Alternative file check also failed: ${altError}`);
          // For Android, sometimes the file exists but can't be checked due to permissions
          // Continue with upload anyway - let the upload service handle it
          if (Platform.OS === "android") {
            console.log("Skipping file existence check for Android - proceeding with upload");
            fileExists = true;
          } else {
            fileExists = false;
          }
        }
      }

      if (!fileExists) {
        const errorMessage = `File does not exist at path: ${fileUri}`;
        console.error(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
        throw new Error(errorMessage);
      }

      // Validate the normalized URI
      if (
        Platform.OS === "android" &&
        !UploadDebugUtil.validateFileUri(normalizedFileUri)
      ) {
        const errorMessage = `Invalid file URI for Android: ${normalizedFileUri}. Android upload service only supports absolute paths (/) and content:// URIs.`;
        console.error(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
        return;
      }

      // Configure the upload options for the background uploader
      const uploadOptions: UploadOptions = {
        url: sasUrl,
        path: normalizedFileUri,
        method: "PUT",
        type: "raw",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "application/octet-stream",
        },
        notification: {
          enabled: true, // Android requires this to be true
          autoClear: true, // Automatically clear the notification after completion
        },
      };

      // Add Android-specific configurations
      if (Platform.OS === "android") {
        uploadOptions.customUploadId = `upload_${Date.now()}`;
      }

      console.log(`Upload options:`, JSON.stringify(uploadOptions, null, 2));

      let uploadId: string;
      try {
        uploadId = await Upload.startUpload(uploadOptions);
        console.log(`Upload started successfully with ID: ${uploadId}`);
      } catch (startUploadError) {
        const errorMessage = `Failed to start upload: ${startUploadError}`;
        console.error(errorMessage);
        if (onError) {
          onError(new Error(errorMessage));
        }
        return;
      }

      // Set up timeout for Android
      let uploadTimeout: NodeJS.Timeout | null = null;
      if (Platform.OS === "android") {
        uploadTimeout = setTimeout(() => {
          console.log(`Upload timeout for ID: ${uploadId}`);
          Upload.cancelUpload(uploadId);
          if (onError) {
            onError(
              new Error(
                "Upload timeout - Please check your internet connection"
              )
            );
          }
        }, 1800000); // 30 minutes timeout for slow networks
      }

      const clearUploadTimeout = () => {
        if (uploadTimeout) {
          clearTimeout(uploadTimeout);
          uploadTimeout = null;
        }
      };

      // Return a Promise that resolves when upload completes
      return new Promise<string>((resolve, reject) => {
        // Add listeners to track the upload lifecycle
        Upload.addListener("progress", uploadId, (data: any) => {
          if (onProgress) {
            onProgress(Math.floor(data.progress));
          }
        });

        Upload.addListener("completed", uploadId, (data: any) => {
          clearUploadTimeout();

          // Azure returns 201 on successful PUT. The final URL was already given to us.
          if (data.responseCode === 201) {
            console.log(`Upload completed successfully for ID: ${uploadId}`);
            if (onComplete) {
              onComplete(blobUrl);
            }
            resolve(blobUrl);
          } else {
            const errorMessage = `Upload failed with response code: ${data.responseCode}`;
            console.error(errorMessage);
            const error = new Error(
              `Server responded with status code: ${data.responseCode}\nBody: ${data.responseBody}`
            );
            if (onError) {
              onError(error);
            }
            reject(error);
          }
        });

        Upload.addListener("cancelled", uploadId, () => {
          clearUploadTimeout();
          console.log(`Upload cancelled for ID: ${uploadId}`);
          const error = new Error("Upload was cancelled");
          if (onCancelled) {
            onCancelled();
          }
          reject(error);
        });

        Upload.addListener("error", uploadId, (data: any) => {
          clearUploadTimeout();
          console.error(`Upload error for ID: ${uploadId}`, data.error);
          const error = new Error(data.error || "Unknown upload error");
          if (onError) {
            onError(error);
          }
          reject(error);
        });
      });
    } catch (error) {
      console.error("An error occurred during the file upload process:", error);
      if (onError) {
        onError(error as Error);
      }
      throw error; // Re-throw to reject the Promise
    }
  }
}




