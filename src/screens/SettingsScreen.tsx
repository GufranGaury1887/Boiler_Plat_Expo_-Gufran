import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import {
  SafeAreaWrapper,
  Button,
  Icon,
  IconButton,
} from "../components/common";
import { IconAlt } from "../components/common/IconAlt";
import { SettingsScreenProps } from "../types";
import { theme } from "../constants";
import { useAuthStore } from "../stores/authStore";

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const logout = useAuthStore((state) => state.logout);
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            logout();
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "This will clear all cached data. Continue?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          console.log("Cache cleared");
          Alert.alert("Success", "Cache cleared successfully!");
        },
      },
    ]);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={
          value ? theme.colors.background : theme.colors.textSecondary
        }
      />
    </View>
  );

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your app experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingItem
            title="Push Notifications"
            subtitle="Receive updates and alerts"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />

          <SettingItem
            title="Dark Mode"
            subtitle="Switch to dark theme"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />

          <SettingItem
            title="Location Services"
            subtitle="Allow location access"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.001</Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Clear Cache"
            onPress={handleClearCache}
            variant="secondary"
            style={styles.button}
          />

          <View style={styles.logoutButtonContainer}>
            <IconAlt name="log-out" size={20} color={theme.colors.error} />
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              style={StyleSheet.flatten([styles.button, styles.logoutButton])}
            />
          </View>

          <Button
            title="Go Back"
            onPress={goBack}
            variant="primary"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  actionSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
  logoutButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    flex: 1,
  },
});
