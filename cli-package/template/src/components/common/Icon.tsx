import React from 'react';
import { Text, View } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { theme } from '../../constants';

// Try to import SVG icons with fallback
let HomeIcon: any, UserIcon: any, SettingsIcon: any, EyeIcon: any, EyeOffIcon: any;
let MailIcon: any, LockIcon: any, ChevronRightIcon: any, LogOutIcon: any, BellIcon: any;

try {
  HomeIcon = require('../../assets/icons/home.svg').default;
  UserIcon = require('../../assets/icons/user.svg').default;
  SettingsIcon = require('../../assets/icons/settings.svg').default;
  EyeIcon = require('../../assets/icons/eye.svg').default;
  EyeOffIcon = require('../../assets/icons/eye-off.svg').default;
  MailIcon = require('../../assets/icons/mail.svg').default;
  LockIcon = require('../../assets/icons/lock.svg').default;
  ChevronRightIcon = require('../../assets/icons/chevron-right.svg').default;
  LogOutIcon = require('../../assets/icons/log-out.svg').default;
  BellIcon = require('../../assets/icons/bell.svg').default;
} catch (error) {
  console.warn('SVG icons could not be loaded, using fallback');
}

// Icon mapping
const iconMap = {
  home: HomeIcon,
  user: UserIcon,
  settings: SettingsIcon,
  eye: EyeIcon,
  'eye-off': EyeOffIcon,
  mail: MailIcon,
  lock: LockIcon,
  'chevron-right': ChevronRightIcon,
  'log-out': LogOutIcon,
  bell: BellIcon,
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
}

// Fallback icon component
const FallbackIcon: React.FC<{ name: string; size: number; color: string }> = ({ name, size, color }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size / 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text style={{ color: 'white', fontSize: size * 0.4, fontWeight: 'bold' }}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = theme.colors.text,
  ...props
}) => {
  const IconComponent = iconMap[name];

  // Debug log to see what we're getting
  if (__DEV__) {
    console.log('Icon name:', name);
    console.log('IconComponent:', IconComponent);
    console.log('typeof IconComponent:', typeof IconComponent);
  }

  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon "${name}" not found or invalid, using fallback`);
    return <FallbackIcon name={name} size={size} color={color} />;
  }

  return (
    <IconComponent
      width={size}
      height={size}
      color={color}
      {...props}
    />
  );
};
