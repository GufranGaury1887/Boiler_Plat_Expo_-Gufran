import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { moderateScale, verticalScale } from '../../utils/scaling';
import { theme } from '../../constants';
import { Fonts } from '../../constants/Fonts';

interface UploadProgressModalProps {
  visible: boolean;
  progress: number;
  isUploading: boolean;
  isRetrying: boolean;
  retryCount: number;
  error: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({
  visible,
  progress,
  isUploading,
  isRetrying,
  retryCount,
  error,
  onRetry,
  onCancel,
  onDismiss,
}) => {
  const getStatusText = () => {
    if (error) {
      return 'Upload Failed';
    }
    if (isRetrying) {
      return `Retrying... (${retryCount})`;
    }
    if (isUploading) {
      return 'Uploading...';
    }
    return 'Upload Complete';
  };

  const getStatusColor = () => {
    if (error) {
      return theme.colors.error;
    }
    if (isRetrying) {
      return theme.colors.warning;
    }
    if (isUploading) {
      return theme.colors.primary;
    }
    return theme.colors.success;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Image Upload</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Status Icon */}
            <View style={styles.statusContainer}>
              {isUploading || isRetrying ? (
                <ActivityIndicator 
                  size="large" 
                  color={getStatusColor()} 
                />
              ) : error ? (
                <Text style={styles.errorIcon}>⚠️</Text>
              ) : (
                <Text style={styles.successIcon}>✓</Text>
              )}
            </View>

            {/* Status Text */}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>

            {/* Progress Bar */}
            {(isUploading || isRetrying) && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {error && onRetry && (
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={onRetry}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              )}
              
              {(isUploading || isRetrying) && onCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              
              {!isUploading && !isRetrying && (
                <TouchableOpacity
                  style={[styles.button, styles.doneButton]}
                  onPress={onDismiss}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: moderateScale(16),
    width: '100%',
    maxWidth: moderateScale(400),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(18),
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    fontSize: moderateScale(24),
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: theme.spacing.lg,
  },
  errorIcon: {
    fontSize: moderateScale(48),
    color: theme.colors.error,
  },
  successIcon: {
    fontSize: moderateScale(48),
    color: theme.colors.success,
  },
  statusText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(16),
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  progressBar: {
    height: moderateScale(8),
    backgroundColor: theme.colors.border,
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(4),
  },
  progressText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: "red",
    padding: theme.spacing.md,
    borderRadius: moderateScale(8),
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  errorText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(14),
    color: theme.colors.error,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
  },
  retryButtonText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(16),
    color: theme.colors.background,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  cancelButtonText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(16),
    color: theme.colors.text,
  },
  doneButton: {
    backgroundColor: theme.colors.success,
  },
  doneButtonText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(16),
    color: theme.colors.background,
  },
});
