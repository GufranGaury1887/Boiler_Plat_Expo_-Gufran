import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, Image, FlatList, ListRenderItem, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VolunteerOpportunitiesScreenProps } from '@navigation';
import { Strings, theme } from '@constants';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import SVG from '@assets/icons';
import { useVolunteerHoursDetails, useInfiniteVolunteerOpportunities, VolunteerOpportunity } from '@services/mainServices';


type VolunteerOpportunityTab = {
    id: number;
    tabName: string;
};

const VOLUNTEER_OPPORTUNITY_TABS: VolunteerOpportunityTab[] = [
    { id: 1, tabName: "Upcoming" },
    { id: 2, tabName: "Requested" },
    { id: 3, tabName: "Ongoing" },
    { id: 4, tabName: "Past" },
];


export const VolunteerOpportunitiesScreen: React.FC<VolunteerOpportunitiesScreenProps> = ({ navigation, route }) => {
    const { selectedClub, selectedMember: initialSelectedMember } = route?.params ?? {};
    const scrollViewRef = useRef<ScrollView>(null);
    const chipRefs = useRef<{ [key: string]: View | null }>({});

    const memberId = initialSelectedMember?.id;
    const clubId = selectedClub?.id;

    const [activeTabId, setActiveTabId] = useState<number>(VOLUNTEER_OPPORTUNITY_TABS[0]?.id ?? 1);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const { data: hoursData, isLoading, isRefetching, refetch: hoursDataRefetch } = useVolunteerHoursDetails(memberId, clubId);
    const userHoursData = hoursData?.data?.data;

    // Get opportunities with infinite query based on active tab (requestType)
    const { data: opportunitiesData, isLoading: isLoadingOpportunities, isRefetching: isRefetchingOpportunities, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchOpportunities, } = useInfiniteVolunteerOpportunities(memberId as number, clubId as number, activeTabId);

    // Flatten all pages into a single array
    const opportunities = useMemo(() => {
        if (!opportunitiesData?.pages) return [];

        return opportunitiesData.pages.flatMap((page) => {
            const pageData = page?.data?.data;
            if (Array.isArray(pageData)) {
                return pageData;
            } else if (pageData && typeof pageData === 'object' && 'opportunities' in pageData) {
                return pageData.opportunities || [];
            }
            return [];
        });
    }, [opportunitiesData]);

    const renderHeader = () => (

        <View style={{ marginHorizontal: theme.spacing.lg, }}>
            <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                        <Text style={styles.statValue}>{userHoursData?.totalApprovedHours}{Strings.VolunteerOpportunities.HOURS}</Text>
                        <Text style={styles.statLabel}>{Strings.VolunteerOpportunities.TOTAL_HOURS}</Text>
                    </View>
                    <View style={styles.statBlock}>
                        <Text style={styles.statValue}>{userHoursData?.thisMonthApprovedHours}{Strings.VolunteerOpportunities.HOURS}</Text>
                        <Text style={styles.statLabel}>{Strings.VolunteerOpportunities.THIS_MONTH}</Text>
                    </View>
                </View>
                {userHoursData?.nextShiftDisplay !== "No upcoming shift" && (
                    <View style={styles.divider} />
                )}
                {userHoursData?.nextShiftDisplay !== "No upcoming shift" && (
                    <View style={{ paddingTop: theme.spacing.sm }}>
                        <Text style={styles.nextShift}>{userHoursData?.nextShiftDisplay}</Text>
                        <Text style={styles.nextShiftLabel}>{Strings.VolunteerOpportunities.NEXT_SHIFT}</Text>
                    </View>)}
            </View>

            <ScrollView bounces ref={scrollViewRef} horizontal style={styles.tabsRowContainer} contentContainerStyle={styles.tabsRow} showsHorizontalScrollIndicator={false}>
                {VOLUNTEER_OPPORTUNITY_TABS.map(tab => {
                    const tabKey = `tab-${tab.id}`;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            activeOpacity={0.8}
                            ref={(ref) => {
                                chipRefs.current[tabKey] = ref;
                            }}
                            onPress={() => {
                                setActiveTabId(tab.id);
                                setTimeout(() => {
                                    chipRefs.current[tabKey]?.measureLayout(
                                        scrollViewRef.current as any,
                                        (x) => {
                                            scrollViewRef.current?.scrollTo({ x: Math.max(0, x - 20), animated: true });
                                        },
                                        () => { }
                                    );
                                }, 100);
                            }}>
                            <View style={[styles.tabPill, activeTabId === tab.id && styles.tabPillActive]}>
                                <Text style={[styles.tabText, activeTabId === tab.id && styles.tabTextActive]}>{tab.tabName}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderOpportunity: ListRenderItem<VolunteerOpportunity> = ({ item }) => {
        const location = item?.address || 'Location not available';
        const dateLabel = item.scheduleDate || 'Date not available';


        const createNavigationData = () => {
            const navigationData = {
                selectedClub: selectedClub,
                selectedMember: selectedClub?.selectedMember,
                item: item
            };
            console.log('Navigation data being passed:', navigationData);
            return navigationData;
        };

        return (
            <View style={styles.opCard}>
                <View style={{ paddingHorizontal: theme.spacing.sm }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={styles.opTitle}>{item.title}</Text>
                </View>
                {location !== 'Location not available' && (
                    <View style={styles.opMetaRow}>
                        <SVG.locationBlue width={moderateScale(20)} height={moderateScale(20)} />
                        <Text style={styles.opMetaText}>{location}</Text>
                    </View>
                )}
                {dateLabel !== 'Date not available' && (
                    <View style={styles.opMetaRow}>
                        <SVG.CalendarBlue width={moderateScale(20)} height={moderateScale(20)} />
                        <Text style={styles.opMetaText}>{dateLabel}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.detailsButton} activeOpacity={0.8}
                    onPress={() => {
                        navigation.navigate("VolunteerOpportunitiesDetailsScreen", createNavigationData())
                    }}>
                    <Text style={styles.detailsButtonText}>{Strings.VolunteerOpportunities.VIEW_MORE_DETAILS}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderListFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

    const loadMoreOpportunities = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };





    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android' ? true : false}
            />
            {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}
            <SafeAreaView style={styles.header} >

                <View style={{ flexDirection: 'row', paddingHorizontal: theme.spacing.lg }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.userConSty}>
                            {!!selectedClub?.clubImage ? (<Image
                                // onLoadEnd={() => setIsLoading(false)}
                                // onLoad={() => setIsLoading(true)}
                                // onLoadStart={() => setIsLoading(true)}
                                source={{ uri: selectedClub?.clubImage }} style={styles.userDetailsSty}
                                resizeMode='cover'
                            />
                            ) : (
                                <View style={styles.placeholderLogoHeader}>
                                    <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Unknown Club'}</Text>
                    </View>
                </View>
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                    <Text style={styles.headerTitle}>{Strings.VolunteerOpportunities.VOLUNTEER_OPPORTUNITIES}</Text>
                </View>
                <View style={styles.addMemberContainer}>
                </View>
                <View style={styles.content}>
                    <FlatList
                        data={opportunities}
                        keyExtractor={(item, index) => {
                            const id = item?.id?.toString() || '';
                            const slotId = (item?.slotId || item?.slot_id || '').toString();
                            const date = item?.scheduleDate || '';
                            const type = (typeof item?.opportunityType !== 'undefined' ? String(item?.opportunityType) : '');
                            const parts = [id, slotId, date, type].filter(part => part && part.toString().trim() !== '');
                            return parts.length ? `op-${parts.join('-')}` : `op-idx-${index}`;
                        }}
                        renderItem={renderOpportunity}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={renderHeader}
                        ListFooterComponent={renderListFooter}
                        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
                        onEndReached={loadMoreOpportunities}
                        onEndReachedThreshold={0.5}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing || isRefetching || isLoading || isRefetchingOpportunities}
                                onRefresh={async () => {
                                    setIsRefreshing(true);
                                    try {
                                        await Promise.all([
                                            hoursDataRefetch(),
                                            refetchOpportunities(),
                                        ]);
                                    } finally {
                                        setIsRefreshing(false);
                                    }
                                }}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                        ListEmptyComponent={
                            !isLoadingOpportunities && opportunities.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No opportunities found</Text>
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
    headerTitle: {
        marginTop: moderateScale(10),
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(22),
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
        paddingTop: theme.spacing.md,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
    },
    statsCard: {
        backgroundColor: '#F6F9FE',
        borderRadius: moderateScale(16),
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderWidth: 1,
        borderColor: '#E6EEF9',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    statBlock: {
        width: '48%'
    },
    statValue: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    statLabel: {
        marginTop: moderateScale(2),
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.DarkGray,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#E1E8F5',
    },
    nextShift: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.appleGreen,
    },
    nextShiftLabel: {
        marginTop: moderateScale(2),
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.DarkGray,
    },
    tabsRowContainer: {
        marginTop: theme.spacing.md,
        marginHorizontal: -theme.spacing.sm,
        // paddingHorizontal: theme.spacing.lg,
    },
    tabsRow: {
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    tabPill: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.xxl,
    },
    tabPillActive: {
        backgroundColor: theme.colors.blue,
        borderWidth: 1,
        borderColor: theme.colors.blue,
    },
    tabText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(12),
        color: theme.colors.blue,
    },
    tabTextActive: {
        color: theme.colors.white,
    },
    opCard: {
        backgroundColor: '#F6F9FE',
        borderRadius: moderateScale(16),
        padding: theme.spacing.xs,
        paddingTop: theme.spacing.sm,
        borderWidth: 1,
        borderColor: '#E6EEF9',
        marginTop: theme.spacing.lg,
        marginHorizontal: theme.spacing.lg,
    },
    opTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    opMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.sm,
        marginVertical: theme.spacing.xs,
    },
    opMetaText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: '#4C5B7B',
    },
    opTopRight: {
        right: theme.spacing.lg,
        top: theme.spacing.lg,
    },
    ctaPill: {
        paddingVertical: moderateScale(4),
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.borderRadius.xxl,
        borderWidth: 1,

    },
    joinPill: {
        backgroundColor: '#F1FCE6',
        borderColor: '#C6E8A4',
    },
    joinPillText: {
        color: '#6DB100',
    },
    requestPill: {
        backgroundColor: '#F6FBEF',
        borderColor: '#DDEFC6',
    },
    requestPillText: {
        color: '#7FB800',
    },
    ctaPillText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.xs,
    },
    detailsButton: {
        marginHorizontal: moderateScale(-2),
        marginTop: theme.spacing.md,
        backgroundColor: theme.colors.white,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E6EEF9',
        borderBottomRightRadius: moderateScale(12),
        borderBottomLeftRadius: moderateScale(12),
    },
    detailsButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.blue,
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
    userDetailsSty: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
    },
    loadingFooter: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    emptyText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.DarkGray,
    },
    slotLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
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
        marginVertical: theme.spacing.xs,
        height: moderateScale(55),
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        flexDirection: 'row',
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.spacing.md
    },
    headerContainer: {
        paddingVertical: theme.spacing.xs,
    },
    mamberHeaderTitle: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(16),
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
    nextButton: {
        width: '100%',
        marginBottom: theme.spacing.md,
    },
});
