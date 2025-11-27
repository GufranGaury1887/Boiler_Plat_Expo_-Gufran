import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { PendingRequestsScreenProps } from "../../types/navigation";
import { Strings, theme } from "../../constants";
import { moderateScale } from "../../utils/scaling";
import { Fonts } from "../../constants/Fonts";
import SVG from "../../assets/icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { TeamCard } from "../../components/common";
import ToastManager from "../../components/common/ToastManager";
import { getApiErrorInfo, useGetImageUrl } from "../../services/authService";
import { useInfinitePendingTeamRequests, PendingTeamRequest, useCancelRequestTeam } from "../../services/mainServices";
import { useFocusEffect } from "@react-navigation/native";

export const PendingRequestsScreen: React.FC<PendingRequestsScreenProps> = ({
  navigation,
  route,
}) => {
  const { selectedClub } = route?.params ?? {};
  console.log("Selected member details in Pending screen--->", route?.params);
   const cancelRequestTeamMutation = useCancelRequestTeam();
  const [clubImage, setClubImage] = useState<string | null>(null);

  // Get member ID from route params or auth store
  const memberId = selectedClub?.selectedMember?.id || 0; // Replace with actual member ID from auth context
  const pageSize = 10;

  // Use infinite query for pending team requests
  const {
    data: pendingRequestsData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePendingTeamRequests(memberId, pageSize);

  // Flatten the paginated data into a single array
  const allPendingRequests = useMemo(() => {
    if (!pendingRequestsData?.pages) return [];

    return pendingRequestsData.pages.flatMap(page => page.data?.data || []);
  }, [pendingRequestsData]);

  // Handle API errors
  useEffect(() => {
    if (isError && error) {
      ToastManager.show({
        title: "Error",
        message: "Failed to load pending requests. Please try again.",
        type: "error",
      });
    }
  }, [isError, error]);

        useFocusEffect(useCallback(() => {
          refetch();
        }, [refetch]));

  // Load more data when reaching end of list
  const loadMoreData = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refresh data
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancelRequest = (item:any) => {

    console.log("Cancel request for team:", item);



    const body = {
      clubId: item?.clubId,
      memberId: item?.memberId,
      teamId: item?.teamId
  }
  cancelRequestTeamMutation.mutate(body, {
      onSuccess: (response) => {
          ToastManager.success(response.data.message || 'Join club successful');
          navigation.goBack();
      },
      onError: (error) => {
          const errorInfo = getApiErrorInfo(error);
          ToastManager.error(errorInfo?.message);

          console.error('Join club failed:', error);
      },
  });
    


    // // TODO: Implement actual cancel request API call
    // // For now, just show success message
    // ToastManager.show({
    //   title: "Success",
    //   message: "Request cancelled successfully",
    //   type: "success",
    // });
  };

  const renderClubCard = ({ item }: { item: PendingTeamRequest }) => {
    // Transform the data to match TeamCard props
    const teamData = {
      id: item.id,
      clubName: item.teamName,
      clubImageUrl: item.teamImageUrl || "",
      totalMembers: 0, // API doesn't provide member count for pending requests
    };

    return (
      <TeamCard
        team={item}
        onCancel={true}
        onCancelPress={() => handleCancelRequest(item)}
      />
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.blue} />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading && !pendingRequestsData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.blue} />
          <Text style={styles.loadingText}>Loading pending requests...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pending requests</Text>
      </View>
    );
  };


  const handleScroll = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    console.log("selectedClub--->", selectedClub),
    
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.blue} barStyle="light-content" />
      {Platform.OS === "android" && <View style={styles.statusBarBackground} />}

      <SafeAreaView style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SVG.arrowLeft_white
              width={moderateScale(25)}
              height={moderateScale(25)}
            />
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.userConSty}>
              {!!selectedClub?.clubImage? (
                <Image
                  // onLoadEnd={() => setIsLoading(false)}
                  // onLoad={() => setIsLoading(true)}
                  // onLoadStart={() => setIsLoading(true)}
                  source={{ uri: selectedClub?.clubImage }}
                  style={styles.userDetailsSty}
                />
              ) : (
                <View style={styles.placeholderLogoHeader}>
                  <SVG.UsersIcon
                    width={moderateScale(20)}
                    height={moderateScale(20)}
                  />
                </View>
              )}
            </View>
            <View style={styles.clubInfoContainer}>
              <Text style={styles.userNameSty}>
                {selectedClub?.clubName || "Unknown Member"}
              </Text>
              <Text style={styles.totalMembersSty}>
                {selectedClub?.totalMembers || 0}{" "}
                {(selectedClub?.totalMembers || 0) === 1 ? "member" : "members"}
              </Text>
            </View>
          </View>
        </View>

          </SafeAreaView>
        <View style={styles.contentList}>
          <Text style={styles.sectionHeading}>Pending Requests</Text>
          <FlatList
            data={allPendingRequests}
            renderItem={renderClubCard}
            keyExtractor={(item) => item.id.toString()}
            style={styles.clubsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            removeClippedSubviews={false}
            initialNumToRender={10}
            onEndReached={loadMoreData}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyComponent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && !pendingRequestsData}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 44 : 0,
    backgroundColor: theme.colors.blue,
    zIndex: 1000,
  },
  header: {
    backgroundColor: theme.colors.blue,
    paddingTop: Platform.OS === "android" ? theme.spacing.lg : theme.spacing.xs,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(22),
    color: theme.colors.white,
  },
  clubInfoContainer: {
    marginLeft: moderateScale(4),
    justifyContent: 'center',
  },
  userNameSty: {
    color: theme.colors.white,
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(16),
  },
  totalMembersSty: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(11),
    color: theme.colors.appleGreen,
  },
  userDetailsSty: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
  },
  userConSty: {
    marginLeft: moderateScale(12),
    marginRight: theme.spacing.xs,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    borderColor: theme.colors.imageBorder,
    backgroundColor: theme.colors.imageBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  teamImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: theme.colors.background,
  },
  placeholderImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  userDefaultIcone: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(10),
  },
  placeholderLogoHeader: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  memberCount: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(11),
    color: theme.colors.appleGreen,
    marginLeft: theme.spacing.xs,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    marginTop: -theme.spacing.xl,
  },
  sectionContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  sectionHeading: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(18),
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  clubCardWrapper: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cancelButton: {
    backgroundColor: "#FF4444",
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cancelButtonText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(12),
    color: theme.colors.white,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
  },
  footerLoader: {
    paddingVertical: theme.spacing.md,
    alignItems: "center",
  },
  footerLoaderText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(12),
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  loadingText: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(14),
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
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
  },
  contentList: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    marginTop: -theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
});
