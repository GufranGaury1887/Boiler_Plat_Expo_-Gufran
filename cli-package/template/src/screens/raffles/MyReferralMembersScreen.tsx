import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    Image,
    FlatList,
    ListRenderItem,
    Share,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';
import { MyReferralMembersScreenProps } from '@navigation';
import { theme } from '@constants';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import SVG from '@assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@components/common';
import { useInfiniteReferrerMemberSales, ReferrerMember, mainService } from '@services/mainServices';


export const MyReferralMembersScreen: React.FC<MyReferralMembersScreenProps> = ({ navigation, route }) => {
    const { selectedClub, selectedMember: initialSelectedMember, raffleId, raffleTitle } = route?.params ?? {};

    const memberId = initialSelectedMember?.id;
    const pageSize = 10;

    // Fetch referral members with pagination
    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useInfiniteReferrerMemberSales(raffleId, memberId, pageSize);

    // Modal state
    const [ticketModalVisible, setTicketModalVisible] = useState(false);
    const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);
    const [ticketNumbers, setTicketNumbers] = useState<any>([]);
    const translateY = useRef(new Animated.Value(0)).current;
    const screenHeight = Dimensions.get('window').height;
    const bottomSheetHeight = screenHeight * 0.5; // 50% of screen height


    // Flatten paginated data
    const referralMembers = useMemo(() => {
        if (!data?.pages) return [];

        return data.pages.flatMap((page) => {
            // Access the correct nested structure: data.data.data.salesList
            const responseData = page?.data?.data;

            if (responseData && typeof responseData === 'object') {
                // Check for nested data.data.salesList structure
                if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
                    const nestedData = responseData.data as any;
                    if ('salesList' in nestedData && Array.isArray(nestedData.salesList)) {
                        return nestedData.salesList;
                    }
                }
                // Direct salesList
                if ('salesList' in responseData && Array.isArray(responseData.salesList)) {
                    return responseData.salesList;
                }
                // Fallback to other possible structures
                if ('members' in responseData && Array.isArray(responseData.members)) {
                    return responseData.members;
                } else if ('referralMembers' in responseData && Array.isArray(responseData.referralMembers)) {
                    return responseData.referralMembers;
                } else if (Array.isArray(responseData)) {
                    return responseData;
                }
            } else if (Array.isArray(page?.data?.data)) {
                return page.data.data;
            }

            return [];
        });
    }, [data]);

    // Calculate total sales from API response
    const totalSales = useMemo(() => {
        if (!data?.pages?.[0]) return 0;

        const firstPage = data.pages[0];
        const responseData = firstPage?.data?.data;

        // Try to get totalPurchasedTicketCount from nested data structure
        if (responseData && typeof responseData === 'object') {
            if ('data' in responseData && responseData.data && typeof responseData.data === 'object') {
                const nestedData = responseData.data as any;
                if (typeof nestedData.totalPurchasedTicketCount === 'number') {
                    return nestedData.totalPurchasedTicketCount;
                }
            }
            // Try direct totalPurchasedTicketCount
            if ('totalPurchasedTicketCount' in responseData && typeof responseData.totalPurchasedTicketCount === 'number') {
                return responseData.totalPurchasedTicketCount;
            }
        }

        // Fallback: calculate from member data
        return referralMembers.reduce((sum, member) => {
            const tickets = member.purchasedTicketCount ?? member.ticketCount ?? member.ticketsSold ?? member.totalTickets ?? 0;
            return sum + tickets;
        }, 0);
    }, [data, referralMembers]);

    const handleReferToFriends = async () => {
        try {
            const response = await mainService.getReferralCode({
                raffleId: raffleId || 0,
                memberId: memberId || 0,
            });

            const responseData = response?.data?.data;
            const referralCode = responseData?.referralCode || '';
            const clubCode = responseData?.clubCode || '';
            const clubName = responseData?.clubName || 'ClubYakka';

            const appLink = '(App Link)';
            const shareMessage =
                `Join the *${raffleTitle}* raffle on ClubYakka app!

Use my referral code: *${referralCode}* when buying tickets

Steps to buy:
1. Ensure you have ${clubName} club already joined or if not, find it with club code: #${clubCode} to join it
2. Continue as desired member in Club Dashboard
3. Click Raffle section and find raffle: *${raffleTitle}*
4. When buying raffle tickets, apply my code: *${referralCode}*
5. Purchase raffle tickets and WIN!

Click the link to open the app ${appLink}`;

            Share.share({
                message: shareMessage,
                title: `${clubName} Raffle on ClubYakka`
            });
        } catch (error) {
            console.error('Failed to get referral code:', error);
        }
    };

    // Handle load more for pagination
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handle pull to refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Bottom sheet animation functions
    const showBottomSheet = () => {
        setTicketModalVisible(true);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const hideBottomSheet = () => {
        Animated.timing(translateY, {
            toValue: bottomSheetHeight,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTicketModalVisible(false);
            translateY.setValue(bottomSheetHeight);
            setTicketNumbers([]);
        });
    };

    // PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                translateY.setOffset((translateY as any)._value);
                translateY.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow downward movement
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                translateY.flattenOffset();

                // If swiped down more than 100px or with high velocity, close the modal
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    hideBottomSheet();
                } else {
                    // Snap back to original position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    // Handle ticket badge press
    const handleTicketPress = async (member: ReferrerMember) => {
        try {
            setTicketDetailsLoading(true);

            const response = await mainService.getTicketDetails({
                raffleId: raffleId || 0,
                memberId: member?.memberId || 0,
                purchasedMemberId: member.memberId || member.id || 0,
            });
            console.log("data===>>>", JSON.stringify(response));


            if (response?.data?.data) {
                setTicketNumbers(response?.data?.data || []);
                showBottomSheet();
            }
        } catch (error) {
            console.error('Failed to fetch ticket details:', error);
        } finally {
            setTicketDetailsLoading(false);
        }
    };


    // Render individual member item
    const renderMemberItem: ListRenderItem<ReferrerMember> = ({ item }) => {
        const displayName = item.memberName || item.name || 'Unknown';
        const profileImg = item.profileImage || item.profileImageUrl;
        const tickets = item.purchasedTicketCount ?? item.ticketCount ?? item.ticketsSold ?? item.totalTickets ?? 0;

        return (
            <View style={styles.memberRow}>
                <View style={styles.memberInfo}>
                    <View style={styles.memberAvatar}>
                        {profileImg ? (
                            <Image source={{ uri: profileImg }} style={styles.avatarImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <SVG.UsersIcon width={moderateScale(24)} height={moderateScale(24)} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.memberName}>{displayName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.ticketBadge}
                    onPress={() => handleTicketPress(item)}
                    disabled={ticketDetailsLoading}
                >
                    {ticketDetailsLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.blue} />
                    ) : (
                        <Text style={styles.ticketCount}>{tickets} Ticket{tickets !== 1 ? 's' : ''}</Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // Render footer loader
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.blue} />
            </View>
        );
    };

    // Render empty state
    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.colors.blue} />
                    <Text style={styles.emptyText}>Loading referral members...</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>Failed to load referral members</Text>
                    <Text style={styles.errorSubText}>{error?.message || 'Please try again'}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No referral members found</Text>
                <Text style={styles.emptySubText}>Start referring friends to see them here</Text>
            </View>
        );
    };

    return (

        console.log("hhhh", ticketNumbers),

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
                    <Text style={styles.headerTitle}>My Referral Members Sales</Text>
                </View>
                <View style={styles.addMemberContainer} />
                <View style={styles.content}>
                    <View style={{ paddingHorizontal: theme.spacing.lg }}>

                        <View style={styles.headerCard}>
                            <Text style={styles.totalSalesLabel}>Total Sales</Text>
                            <View style={styles.totalSalesBadge}>
                                <Text style={styles.totalSalesCount}>{totalSales}</Text>
                            </View>
                        </View>
                        <View style={{ height: moderateScale(500) }}>
                            <FlatList
                                data={referralMembers}
                                keyExtractor={(item, index) => item.id?.toString() || item.memberId?.toString() || index.toString()}
                                renderItem={renderMemberItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.3}
                                ListFooterComponent={renderFooter}
                                ListEmptyComponent={renderEmptyComponent}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefetching}
                                        onRefresh={handleRefresh}
                                        tintColor={theme.colors.blue}
                                        colors={[theme.colors.blue]}
                                    />
                                }
                            />
                        </View>
                        <Button
                            title="Refer to More Friends"
                            onPress={handleReferToFriends}
                            variant="outline"
                            textStyle={styles.referButtonText}
                            style={styles.referButton}
                            size="medium"
                        />
                    </View>
                </View>
            </SafeAreaView>

            {/* Ticket Details Modal */}
            <Modal
                visible={ticketModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={hideBottomSheet}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={hideBottomSheet}
                    />
                    <Animated.View
                        style={[
                            styles.modalContainer,
                            {
                                transform: [{ translateY }],
                            },
                        ]}
                    >
                        <View style={styles.dragHandle} {...panResponder.panHandlers} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ticket Details</Text>
                        </View>
                        <FlatList
                            data={ticketNumbers}
                            keyExtractor={(item, index) => `ticket-${item}-${index}`}
                            contentContainerStyle={styles.ticketListContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View style={styles.ticketNumberBadge}>
                                    <Text style={styles.ticketNumberText}>{item?.ticketNumber}</Text>
                                </View>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyTicketContainer}>
                                    <Text style={styles.emptyTicketText}>No tickets found</Text>
                                </View>
                            )}
                        />
                    </Animated.View>
                </View>
            </Modal>
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
        height: Platform.OS === 'ios' ? 44 : 0,
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
        justifyContent: 'center',
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
        justifyContent: 'center',
    },
    userNameSty: {
        marginTop: moderateScale(5),
        color: theme.colors.white,
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(15),
    },
    addMemberContainer: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
    },
    listContent: {
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    // Header card with total sales
    headerCard: {
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs
    },
    totalSalesLabel: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.blue,
    },
    totalSalesBadge: {
        width: moderateScale(25),
        height: moderateScale(25),
        borderRadius: moderateScale(12.5),
        backgroundColor: theme.colors.appleGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalSalesCount: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.blue,
    },
    // Member row
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background,
        paddingVertical: moderateScale(10),
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    memberAvatar: {
        width: moderateScale(45),
        height: moderateScale(45),
        borderRadius: moderateScale(22.5),
        marginRight: theme.spacing.md,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberName: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(16),
        color: theme.colors.text,
    },
    ticketBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    ticketCount: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    // Footer
    footerContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
    },
    referButton: {
        borderColor: theme.colors.blue,
        backgroundColor: 'transparent',
        marginTop: theme.spacing.sm,
    },
    referButtonText: {
        color: theme.colors.blue,
        fontFamily: Fonts.outfitMedium,
    },
    // Loading and error states
    footerLoader: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(60),
        paddingHorizontal: theme.spacing.xl,
    },
    emptyText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    emptySubText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    errorSubText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    retryButton: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.blue,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.sm,
    },
    retryButtonText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.white,
    },
    // Modal styles
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
        height: '60%',
        maxHeight: '60%',
    },
    dragHandle: {
        width: moderateScale(40),
        height: moderateScale(4),
        backgroundColor: theme.colors.border,
        borderRadius: moderateScale(2),
        alignSelf: 'center',
        marginBottom: theme.spacing.sm,
    },
    modalHeader: {
        paddingVertical: theme.spacing.md,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
    },
    modalSubtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
    },
    ticketListContent: {
        paddingVertical: theme.spacing.sm,
    },
    ticketNumberBadge: {
        flex: 1,
        margin: moderateScale(5),
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(8),
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: moderateScale(90),
    },
    ticketNumberText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.blue,
    },
    emptyTicketContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(40),
    },
    emptyTicketText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    closeButton: {
        marginTop: theme.spacing.md,
    },
});
