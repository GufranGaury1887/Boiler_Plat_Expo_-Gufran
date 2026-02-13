import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeScreenProps } from "@navigation";
import { Theme } from "../types";
import { moderateScale } from "@utils/scaling";
import { Fonts } from "@constants/Fonts";
import { useAuthStore } from "@stores/authStore";
import { useTheme, useIsDarkMode } from "../stores/themeStore";
import { getApiErrorInfo, useLogout } from "@services/authService";
import { Button, ClubCard } from "@components/common";
import { useMyClubs } from "@services/mainServices";
import ToastManager from "@components/common/ToastManager";

/* ─── Animated card that springs in every time it mounts (i.e. scrolls into view) ─── */
const AnimatedCardItem = React.memo(
  ({ children, style }: { children: React.ReactNode; style?: any }) => {
    const translateY = useSharedValue(40);
    const scale = useSharedValue(0.95);
    const opacity = useSharedValue(0);

    useEffect(() => {
      opacity.value = withTiming(1, { duration: 350 });
      translateY.value = withSpring(0, { damping: 14, stiffness: 100 });
      scale.value = withSpring(1, { damping: 14, stiffness: 100 });
    }, []);

    const animatedStyle = useAnimatedStyle(
      () =>
        ({
          opacity: opacity.value,
          transform: [
            { translateY: translateY.value },
            { scale: scale.value },
          ],
        }) as any,
    );

    return (
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    );
  },
);

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const [listError, setListError] = useState<string | null>(null);

  const theme = useTheme();
  const isDarkMode = useIsDarkMode();
  const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  const keyExtractor = (item: any, index: number) => {
    const id = item?.id?.toString() || "";
    const name = item?.name || item?.clubName || "";
    const clubCode = item?.clubCode || item?.uniqueCode || "";
    const timestamp = item?.createdAt || item?.timestamp || "";
    const userId = item?.userId || "";
    const keyParts = [id, name, clubCode, timestamp, userId].filter(
      (part) => part && part.toString().trim() !== ""
    );
    if (keyParts.length > 0) {
      return `club-${keyParts.join("-")}-${index}`;
    }
    return `club-unknown-${index}`;
  };

  const {
    data,
    isLoading: isLoadingMyClubs,
    isError: isErrorMyClubs,
    error: myClubsError,
    refetch,
  } = useMyClubs();

  const logoutMutation = useLogout();

  // Get clubs data from response
  const allMyClubs = data?.data?.products || [];

  useEffect(() => {
    if (isErrorMyClubs && myClubsError) {
      const errorInfo = getApiErrorInfo(myClubsError);
      setListError(errorInfo?.message || "Unable to load clubs right now.");
      ToastManager.error(errorInfo?.message);
    } else {
      setListError(null);
    }
  }, [isErrorMyClubs, myClubsError]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetch();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleRetryLoad = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["myClubs"],
    });
    refetch();
  }, [queryClient, refetch]);

  // Render empty state
  const renderEmptyComponent = () => {
    if (isLoadingMyClubs && !isRefreshing) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyListText}>Loading clubs...</Text>
        </View>
      );
    }

    if (listError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{listError}</Text>
          <Button
            title="Retry"
            onPress={handleRetryLoad}
            variant="primary"
            size="small"
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyListText}>No clubs found</Text>
        <Text style={styles.emptySubText}>
          Try refreshing or check back later
        </Text>
      </View>
    );
  };

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
            // Call logout API
            const response = await logoutMutation.mutateAsync(undefined);

            // API call successful - logout locally
            logout();

            // Show success message if available
            if (response?.data?.message) {
              ToastManager.success("Logout", response.data.message);
            }
          } catch (error) {
            // Handle error scenarios
            const errorInfo = getApiErrorInfo(error);

            // If it's a network error or server error, still logout locally
            // This ensures user can logout even if API is down
            if (
              errorInfo.isNetworkError ||
              errorInfo.isServerError ||
              errorInfo.statusCode === 0
            ) {
              logout();
              ToastManager.error(
                "Logout",
                "Logged out locally. There was an issue connecting to the server."
              );
            }
            // If it's a 401 Unauthorized, token might be invalid - logout locally anyway
            else if (errorInfo.isUnauthorized) {
              logout();
              ToastManager.error(
                "Logout",
                "Session expired. You have been logged out."
              );
            }
            // For other errors (4xx client errors), show error but still allow logout
            else if (errorInfo.isClientError) {
              // Still logout locally but show error
              logout();
              ToastManager.error(
                "Logout",
                errorInfo.message || "Logged out with some issues."
              );
            }
            // For any other unexpected error, logout locally as fallback
            else {
              logout();
              ToastManager.error(
                "Logout",
                errorInfo.message ||
                  "Failed to logout from server. Logged out locally."
              );
            }
          }
        },
      },
    ]);
  };

  const renderClubItem = ({ item }: any) => {
    const discountedPrice =
      item?.price - (item?.price * (item?.discountPercentage || 0)) / 100;

    return (
      <AnimatedCardItem style={styles.productCard}>
        {/* Product Image */}
        <Image
          source={{ uri: item?.thumbnail }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Discount Badge */}
        {item?.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              {Math.round(item?.discountPercentage)}% OFF
            </Text>
          </View>
        )}

        {/* Product Details */}
        <View style={styles.productDetails}>
          {/* Brand & Category */}
          <View style={styles.brandCategoryRow}>
            <Text style={styles.brandText}>{item?.brand}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item?.category}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.productTitle} numberOfLines={2}>
            {item?.title}
          </Text>

          {/* Description */}
          <Text style={styles.productDescription} numberOfLines={2}>
            {item?.description}
          </Text>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{item?.rating?.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>
              ({item?.reviews?.length || 0} reviews)
            </Text>
            <View
              style={[
                styles.stockBadge,
                {
                  backgroundColor:
                    item?.availabilityStatus === "In Stock"
                      ? theme.colors.appleGreen
                      : theme.colors.error,
                },
              ]}
            >
              <Text style={styles.stockText}>{item?.availabilityStatus}</Text>
            </View>
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>
              ${discountedPrice.toFixed(2)}
            </Text>
            {item?.discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                ${item?.price?.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Shipping Info */}
          <Text style={styles.shippingText}>{item?.shippingInformation}</Text>
        </View>
      </AnimatedCardItem>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Product</Text>
        <FlatList
          data={allMyClubs}
          renderItem={renderClubItem}
          keyExtractor={keyExtractor}
          style={styles.clubsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    /* ───── Root & Layout ───── */
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    statusBarBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: Platform.OS === "ios" ? 44 : 0,
      backgroundColor: isDark ? theme.colors.surface : theme.colors.blue,
      zIndex: 1000,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      borderTopLeftRadius: moderateScale(30),
      borderTopRightRadius: moderateScale(30),
    },

    /* ───── Header ───── */
    header: {
      backgroundColor: isDark ? theme.colors.surface : theme.colors.blue,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      justifyContent: "space-between",
      alignItems: "center",
    },
    helloTitle: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(18),
      color: theme.colors.white,
    },
    headerTitle: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(24),
      color: theme.colors.white,
    },
    headerContainer: {
      paddingVertical: theme.spacing.xs,
    },
    skipButton: {
      alignSelf: "flex-end",
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    skipButtonText: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.white,
    },

    /* ───── Add-member area ───── */
    addMemberContainer: {
      backgroundColor: isDark ? theme.colors.surface : theme.colors.blue,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    addMemberButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: theme.colors.appleGreen,
      borderRadius: theme.borderRadius.xxl,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    addMemberButtonText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.appleGreen,
    },

    /* ───── Section title ───── */
    sectionTitle: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.blue,
      marginBottom: theme.spacing.md,
      letterSpacing: 0.5,
    },

    /* ───── List / Empty / Footer ───── */
    clubsList: {
      flex: 1,
    },
    flatListContent: {
      paddingBottom: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.xl,
    },
    emptyListText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.xs,
    },
    emptySubText: {
      fontFamily: Fonts.outfitRegular,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    footerLoader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    footerText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    errorText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.error,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },

    /* ───── Bottom / Action area ───── */
    bottomContainer: {
      height: moderateScale(120),
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    nextButton: {
      width: "100%",
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    retryButtonText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.white,
      textAlign: "center",
    },

    /* ───── Modal ───── */
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xl,
      height: "45%",
      maxHeight: "45%",
    },
    dragHandle: {
      width: moderateScale(40),
      height: moderateScale(4),
      backgroundColor: theme.colors.border,
      borderRadius: moderateScale(2),
      alignSelf: "center",
      marginBottom: theme.spacing.sm,
    },

    /* ───── Member list (inside modal) ───── */
    membersList: {
      flex: 1,
    },
    memberListItem: {
      height: moderateScale(70),
      alignItems: "center",
      paddingVertical: theme.spacing.md,
      flexDirection: "row",
    },
    mamberHeaderTitle: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(14),
      color: theme.colors.text,
    },
    profileImage: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      marginRight: moderateScale(10),
    },
    memberName: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(16),
      color: theme.colors.text,
    },
    memberNameContainer: {
      flex: 1,
      justifyContent: "center",
    },
    memberNameSubtitle: {
      fontFamily: Fonts.outfitMedium,
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
    },
    loadingIndicator: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    profileImageContainer: {
      backgroundColor: theme.colors.surface,
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      alignItems: "center",
      justifyContent: "center",
    },

    /* ───── Product Card ───── */
    productCard: {
      backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
      borderRadius: moderateScale(16),
      marginBottom: theme.spacing.md,
      shadowColor: isDark ? "#FFFFFF" : "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.05 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: "hidden",
      borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
      borderColor: theme.colors.border,
    },
    productImage: {
      width: "100%",
      height: moderateScale(180),
      backgroundColor: isDark ? "#2C2C2E" : "#f5f5f5",
    },
    discountBadge: {
      position: "absolute",
      top: moderateScale(12),
      left: moderateScale(12),
      backgroundColor: theme.colors.error,
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(6),
    },
    discountBadgeText: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(11),
      color: theme.colors.white,
    },
    productDetails: {
      padding: moderateScale(14),
    },
    brandCategoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: moderateScale(6),
    },
    brandText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: moderateScale(12),
      color: theme.colors.blue,
      textTransform: "uppercase",
    },
    categoryBadge: {
      backgroundColor: theme.colors.blue + (isDark ? "30" : "15"),
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(3),
      borderRadius: moderateScale(12),
    },
    categoryText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: moderateScale(10),
      color: theme.colors.blue,
      textTransform: "capitalize",
    },
    productTitle: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(16),
      color: theme.colors.text,
      marginBottom: moderateScale(4),
    },
    productDescription: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(18),
      marginBottom: moderateScale(10),
    },

    /* ───── Rating ───── */
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: moderateScale(10),
    },
    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#3A3000" : "#FFF9E6",
      paddingHorizontal: moderateScale(6),
      paddingVertical: moderateScale(2),
      borderRadius: moderateScale(4),
    },
    starIcon: {
      fontSize: moderateScale(12),
      color: "#FFB800",
      marginRight: moderateScale(2),
    },
    ratingText: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(12),
      color: isDark ? "#FFD54F" : "#B38600",
    },
    reviewCount: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(11),
      color: theme.colors.textSecondary,
      marginLeft: moderateScale(6),
    },
    stockBadge: {
      marginLeft: "auto",
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(3),
      borderRadius: moderateScale(10),
    },
    stockText: {
      fontFamily: Fonts.outfitMedium,
      fontSize: moderateScale(10),
      color: theme.colors.white,
    },

    /* ───── Pricing ───── */
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: moderateScale(6),
    },
    currentPrice: {
      fontFamily: Fonts.outfitSemiBold,
      fontSize: moderateScale(20),
      color: theme.colors.text,
    },
    originalPrice: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      textDecorationLine: "line-through",
      marginLeft: moderateScale(8),
    },
    shippingText: {
      fontFamily: Fonts.outfitRegular,
      fontSize: moderateScale(11),
      color: theme.colors.appleGreen,
    },
  });
