import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

// Create navigation reference
export const navigationRef = createNavigationContainerRef<RootStackParamList>();
