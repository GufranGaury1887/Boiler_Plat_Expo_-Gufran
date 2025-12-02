import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
  request,
  check,
  requestMultiple,
  checkMultiple,
} from 'react-native-permissions';

export type PermissionType = 
  | 'camera'
  | 'cameraRoll';

export interface PermissionResult {
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
  canAskAgain: boolean;
  expires?: 'never' | number;
}

export interface PermissionRequestResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
  canAskAgain: boolean;
  expires?: 'never' | number;
}

// Map permission types to react-native-permissions constants
const getPermissionConstant = (permission: PermissionType): Permission => {
  const permissionMap: Record<PermissionType, Permission> = {
    camera: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
    cameraRoll: Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  };
  
  return permissionMap[permission];
};

// Convert react-native-permissions status to our format
const convertPermissionStatus = (status: PermissionStatus): PermissionResult => {
  const statusMap: Record<PermissionStatus, PermissionResult['status']> = {
    [RESULTS.GRANTED]: 'granted',
    [RESULTS.DENIED]: 'denied',
    [RESULTS.BLOCKED]: 'blocked',
    [RESULTS.UNAVAILABLE]: 'denied',
    [RESULTS.LIMITED]: 'granted',
  };

  return {
    status: statusMap[status] || 'denied',
    canAskAgain: status === RESULTS.DENIED,
    expires: 'never',
  };
};

/**
 * Request a single permission
 */
export const requestPermission = async (permission: PermissionType): Promise<PermissionRequestResult> => {
  try {
    const permissionConstant = getPermissionConstant(permission);
    const status = await request(permissionConstant);
    const result = convertPermissionStatus(status);
    
    return {
      granted: result.status === 'granted',
      status: result.status,
      canAskAgain: result.canAskAgain,
      expires: result.expires,
    };
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return {
      granted: false,
      status: 'denied',
      canAskAgain: false,
    };
  }
};

/**
 * Request multiple permissions at once
 */
export const requestMultiplePermissions = async (permissions: PermissionType[]): Promise<Record<PermissionType, PermissionRequestResult>> => {
  try {
    const permissionConstants = permissions.map(getPermissionConstant);
    const results = await requestMultiple(permissionConstants);
    const permissionResults: Record<PermissionType, PermissionRequestResult> = {} as any;
    
    permissions.forEach((permission, index) => {
      const status = results[permissionConstants[index]];
      const result = convertPermissionStatus(status);
      
      permissionResults[permission] = {
        granted: result.status === 'granted',
        status: result.status,
        canAskAgain: result.canAskAgain,
        expires: result.expires,
      };
    });
    
    return permissionResults;
  } catch (error) {
    console.error('Error requesting multiple permissions:', error);
    const failedResults: Record<PermissionType, PermissionRequestResult> = {} as any;
    
    permissions.forEach(permission => {
      failedResults[permission] = {
        granted: false,
        status: 'denied',
        canAskAgain: false,
      };
    });
    
    return failedResults;
  }
};

/**
 * Get the current status of a permission without requesting it
 */
export const getPermissionStatus = async (permission: PermissionType): Promise<PermissionResult> => {
  try {
    const permissionConstant = getPermissionConstant(permission);
    const status = await check(permissionConstant);
    return convertPermissionStatus(status);
  } catch (error) {
    console.error(`Error getting permission status for ${permission}:`, error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
};

/**
 * Get the current status of multiple permissions
 */
export const getMultiplePermissionStatuses = async (permissions: PermissionType[]): Promise<Record<PermissionType, PermissionResult>> => {
  try {
    const permissionConstants = permissions.map(getPermissionConstant);
    const results = await checkMultiple(permissionConstants);
    const permissionResults: Record<PermissionType, PermissionResult> = {} as any;
    
    permissions.forEach((permission, index) => {
      const status = results[permissionConstants[index]];
      permissionResults[permission] = convertPermissionStatus(status);
    });
    
    return permissionResults;
  } catch (error) {
    console.error('Error getting multiple permission statuses:', error);
    const failedResults: Record<PermissionType, PermissionResult> = {} as any;
    
    permissions.forEach(permission => {
      failedResults[permission] = {
        status: 'denied',
        canAskAgain: false,
      };
    });
    
    return failedResults;
  }
};

/**
 * Check if a permission is granted
 */
export const isPermissionGranted = async (permission: PermissionType): Promise<boolean> => {
  const status = await getPermissionStatus(permission);
  return status.status === 'granted';
};

/**
 * Check if multiple permissions are granted
 */
export const arePermissionsGranted = async (permissions: PermissionType[]): Promise<Record<PermissionType, boolean>> => {
  const statuses = await getMultiplePermissionStatuses(permissions);
  const results: Record<PermissionType, boolean> = {} as any;
  
  permissions.forEach(permission => {
    results[permission] = statuses[permission].status === 'granted';
  });
  
  return results;
};

/**
 * Request permission with user-friendly error handling
 */
export const requestPermissionWithFallback = async (
  permission: PermissionType,
  onDenied?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> => {
  try {
    const result = await requestPermission(permission);
    
    if (!result.granted) {
      if (result.canAskAgain) {
        // Permission was denied but can ask again
        console.log(`Permission ${permission} was denied but can ask again`);
      } else {
        // Permission was denied and cannot ask again
        console.log(`Permission ${permission} was denied and cannot ask again`);
        onDenied?.();
      }
    }
    
    return result.granted;
  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    onError?.(error as Error);
    return false;
  }
};

/**
 * Common permission combinations
 */
export const PermissionGroups = {
  camera: ['camera', 'cameraRoll'] as PermissionType[],
  media: ['camera', 'cameraRoll', 'audioRecording'] as PermissionType[],
} as const;

/**
 * Request a group of related permissions
 */
export const requestPermissionGroup = async (group: keyof typeof PermissionGroups): Promise<Record<PermissionType, PermissionRequestResult>> => {
  const permissions = PermissionGroups[group];
  return requestMultiplePermissions(permissions);
};

/**
 * Check if all permissions in a group are granted
 */
export const isPermissionGroupGranted = async (group: keyof typeof PermissionGroups): Promise<boolean> => {
  const permissions = PermissionGroups[group];
  const results = await arePermissionsGranted(permissions);
  return Object.values(results).every(granted => granted);
};

/**
 * Platform-specific permission helpers
 */
export const PlatformPermissions = {
  /**
   * Check if the platform supports the permission
   */
  isSupported: (permission: PermissionType): boolean => {
    if (Platform.OS === 'ios') {
      // iOS supports all permissions
      return true;
    } else if (Platform.OS === 'android') {
      // Android-specific permission checks
      const androidSupportedPermissions: PermissionType[] = [
        'camera',
        'cameraRoll',
      ];
      return androidSupportedPermissions.includes(permission);
    }
    return false;
  },

  /**
   * Get platform-specific permission name
   */
  getPlatformPermissionName: (permission: PermissionType): string => {
    const permissionNames: Record<PermissionType, string> = {
      camera: Platform.OS === 'ios' ? 'Camera' : 'Camera',
      cameraRoll: Platform.OS === 'ios' ? 'Photo Library' : 'Storage'
    };
    
    return permissionNames[permission] || permission;
  },
};
