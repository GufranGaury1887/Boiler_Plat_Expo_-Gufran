import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import {
  pickImage,
  ImagePickerResult,
  ImagePickerOptions,
  validateImageFile
} from '../../utils/imagePicker';
import SVG from '../../assets/icons';
import { moderateScale } from '../../utils/scaling';
import { IconAlt } from './IconAlt';
import { theme } from '../../constants';
import { SvgProps } from 'react-native-svg';


interface ImagePickerComponentProps {
  onImageSelected?: (result: ImagePickerResult) => void;
  loading?: boolean;
  onError?: (error: string) => void;
  imageUri?: string;
  options?: ImagePickerOptions;
  disabled?: boolean;
  style?: any;
  defaultIcon?: React.FC<SvgProps> | string;
  progress?: number;
}

export const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
  onImageSelected,
  loading,
  onError,
  imageUri,
  options = {},
  disabled = false,
  style,
  defaultIcon,
  progress = 0,
}) => {
  const [isLoading, setIsLoading] = useState(loading);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const animatedProgress = useRef(new Animated.Value(progress || 0)).current;

  const size = moderateScale(150);
  const strokeWidth = moderateScale(6);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.max(0, Math.min(100, progress || 0)),
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [progress, animatedProgress]);

  useEffect(() => {
    if (loading) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      overlayOpacity.setValue(0);
    }
  }, [loading, overlayOpacity]);

  const handleImagePress = async () => {
    if (disabled || loading) return;

    try {
      setIsLoading(true);
      const result = await pickImage(options);

      if (result) {
        // Validate the image
        const validation = validateImageFile(result);

        if (!validation.isValid) {
          onError?.(validation.error || 'Invalid image');
          return;
        }

        onImageSelected?.(result);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      onError?.('Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleImagePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {imageUri ? (
        <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
          <Image resizeMode='cover' source={{ uri: imageUri }} style={styles.image} />
          {loading && (
            <View pointerEvents="none" style={styles.progressRingContainer}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme.colors.white}
                  strokeWidth={strokeWidth}
                  opacity={0.4}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme.colors.blue}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={animatedProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: [circumference, 0],
                  })}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
            </View>
          )}
          {loading && (
            <Animated.View style={[styles.loadingOverlay, { opacity: overlayOpacity }]}>
              <ActivityIndicator size="large" color={theme.colors.white} />
              <Text style={styles.loadingText}>Uploading {Math.floor(progress || 0)}%</Text>
            </Animated.View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholderContainer}>
          {defaultIcon && typeof defaultIcon === 'function' ? (
            React.createElement(defaultIcon, {
              width: moderateScale(150),
              height: moderateScale(150),
              color: theme.colors.textSecondary,
            })
          ) : (
            <IconAlt
              name={defaultIcon as any}
              color={theme.colors.textSecondary}
              size={moderateScale(150)}
            />
          )}
          {loading && (
            <View pointerEvents="none" style={styles.progressRingContainer}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme.colors.white}
                  strokeWidth={strokeWidth}
                  opacity={0.4}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme.colors.white}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={animatedProgress.interpolate({
                    inputRange: [0, 100],
                    outputRange: [circumference, 0],
                  })}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
            </View>
          )}
          {loading && (
            <Animated.View style={[styles.loadingOverlay, { opacity: overlayOpacity }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Uploading {Math.floor(progress || 0)}%</Text>
            </Animated.View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (result: ImagePickerResult) => void;
  onError?: (error: string) => void;
  options?: ImagePickerOptions;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  onError,
  options = {},
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCameraPress = async () => {
    try {
      setIsLoading(true);
      const result = await pickImage({ ...options, source: 'camera' });

      if (result) {
        const validation = validateImageFile(result);
        if (!validation.isValid) {
          onError?.(validation.error || 'Invalid image');
          return;
        }
        onImageSelected(result);
        onClose();
      }
    } catch (error) {
      console.error('Camera error:', error);
      onError?.('Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryPress = async () => {
    try {
      setIsLoading(true);
      const result = await pickImage({ ...options, source: 'gallery' });

      if (result) {
        const validation = validateImageFile(result);
        if (!validation.isValid) {
          onError?.(validation.error || 'Invalid image');
          return;
        }
        onImageSelected(result);
        onClose();
      }
    } catch (error) {
      console.error('Gallery error:', error);
      onError?.('Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Image</Text>
          <Text style={styles.modalSubtitle}>Choose how you want to add an image</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, isLoading && styles.disabledButton]}
              onPress={handleCameraPress}
              disabled={isLoading}
            >
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, isLoading && styles.disabledButton]}
              onPress={handleGalleryPress}
              disabled={isLoading}
            >
              <SVG.gallery height={30} width={30} style={styles.optionIcon} />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(75),
  },
  progressRingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1
  },
  loadingText: {
    color: theme.colors.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: moderateScale(8),
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  uploadIcon: {
    tintColor: 'white',
    marginBottom: 8,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderIcon: {
    tintColor: '#6c757d',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  optionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    minWidth: 100,
  },
  disabledButton: {
    opacity: 0.5,
  },
  optionIcon: {
    tintColor: '#007AFF',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
