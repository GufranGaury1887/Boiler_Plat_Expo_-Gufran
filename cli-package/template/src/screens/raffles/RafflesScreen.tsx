import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  FlatList,
  Share
} from 'react-native';
import { RafflesScreenProps } from '../../types/navigation';
import { Strings, theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, TextInput } from '../../components/common';
import { useInfiniteRaffles, mainService } from '../../services/mainServices';
import Images from '../../assets/images';
import { useFocusEffect } from '@react-navigation/native';

export const RafflesScreen: React.FC<RafflesScreenProps> = ({ navigation, route }) => {
  const { selectedClub, selectedMember: initialSelectedMember } = route?.params ?? {};

  const memberId = initialSelectedMember?.id;
  const clubId = selectedClub?.id;
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteRaffles(memberId, clubId, 10, searchQuery);


  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );


  // Flatten API pages into a single array
  const raffles = useMemo(() => {
    const pages = data?.pages ?? [];
    const flat = pages.flatMap((page: any) => {
      const payload = page?.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
    });
    return flat;
  }, [data]);

  const renderRaffleCard = ({ item }: { item: any }) => {
    const title = item?.title || item?.raffleTitle || 'Raffle';
    const prizePool = item?.totalPricePoolAmount || '$0.00';
    const drawDate = item?.drawDate || '';
    const heroBanner = item?.heroBanner || item?.bannerImage || item?.bannerImageUrl || item?.image || '';
    const referralSales = item?.totalSales || item?.totalSales || 0;
    const raffleId = item?.raffleId || 0;

    const onRaffleCardPress = () => {
      navigation.navigate('RaffleDetails', {
        selectedClub,
        selectedMember: selectedClub?.selectedMember,
        raffleId: raffleId,
      });
    }


    const createNavigationData = () => {
      const navigationData = {
        selectedClub: selectedClub,
        selectedMember: selectedClub?.selectedMember,
        raffleId: raffleId,
        raffleTitle: title,
      };
      console.log('Navigation data being passed:', navigationData);
      return navigationData;
    };

    return (
      <TouchableOpacity style={styles.cardContainer}
        onPress={onRaffleCardPress}>
        {!!heroBanner ? (
          <Image source={{ uri: heroBanner }} style={styles.cardBanner} resizeMode="cover" />
        ) : (

          <View style={{}}>
            <Image source={Images.clubDefauldImage} style={{ width: '100%', height: moderateScale(150) }} />
          </View>
        )
        }
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <View style={styles.prizeContainer}>
            <Text style={styles.prizeLabel}>Prize Pool: <Text style={{ fontFamily: Fonts.outfitSemiBold }}>${prizePool}</Text></Text>
            <Text style={styles.drawDetails}>Draw Date: {drawDate}</Text>
          </View>
          <View style={styles.actionsRow}>
            <Button
              title="Refer to Friends"
              onPress={async () => {
                try {
                  const response = await mainService.getReferralCode({
                    raffleId: raffleId,
                    memberId: memberId || 0,
                  });

                  const responseData = response?.data?.data;
                  const referralCode = responseData?.referralCode || '';
                  const clubCode = responseData?.clubCode || '';
                  const clubName = responseData?.clubName || 'ClubYakka';

                  const appLink = 'dummy url'; // Replace with actual app link
                  const shareMessage =
                    `Join the ${title} raffle on ClubYakka app!

Use my referral code: "${referralCode}" when buying tickets

Steps to buy:
1. Ensure you have ${clubName} club already joined or if not, find it with club code: "${clubCode}" to join it
2. Continue as desired member in Club Dashboard
3. Click Raffle section and find raffle: "${title}"
4. When buying raffle tickets, apply my code: "${referralCode}"
5. Purchase raffle tickets and WIN!
6. Click the link to open the app: ${appLink}`;

                  Share.share(
                    {
                      message: shareMessage,
                      url: appLink,
                      title: `${clubName} Raffle on ClubYakka`
                    },
                    {
                      dialogTitle: `Share ${title} Raffle`,
                      subject: `Join ${title} on ClubYakka`
                    }
                  );
                } catch (error) {
                  console.error('Failed to get referral code:', error);
                }
              }}
              variant="outline"
              textStyle={styles.referButtonText}
              style={{ flex: 0.55, borderColor: theme.colors.blue }}
              size="small"
            />
            <Button
              title="View"
              onPress={onRaffleCardPress}
              variant="outline"
              textStyle={styles.viewButtonText}
              style={{ flex: 0.4, borderColor: theme.colors.blue, backgroundColor: theme.colors.blue }}
              size="small"
            />
          </View>
          <TouchableOpacity style={styles.referralRow}
            onPress={() => { navigation.navigate('MyReferralMembers', createNavigationData()) }}
          >
            <View style={styles.referralIconWrapper}>
              <SVG.ReferralMembers width={moderateScale(25)} height={moderateScale(25)} />
            </View>
            <Text style={styles.referralLabel}>My Referral Members</Text>
            <View style={styles.referralBadge}>
              <Text style={styles.referralBadgeText}>{referralSales}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
      <SafeAreaView style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
          </TouchableOpacity>
          <View style={styles.clubInfoWrapper}>
            <View style={styles.userConSty}>
              {!!selectedClub?.clubImage ? (
                <Image source={{ uri: selectedClub?.clubImage }} style={styles.userDetailsSty} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderLogoHeader}>
                  <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                </View>
              )}
            </View>
            <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Unknown Club'}</Text>
          </View>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>Raffles</Text>
        </View>
        <View style={styles.addMemberContainer} />

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search here"
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
              leftIcon={SVG.search}
              leftIconStyle={{ marginLeft: moderateScale(10), width: moderateScale(18), height: moderateScale(18) }}
              variant="outlined"
              maxLength={30}
            />
          </View>
          <FlatList
            data={raffles}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={renderRaffleCard}
            onEndReachedThreshold={0.5}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No raffles found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try a different name or check back later for more raffles.
                </Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ paddingVertical: theme.spacing.lg }}>
                  <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, fontFamily: Fonts.outfitRegular }}>
                    Loading more...
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
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
    flex: 1,
    backgroundColor: theme.colors.blue,
  },
  userConSty: {
    marginHorizontal: moderateScale(10),
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    borderWidth: 1.5,
    borderColor: theme.colors.imageBorder,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  clubInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginTop: moderateScale(10),
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(22),
    color: theme.colors.white,
  },
  titleWrapper: {
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.md,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  userDetailsSty: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
  },
  placeholderLogoHeader: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center'
  },
  userNameSty: {
    marginTop: moderateScale(5),
    color: theme.colors.white,
    fontFamily: Fonts.outfitMedium,
    fontSize: moderateScale(15)
  },
  addMemberContainer: {
    backgroundColor: theme.colors.blue,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  searchContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  cardContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.lightLavenderGray,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: 'hidden',
  },
  cardBanner: {
    width: '100%',
    height: moderateScale(150),
    borderRadius: theme.borderRadius.lg
  },
  cardTitle: {
    fontFamily: Fonts.outfitMedium,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.DarkGray,
    marginVertical: theme.spacing.sm,
  },
  prizeContainer: {
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  prizeLabel: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.appleGreen,
  },
  prizeValue: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.appleGreen,
  },
  drawDetails: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.md,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.blue,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    fontFamily: Fonts.outfitMedium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.blue,
  },
  primaryAction: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.blue,
    paddingVertical: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  referralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.white,
  },
  referralIconWrapper: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.xs,
  },
  referralLabel: {
    flex: 1,
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.blue,
  },
  referralBadge: {
    minWidth: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: theme.colors.appleGreen,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  referralBadgeText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontFamily: Fonts.outfitMedium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.DarkGray,
    marginBottom: theme.spacing.xs,
  },
  emptyStateSubtitle: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  referButtonText: {
    color: theme.colors.blue,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  viewButtonText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontWeight.semibold,
  },

});
