import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants';

// Icon mapping using Unicode characters/emojis as fallback
const iconMap = {
  home: '🏠',
  user: '👤',
  settings: '⚙️',
  eye: '👁️',
  'eye-off': '🙈',
  mail: '📧',
  lock: '🔒',
  'chevron-right': '▶️',
  'log-out': '🚪',
  bell: '🔔',
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const IconAlt: React.FC<IconProps> = ({
  name,
  size = 24,
  color = theme.colors.text,
}) => {
  const iconCharacter = iconMap[name];

  if (!iconCharacter) {
    console.warn(`Icon "${name}" not found`);
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.6, color }]}>
          ?
        </Text>
      </View>
    );
  }

  return (
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {iconCharacter}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 4,
  },
  fallbackText: {
    fontWeight: 'bold',
  },
});
