import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '@navigation';
import { theme } from '@constants';
import { Strings } from '@constants/strings';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import { useAuthStore } from '@stores/authStore';
import { getApiErrorInfo, useLogout } from '@services/authService';
import { Button, ClubCard } from '@components/common';
import { useInfiniteMyClubs } from '@services/mainServices';
import ToastManager from '@components/common/ToastManager';
import SVG from '@assets/icons';



export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const PAGE_SIZE = 10;
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const [listError, setListError] = useState<string | null>(null);


  const keyExtractor = (item: any, index: number) => {
    const id = item?.id?.toString() || '';
    const name = item?.name || item?.clubName || '';
    const clubCode = item?.clubCode || item?.uniqueCode || '';
    const timestamp = item?.createdAt || item?.timestamp || '';
    const userId = item?.userId || '';
    const keyParts = [id, name, clubCode, timestamp, userId].filter(part => part && part.toString().trim() !== '');
    if (keyParts.length > 0) {
      return `club-${keyParts.join('-')}-${index}`;
    }
    return `club-unknown-${index}`;
  };



  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMyClubs,
    isError: isErrorMyClubs,
    error: myClubsError,
    refetch
  } = useInfiniteMyClubs("", PAGE_SIZE);
  const logoutMutation = useLogout();

  const allMyClubs = data?.pages?.flatMap(page =>
    (page?.data?.data || []).map((club: any) => ({
      ...club,
    }))
  ) || [];


  useEffect(() => {
    if (isErrorMyClubs && myClubsError) {
      const errorInfo = getApiErrorInfo(myClubsError);
      setListError(errorInfo?.message || 'Unable to load clubs right now.');
      ToastManager.error(errorInfo?.message);
    } else {
      setListError(null);
    }
  }, [isErrorMyClubs, myClubsError]);

  useFocusEffect(useCallback(() => {
    refetch();
  }, [refetch]));



  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      queryClient.removeQueries({
        queryKey: ['infiniteMyClubs', "", PAGE_SIZE]
      });
      await refetch();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, queryClient, PAGE_SIZE]);



  // Load more data
  const onEndReached = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, allMyClubs.length]);


  const handleRetryLoad = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['infiniteMyClubs', "", PAGE_SIZE]
    });
    refetch();
  }, [queryClient, refetch, PAGE_SIZE]);

  // Render loading footer
  const renderMyClubsFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.footerText}>Loading more clubs...</Text>
      </View>
    );
  };

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
          <Button title="Retry" onPress={handleRetryLoad} variant="primary" size="small" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyListText}>No clubs found</Text>
        <Text style={styles.emptySubText}>Try refreshing or check back later</Text>
      </View>
    );
  };


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API
              const response = await logoutMutation.mutateAsync(undefined);

              // API call successful - logout locally
              logout();

              // Show success message if available
              if (response?.data?.message) {
                ToastManager.success('Logout', response.data.message);
              }
            } catch (error) {
              // Handle error scenarios
              const errorInfo = getApiErrorInfo(error);

              // If it's a network error or server error, still logout locally
              // This ensures user can logout even if API is down
              if (errorInfo.isNetworkError || errorInfo.isServerError || errorInfo.statusCode === 0) {
                logout();
                ToastManager.error('Logout', 'Logged out locally. There was an issue connecting to the server.');
              }
              // If it's a 401 Unauthorized, token might be invalid - logout locally anyway
              else if (errorInfo.isUnauthorized) {
                logout();
                ToastManager.error('Logout', 'Session expired. You have been logged out.');
              }
              // For other errors (4xx client errors), show error but still allow logout
              else if (errorInfo.isClientError) {
                // Still logout locally but show error
                logout();
                ToastManager.error('Logout', errorInfo.message || 'Logged out with some issues.');
              }
              // For any other unexpected error, logout locally as fallback
              else {
                logout();
                ToastManager.error('Logout', errorInfo.message || 'Failed to logout from server. Logged out locally.');
              }
            }
          },
        },
      ]
    );
  };


  const renderClubItem = ({ item }: any) => {
    return (
      <ClubCard
        club={item}
        onPress={async () => {
        }}
      />
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.blue}
        translucent={Platform.OS === 'android' ? true : false}
      />
      {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={{ flexDirection: 'row', }}>
          <View style={{ width: '50%', justifyContent: 'center' }}>
            <Text style={styles.helloTitle}>Hello,</Text>
            <Text style={styles.headerTitle}>{user?.Name}</Text>
          </View>
          <View style={{ flex: 1, width: '50%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => { Alert.alert('Alert', "Coming Soon") }}>
              <SVG.NotificationIcon style={{ marginRight: moderateScale(10) }} width={moderateScale(40)} height={moderateScale(40)} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileImageContainer} onPress={handleLogout}>
              {isLoading && (
                <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.appleGreen} />
              )}
              {!!user?.profileImage ? (
                <Image
                  onLoadStart={() => setIsLoading(true)}
                  onLoad={() => setIsLoading(false)}
                  onLoadEnd={() => setIsLoading(false)}
                  source={{ uri: user?.profileImage }}
                  style={{ width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(20) }}
                />
              ) : (
                <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
              )}


            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>

      <View style={styles.addMemberContainer}>
        <TouchableOpacity style={styles.addMemberButton} onPress={() => { navigation.navigate('JoinClub') }}>
          <SVG.icAdd width={moderateScale(20)} height={moderateScale(20)} />
          <Text style={styles.addMemberButtonText}>{Strings.AUTH.JOIN_CLUB}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{Strings.AUTH.MY_CLUBS_SECTION_TITLE}</Text>
        <FlatList
          data={allMyClubs}
          renderItem={renderClubItem}
          keyExtractor={keyExtractor}
          style={styles.clubsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          removeClippedSubviews={false}
          initialNumToRender={10}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.9}
          ListFooterComponent={renderMyClubsFooter}
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.blue,
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 44 : 0, // Status bar height for iOS
    backgroundColor: theme.colors.blue,
    zIndex: 1000,
  },
  header: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
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
  skipButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  skipButtonText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.white,
  },
  addMemberContainer: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  sectionTitle: {
    fontFamily: Fonts.outfitMedium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.blue,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  clubsList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  bottomContainer: {
    height: moderateScale(120),
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
  },
  nextButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  emptyListText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  emptySubText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
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
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    height: '45%',
    maxHeight: '45%',
  },
  dragHandle: {
    width: moderateScale(40),
    height: moderateScale(4),
    backgroundColor: theme.colors.border,
    borderRadius: moderateScale(2),
    alignSelf: 'center',
    marginBottom: theme.spacing.sm,
  },
  membersList: {
    flex: 1,
  },
  memberListItem: {
    height: moderateScale(70),
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
  },
  headerContainer: {
    paddingVertical: theme.spacing.xs,
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
    justifyContent: 'center',
  },
  memberNameSubtitle: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(12),
    color: theme.colors.border,
  },
  loadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileImageContainer: {
    backgroundColor: theme.colors.white,
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
