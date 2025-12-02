import Toast from 'react-native-toast-message';

export interface ToastConfig {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom';
}

class ToastManager {
  /**
   * Show a success toast message
   */
  static success(title: string, message?: string, duration?: number) {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration || 3000,
      position: 'top',
            
    });
  }

  /**
   * Show an error toast message
   */
  static error(title: string, message?: string, duration?: number) {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration || 4000,
      position: 'top',
    });
  }

  /**
   * Show an info toast message
   */
  static info(title: string, message?: string, duration?: number) {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration || 3000,
      position: 'top',
    });
  }

  /**
   * Show a warning toast message
   */
  static warning(title: string, message?: string, duration?: number) {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: duration || 3500,
      position: 'top',
    });
  }

  /**
   * Show a custom toast message
   */
  static show(config: ToastConfig) {
    Toast.show({
      type: config.type,
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 3000,
      position: config.position || 'top',
    });
  }

  /**
   * Hide the current toast
   */
  static hide() {
    Toast.hide();
  }
}

export default ToastManager;
