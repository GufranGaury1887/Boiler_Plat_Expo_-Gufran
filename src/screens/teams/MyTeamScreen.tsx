import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Keyboard } from 'react-native';
import { MyTeamScreen as MyTeamScreenProps } from '../../types/navigation';
import { Strings, theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteMyTeams } from '../../services/mainServices';
import { useQueryClient } from '@tanstack/react-query';
import { TeamCard } from '../../components/common';
import ToastManager from '../../components/common/ToastManager';
import { getApiErrorInfo, useGetImageUrl } from '../../services';
import { useFocusEffect } from '@react-navigation/native';
const PAGE_SIZE = 10;

export const MyTeamScreen: React.FC<MyTeamScreenProps> = ({ navigation, route }) => {
    const { selectedClub, selectedMember: initialSelectedMember } = route?.params ?? {}
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [joinClubImageUrls, setJoinClubImageUrls] = useState<Record<number, string>>({});
    const queryClient = useQueryClient();
    const getImageUrlMutation = useGetImageUrl();
    


    const createNavigationData = () => {
        const navigationData: any = {
            selectedClub: selectedClub,
            selectedMember: initialSelectedMember
        };
        console.log('Navigation data being passed:', navigationData);
        return navigationData;
    };

    

    const keyExtractor = (item: any, index: number) => {
        // Create a more robust key that combines multiple attributes to ensure uniqueness
        const id = item?.id?.toString() || '';
        const name = item?.name || item?.clubName || '';
        const clubCode = item?.clubCode || item?.uniqueCode || '';
        const timestamp = item?.createdAt || item?.timestamp || '';

        // Create a unique composite key using multiple attributes
        const keyParts = [id, name, clubCode, timestamp].filter(part => part && part.toString().trim() !== '');

        if (keyParts.length > 0) {
            return `club-${keyParts.join('-')}-${index}`;
        }

        // Ultimate fallback with index to ensure uniqueness
        return `club-unknown-${index}`;
    };


    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch, error } = useInfiniteMyTeams(selectedClub?.selectedMember?.id, PAGE_SIZE);
    console.log("MyTeamScreen data", JSON.stringify(data));

    // const pandingRequests = data?.pages
    const pendingRequestsCount = data?.pages?.reduce((sum: number, p: any) => sum + (p?.data?.data?.pendingRequest ?? 0), 0) ?? 0;


    // Flatten all pages into a single array and add clubImageUrl from state
    const allClubs = data?.pages?.flatMap(page =>
        (page?.data?.data?.members || []).map((club: any) => ({
            ...club,
            clubImageUrl: joinClubImageUrls[club.id] || undefined
        }))
    ) || [];


    useFocusEffect(useCallback(() => {
        refetch();
    }, [refetch]));



    // Pull to refresh
    const onRefresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            // Clear all cached data for this query to start fresh from page 0
            queryClient.removeQueries({
                queryKey: ['infiniteClubSearch', searchQuery, PAGE_SIZE]
            });
            // This will trigger a fresh fetch starting from page 0
            await refetch();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch, queryClient, searchQuery]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Load more data
    const onEndReached = useCallback(() => {
        if (isFetchingNextPage || !hasNextPage) return;
        fetchNextPage();
    }, [isFetchingNextPage, hasNextPage, fetchNextPage, allClubs.length]);

    // Render loading footer
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.footerText}>Loading more teams...</Text>
            </View>
        );
    };



    const renderEmptyComponent = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyListText}>No Teams found</Text>
                <Text style={styles.emptySubText}>Try refreshing or check back later</Text>
            </View>
        );
    };

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);



    const getJoinClubImageUrls = async (clubItem: any) => {
        if (clubItem?.clubImage == null) return;

        // Skip if already fetched
        if (joinClubImageUrls[clubItem.id] !== undefined) return;

        const [folder, blobName] = clubItem?.clubImage.split('/');

        try {
            getImageUrlMutation.mutate({
                containerName: folder,
                blobName: blobName
            }, {
                onSuccess: (response) => {
                    const imageUrl = response?.data?.data?.url;
                    console.log('JoinClub Image URL response', response.data);

                    // Prefetch image into React Native cache to avoid blink when scrolling back
                    if (imageUrl) {
                        Image.prefetch(imageUrl).catch((prefetchError) => {
                            console.warn('JoinClub Image prefetch failed:', prefetchError);
                        });
                    }

                    // Simple state update instead of recreating entire query cache
                    setJoinClubImageUrls(prev => ({
                        ...prev,
                        [clubItem.id]: imageUrl
                    }));
                },
                onError: (error) => {
                    const errorInfo = getApiErrorInfo(error);
                    ToastManager.error(errorInfo.message);
                    setJoinClubImageUrls(prev => ({
                        ...prev,
                        [clubItem.id]: ""
                    }));
                }
            });
        } catch (err) {
            setJoinClubImageUrls(prev => ({
                ...prev,
                [clubItem.id]: ""
            }));
        }
    };

    const onJoinClubViewableItemsChanged = useCallback(
        ({
            viewableItems,
        }: {
            viewableItems: Array<{ item: any }>;
        }) => {
            const items = viewableItems.map(({ item }) => item);
            items.forEach((item) => {
                if (item && !item.clubImageUrl) {
                    console.log('JoinClub onViewableItemsChanged>>>>>', JSON.stringify(item));
                    getJoinClubImageUrls(item);
                }
            });
        },
        [getJoinClubImageUrls]
    );

    const joinClubViewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50, // Increased threshold for better on-demand loading
        minimumViewTime: 100, // Minimum time item must be visible before triggering
        waitForInteraction: false, // Don't wait for user interaction
    }).current;


    const renderClubItem = ({ item }: any) => {
        return (
            <TeamCard
                team={item}
                onChat={true}
                onChatPress={() => {

                    navigation.navigate('ChatThreads', {
                        team: item,
                        selectedMember: initialSelectedMember,
                        selectedClub: selectedClub
                    });
                }}

                onPress={() => {
                    navigation.navigate('MyTeamDetails', {
                        club: item,
                        selectedMember: initialSelectedMember,
                        selectedClub: selectedClub
                    });
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
            <SafeAreaView style={styles.header} >
                <View style={{ flexDirection: 'row', paddingHorizontal: theme.spacing.lg }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
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
                <Text style={styles.headerTitle}>{Strings.Teams.TEAMS}</Text>


                <View style={styles.addMemberContainer}>
                    <TouchableOpacity style={styles.addMemberButton} onPress={() => navigation.navigate('JoinTeam', createNavigationData())}>
                        <SVG.icAdd width={moderateScale(20)} height={moderateScale(20)} />
                        <Text style={styles.addMemberButtonText}>{Strings.Teams.JOIN_TEAM_SUBTITLE}</Text>
                    </TouchableOpacity>

                    {pendingRequestsCount > 0 && (
                        <TouchableOpacity
                            style={{ alignItems: 'center', marginTop: moderateScale(10) }}
                            onPress={() => navigation.navigate('PendingRequests',createNavigationData())}
                        >
                            <Text style={[styles.addMemberButtonText, { textDecorationLine: 'underline' }]}>{`${pendingRequestsCount} ${Strings.Teams.PENDING_REQUEST}`}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>{Strings.Teams.MY_TEAMS_SECTION_TITLE}</Text>
                    <FlatList
                        data={allClubs}
                        renderItem={renderClubItem}
                        keyExtractor={keyExtractor}
                        style={styles.clubsList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        removeClippedSubviews={false}
                        initialNumToRender={10}
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.9}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmptyComponent}
                        onViewableItemsChanged={onJoinClubViewableItemsChanged}
                        viewabilityConfig={joinClubViewabilityConfig}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
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
        paddingTop: theme.spacing.xs,
    },
    headerTitle: {
        marginTop: moderateScale(10),
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(22),
        color: theme.colors.white,
        marginLeft: theme.spacing.lg
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
        marginTop: moderateScale(10),
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
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        marginRight: moderateScale(10),
    },
    memberName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
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
    searchInput: {
    },
    searchContainer: {
        marginBottom: theme.spacing.md,
    },
    placeholderStyle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(5),
        color: theme.colors.textSecondary,
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
    userNameSty: {
        marginTop: moderateScale(5),
        color: theme.colors.white,
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(15)
    },
    userDetailsSty: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),

    },
    placeholderLogoHeader: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
});
