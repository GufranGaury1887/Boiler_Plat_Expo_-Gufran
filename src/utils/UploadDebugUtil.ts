import { Platform } from "react-native";
import Upload from "react-native-background-upload";
import { File } from "expo-file-system";
import { getInfoAsync } from "expo-file-system/legacy";

export class UploadDebugUtil {
  /**
   * Debug function to check upload service status and configuration
   */
  static debugUploadService() {
    if (Platform.OS === "android") {
      console.log("=== Android Upload Service Debug ===");
      console.log("Platform:", Platform.OS);
      console.log("Platform Version:", Platform.Version);

      // Check if Upload service is available
      try {
        const uploadMethods = Object.keys(Upload);
        console.log("Available Upload methods:", uploadMethods);
      } catch (error) {
        console.error("Upload service not available:", error);
      }
    }
  }

  /**
   * Validate file URI format for Android
   * Android upload service only supports absolute paths (/) and content:// URIs
   */
  static validateFileUri(fileUri: string): boolean {
    if (Platform.OS === "android") {
      const validPatterns = [
        /^\//, // Absolute path starting with /
        /^content:\/\//, // Content URI
      ];

      const isValid = validPatterns.some((pattern) => pattern.test(fileUri));
      console.log(`File URI validation - URI: ${fileUri}, Valid: ${isValid}`);

      if (fileUri.startsWith("file://")) {
        console.warn(
          "Android upload service does not support file:// scheme. Use absolute path instead."
        );
        return false;
      }

      return isValid;
    }
    return true;
  }

  /**
   * Log current upload service status
   */
  static logUploadServiceStatus() {
    try {
      console.log("Upload service methods available:", {
        startUpload: typeof Upload.startUpload,
        cancelUpload: typeof Upload.cancelUpload,
        addListener: typeof Upload.addListener,
      });
    } catch (error) {
      console.error("Error checking upload service status:", error);
    }
  }

  /**
   * Check if file exists at given path (useful for debugging Android file access)
   */
  static async checkFileExists(fileUri: string): Promise<boolean> {
    try {
      let pathToCheck = fileUri;

      // Convert file:// URI to expo-file-system compatible path
      if (fileUri.startsWith("file://")) {
        pathToCheck = fileUri;
      } else if (fileUri.startsWith("/")) {
        pathToCheck = `file://${fileUri}`;
      }

      // Try the new File API first
      // Try the new FileSystem API first (Expo FileSystem)
      try {
        // Dynamically import to avoid issues if not available
        const { getInfoAsync } = await import('expo-file-system');
        const fileInfo = await getInfoAsync(pathToCheck);

        console.log(
          `File check (new API) - Path: ${pathToCheck}, Exists: ${fileInfo.exists}, Size: ${fileInfo.size || "N/A"}`
        );
        return fileInfo.exists;
      } catch (newApiError) {
        console.warn(`New File API failed, trying legacy API: ${newApiError}`);
        
        // Fallback to legacy API
        const fileInfo = await getInfoAsync(pathToCheck);
        console.log(
          `File check (legacy API) - Path: ${pathToCheck}, Exists: ${fileInfo.exists}, Size: ${fileInfo.size || "N/A"}`
        );
        return fileInfo.exists;
      }
    } catch (error) {
      console.error(`Error checking file existence for ${fileUri}:`, error);
      return false;
    }
  }
}
