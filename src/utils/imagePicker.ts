import * as ImagePicker from 'expo-image-picker';
import { launchCamera as RNLaunchCamera, ImagePickerResponse, MediaType, CameraOptions, PhotoQuality } from 'react-native-image-picker';
import { Alert, Linking, Platform } from 'react-native';
import { requestPermission } from './permissions';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
  exif?: boolean;
}

/**
 * Request camera permission
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const result = await requestPermission('camera');
  return result.granted;
};

/**
 * Request camera roll permission
 */
export const requestCameraRollPermission = async (): Promise<boolean> => {
  const result = await requestPermission('cameraRoll');
  return result.granted;
};

/**
 * Convert quality number to PhotoQuality type
 */
const convertQualityToPhotoQuality = (quality: number): PhotoQuality => {
  // PhotoQuality accepts: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
  const allowedValues: PhotoQuality[] = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  // Clamp quality between 0 and 1
  const clampedQuality = Math.max(0, Math.min(1, quality));
  // Round to nearest allowed value
  const rounded = Math.round(clampedQuality * 10) / 10;
  // Find closest allowed value
  return allowedValues.reduce((prev, curr) => 
    Math.abs(curr - rounded) < Math.abs(prev - rounded) ? curr : prev
  );
};

/**
 * Launch camera to take a photo
 */
export const launchCamera = async (options: ImagePickerOptions = {}): Promise<ImagePickerResult | null> => {
  try {
    // Check camera permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: () => {
            // You can add logic to open app settings here
            Linking.openSettings();
          }},
        ]
      );
      return null;
    }

    // Prepare react-native-image-picker options
    const cameraOptions: CameraOptions = {
      mediaType: 'photo' as MediaType,
      quality: convertQualityToPhotoQuality(options.quality ?? 0.8),
      includeBase64: options.base64 ?? false,
      saveToPhotos: false, // Set to false to avoid requesting photo library permission on iOS

    };

    // Handle aspect ratio if allowsEditing is true
    if (options.allowsEditing ?? true) {
      const [aspectX, aspectY] = options.aspect ?? [1, 1];
      // react-native-image-picker doesn't support aspect ratio directly
      // but we can use maxWidth and maxHeight for basic constraints
      // For square images (1:1), we can set equal max dimensions
      if (aspectX === aspectY) {
        cameraOptions.maxWidth = 1080;
        cameraOptions.maxHeight = 1080;
      }
    }

    // Use Promise wrapper for react-native-image-picker
    const result: ImagePickerResponse = await new Promise((resolve, reject) => {
      RNLaunchCamera(cameraOptions, (response) => {
        resolve(response);
      });
    });

    // Check if user cancelled
    if (result.didCancel) {
      return null;
    }

    // Check for errors
    if (result.errorCode) {
      console.error('Camera error:', result.errorMessage);
      Alert.alert('Error', result.errorMessage || 'Failed to open camera. Please try again.');
      return null;
    }

    // Extract image data
    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri || '',
        width: asset.width || 0,
        height: asset.height || 0,
        type: asset.type || 'image/jpeg',
        fileName: `image_${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Error launching camera:', error);
    Alert.alert('Error', 'Failed to open camera. Please try again.');
    return null;
  }
};

/**
 * Launch image library to select a photo
 */
export const launchImageLibrary = async (options: ImagePickerOptions = {}): Promise<ImagePickerResult | null> => {
  try {
    // Request gallery permission for iOS only
    if (Platform.OS === 'ios') {
      const hasPermission = await requestCameraRollPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to select images. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              Linking.openSettings();
            }},
          ]
        );
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: options.quality ?? 0.8,
      aspect: options.aspect ?? [1, 1],
      base64: options.base64 ?? false,
      exif: options.exif ?? false,
    });

    console.log("result11===>>>>", JSON.stringify(result));

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: `image_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
      };
    }

    return null;
  } catch (error) {
    console.error('Error launching image library:', error);
    Alert.alert('Error', 'Failed to open photo library. Please try again.');
    return null;
  }
};

/**
 * Show action sheet with camera and gallery options
 */
export const showImagePickerOptions = (
  onCameraPress: () => void,
  onGalleryPress: () => void,
  onCancelPress?: () => void
): void => {
  const options = [
    { text: 'Camera', onPress: onCameraPress },
    { text: 'Gallery', onPress: onGalleryPress },
    { text: 'Cancel', onPress: onCancelPress, style: 'cancel' as const },
  ];

  Alert.alert(
    'Select Image',
    'Choose how you want to add an image',
    options,
    { cancelable: true }
  );
};

/**
 * Complete image picker flow with action sheet
 */
export const pickImage = async (options: ImagePickerOptions & { source?: 'camera' | 'gallery' } = {}): Promise<ImagePickerResult | null> => {
  if (options.source === 'camera') {
    console.log("options--->", options);
    return await launchCamera(options);
  } else if (options.source === 'gallery') {
    return await launchImageLibrary(options);
  }

  return new Promise((resolve) => {
    showImagePickerOptions(
      async () => {
        const result = await launchCamera(options);
        resolve(result);
      },
      async () => {
        const result = await launchImageLibrary(options);
        resolve(result);
      },
      () => {
        resolve(null);
      }
    );
  });
};

/**
 * Get image picker permissions status
 */
export const getImagePickerPermissions = async () => {
  const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
  const mediaLibraryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

  return {
    camera: {
      granted: cameraStatus.granted,
      canAskAgain: cameraStatus.canAskAgain,
    },
    mediaLibrary: {
      granted: mediaLibraryStatus.granted,
      canAskAgain: mediaLibraryStatus.canAskAgain,
    },
  };
};

/**
 * Request all image picker permissions
 */
export const requestImagePickerPermissions = async () => {
  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

  return {
    camera: {
      granted: cameraStatus.granted,
      canAskAgain: cameraStatus.canAskAgain,
    },
    mediaLibrary: {
      granted: mediaLibraryStatus.granted,
      canAskAgain: mediaLibraryStatus.canAskAgain,
    },
  };
};

/**
 * Utility to format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Utility to validate image file
 */
export const validateImageFile = (result: ImagePickerResult): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const minSize = 1024; // 1KB
  
  if (result.fileSize && result.fileSize > maxSize) {
    return {
      isValid: false,
      error: `Image size is too large. Maximum allowed size is ${formatFileSize(maxSize)}.`,
    };
  }
  
  if (result.fileSize && result.fileSize < minSize) {
    return {
      isValid: false,
      error: 'Image size is too small. Please select a valid image.',
    };
  }
  
  if (!result.uri) {
    return {
      isValid: false,
      error: 'Invalid image. Please try again.',
    };
  }
  
  return { isValid: true };
};
