import { useState, useEffect, useCallback } from 'react';
import { 
  PermissionType, 
  PermissionResult, 
  PermissionRequestResult,
  requestPermission,
  getPermissionStatus,
  requestMultiplePermissions,
  getMultiplePermissionStatuses,
  PermissionGroups,
  requestPermissionGroup,
  isPermissionGroupGranted,
} from './permissions';

/**
 * Hook for managing a single permission
 */
export const usePermission = (permission: PermissionType) => {
  const [status, setStatus] = useState<PermissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getPermissionStatus(permission);
      setStatus(result);
    } catch (error) {
      console.error(`Error checking permission ${permission}:`, error);
      setStatus({
        status: 'denied',
        canAskAgain: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [permission]);

  const request = useCallback(async (): Promise<PermissionRequestResult> => {
    try {
      setIsLoading(true);
      const result = await requestPermission(permission);
      setStatus({
        status: result.status,
        canAskAgain: result.canAskAgain,
        expires: result.expires,
      });
      return result;
    } catch (error) {
      console.error(`Error requesting permission ${permission}:`, error);
      const errorResult: PermissionRequestResult = {
        granted: false,
        status: 'denied',
        canAskAgain: false,
      };
      setStatus({
        status: 'denied',
        canAskAgain: false,
      });
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [permission]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    isLoading,
    isGranted: status?.status === 'granted',
    canAskAgain: status?.canAskAgain ?? false,
    request,
    refresh: checkStatus,
  };
};

/**
 * Hook for managing multiple permissions
 */
export const usePermissions = (permissions: PermissionType[]) => {
  const [statuses, setStatuses] = useState<Record<PermissionType, PermissionResult> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const results = await getMultiplePermissionStatuses(permissions);
      setStatuses(results);
    } catch (error) {
      console.error('Error checking permissions:', error);
      const errorResults: Record<PermissionType, PermissionResult> = {} as any;
      permissions.forEach(permission => {
        errorResults[permission] = {
          status: 'denied',
          canAskAgain: false,
        };
      });
      setStatuses(errorResults);
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  const request = useCallback(async (): Promise<Record<PermissionType, PermissionRequestResult>> => {
    try {
      setIsLoading(true);
      const results = await requestMultiplePermissions(permissions);
      const statusResults: Record<PermissionType, PermissionResult> = {} as any;
      
      permissions.forEach(permission => {
        const result = results[permission];
        statusResults[permission] = {
          status: result.status,
          canAskAgain: result.canAskAgain,
          expires: result.expires,
        };
      });
      
      setStatuses(statusResults);
      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      const errorResults: Record<PermissionType, PermissionRequestResult> = {} as any;
      const errorStatuses: Record<PermissionType, PermissionResult> = {} as any;
      
      permissions.forEach(permission => {
        errorResults[permission] = {
          granted: false,
          status: 'denied',
          canAskAgain: false,
        };
        errorStatuses[permission] = {
          status: 'denied',
          canAskAgain: false,
        };
      });
      
      setStatuses(errorStatuses);
      return errorResults;
    } finally {
      setIsLoading(false);
    }
  }, [permissions]);

  useEffect(() => {
    checkStatuses();
  }, [checkStatuses]);

  const isGranted = useCallback((permission: PermissionType): boolean => {
    return statuses?.[permission]?.status === 'granted' ?? false;
  }, [statuses]);

  const canAskAgain = useCallback((permission: PermissionType): boolean => {
    return statuses?.[permission]?.canAskAgain ?? false;
  }, [statuses]);

  const allGranted = useCallback((): boolean => {
    if (!statuses) return false;
    return permissions.every(permission => statuses[permission]?.status === 'granted');
  }, [statuses, permissions]);

  const anyGranted = useCallback((): boolean => {
    if (!statuses) return false;
    return permissions.some(permission => statuses[permission]?.status === 'granted');
  }, [statuses, permissions]);

  return {
    statuses,
    isLoading,
    isGranted,
    canAskAgain,
    allGranted,
    anyGranted,
    request,
    refresh: checkStatuses,
  };
};

/**
 * Hook for managing permission groups
 */
export const usePermissionGroup = (group: keyof typeof PermissionGroups) => {
  const permissions = PermissionGroups[group];
  const permissionHook = usePermissions(permissions);

  const requestGroup = useCallback(async (): Promise<Record<PermissionType, PermissionRequestResult>> => {
    try {
      permissionHook.isLoading = true;
      const results = await requestPermissionGroup(group);
      const statusResults: Record<PermissionType, PermissionResult> = {} as any;
      
      permissions.forEach(permission => {
        const result = results[permission];
        statusResults[permission] = {
          status: result.status,
          canAskAgain: result.canAskAgain,
          expires: result.expires,
        };
      });
      
      permissionHook.setStatuses?.(statusResults);
      return results;
    } catch (error) {
      console.error(`Error requesting permission group ${group}:`, error);
      const errorResults: Record<PermissionType, PermissionRequestResult> = {} as any;
      const errorStatuses: Record<PermissionType, PermissionResult> = {} as any;
      
      permissions.forEach(permission => {
        errorResults[permission] = {
          granted: false,
          status: 'denied',
          canAskAgain: false,
        };
        errorStatuses[permission] = {
          status: 'denied',
          canAskAgain: false,
        };
      });
      
      permissionHook.setStatuses?.(errorStatuses);
      return errorResults;
    } finally {
      permissionHook.isLoading = false;
    }
  }, [group, permissions, permissionHook]);

  const isGroupGranted = useCallback(async (): Promise<boolean> => {
    return isPermissionGroupGranted(group);
  }, [group]);

  return {
    ...permissionHook,
    requestGroup,
    isGroupGranted,
    groupName: group,
    permissions,
  };
};

/**
 * Hook for camera permissions specifically
 */
export const useCameraPermissions = () => {
  return usePermissionGroup('camera');
};

/**
 * Hook for location permissions specifically
 */
export const useLocationPermissions = () => {
  return usePermissionGroup('location');
};

/**
 * Hook for media permissions (camera, camera roll, audio recording)
 */
export const useMediaPermissions = () => {
  return usePermissionGroup('media');
};

/**
 * Hook for contacts permissions specifically
 */
export const useContactsPermissions = () => {
  return usePermissionGroup('contacts');
};

/**
 * Hook for calendar permissions specifically
 */
export const useCalendarPermissions = () => {
  return usePermissionGroup('calendar');
};
