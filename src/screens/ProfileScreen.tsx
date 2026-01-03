import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { SafeAreaWrapper, Button } from "../components/common";
import { ProfileScreenProps } from "../types";
import { theme } from "../constants";
import { formatDate } from "../utils";

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  route,
  navigation,
}) => {
  const { userId } = route.params;

  // Mock user data - in a real app, you'd fetch this based on userId
  const userData = {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://via.placeholder.com/100x100/007AFF/FFFFFF?text=JD",
    bio: "React Native developer passionate about creating amazing mobile experiences.",
    joinDate: new Date("2023-01-15"),
    location: "San Francisco, CA",
    followers: 1234,
    following: 567,
  };

  const goBack = () => {
    navigation.goBack();
  };

  const navigateToSettings = () => {
    navigation.navigate("Settings");
  };

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userData.avatar }}
              style={styles.avatar}
              defaultSource={require("../../assets/adaptive-icon.png")}
            />
          </View>

          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>

          {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userData.followers.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userData.following.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{userData.id}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{userData.location}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {formatDate(userData.joinDate)}
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <Button
            title="Settings"
            onPress={navigateToSettings}
            variant="primary"
            style={styles.button}
          />

          <Button
            title="Go Back"
            onPress={goBack}
            variant="outline"
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
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  bio: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  infoSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
});
