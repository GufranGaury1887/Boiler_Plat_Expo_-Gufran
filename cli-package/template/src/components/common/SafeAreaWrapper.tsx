import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../constants';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = theme.colors.background,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
