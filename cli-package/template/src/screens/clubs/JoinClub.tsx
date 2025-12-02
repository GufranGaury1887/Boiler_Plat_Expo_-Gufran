import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Modal, Animated, Dimensions, PanResponder, Keyboard } from 'react-native';
import { JoinClubScreenProps } from '../../types/navigation';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteClubSearch, useJoinClub } from '../../services/mainServices';
import { useQueryClient } from '@tanstack/react-query';
import { Button, ClubCard, TextInput } from '../../components/common';
import ToastManager from '../../components/common/ToastManager';
import { getApiErrorInfo, useMembers, useGetImageUrl } from '../../services';
import { useFocusEffect } from '@react-navigation/native';
const PAGE_SIZE = 10;

type MemberListItemProps = {
    item: any;
    isSelected: boolean;
    onSelect: (member: any) => void;
};

const MemberListItem: React.FC<MemberListItemProps> = ({ item, isSelected, onSelect }) => {
    const [memberImageError, setMemberImageError] = useState(false);
    return (
        <TouchableOpacity style={styles.memberListItem} onPress={() => onSelect(item)}>
            {item?.profileImage && !memberImageError ? (
                <Image
                    source={{ uri: item?.profileImage }}
                    onError={() => {
                        setMemberImageError(true);
                    }}
                    style={styles.profileImage}
                />
            ) : (
                <SVG.emptyUser style={{ marginRight: moderateScale(10) }} width={moderateScale(50)} height={moderateScale(50)} />
            )}
            {/* {memberImageError && (
                <SVG.emptyUser style={{ marginRight: moderateScale(10) }} width={moderateScale(50)} height={moderateScale(50)} />
            )} */}
            <View style={styles.memberNameContainer}>
                <Text style={styles.memberName}>{item?.name}</Text>
                {item?.isOwner && (
                    <Text style={styles.memberNameSubtitle}>Yourself</Text>
                )}
            </View>
            <View>
                {isSelected ? (
                    <SVG.checkRadio width={moderateScale(20)} height={moderateScale(20)} />
                ) : (
                    <SVG.uncheckRadio width={moderateScale(20)} height={moderateScale(20)} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export const JoinClubScreen: React.FC<JoinClubScreenProps> = ({ navigation }) => {

    // Pagination state
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [membersModal, setMembersModal] = useState<boolean>(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    // Bottom sheet animation values
    const translateY = useRef(new Animated.Value(0)).current;
    const screenHeight = Dimensions.get('window').height;
    const bottomSheetHeight = screenHeight * 0.45; // 45% of screen height
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [joinClubDetails, setJoinClubDetails] = useState<any>(null);
    const [joinClubImageUrls, setJoinClubImageUrls] = useState<Record<number, string>>({});
    const [joinClubMemberImageUrls, setJoinClubMemberImageUrls] = useState<Record<number, string>>({});
    const queryClient = useQueryClient();
    const joinClubMutation = useJoinClub();
    const getImageUrlMutation = useGetImageUrl();




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


    const { data, fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteClubSearch(searchQuery, PAGE_SIZE);

    // Flatten all pages into a single array and add clubImageUrl from state
    const allClubs = data?.pages?.flatMap(page =>
        (page?.data?.data || []).map((club: any) => ({
            ...club,
            clubImageUrl: joinClubImageUrls[club.id] || undefined
        }))
    ) || [];


    const { data: membersData, isLoading: isLoadingMembers, isError: isErrorMembers, refetch: refetchMembers } = useMembers({ PageNumber: 0, PageSize: 10 });
    const rawMembers = Array.isArray(membersData?.data?.data) ? membersData.data.data : [];
    const sortedMembers = rawMembers.sort((a: any, b: any) => {
        if (a?.isOwner) return -1;
        if (b?.isOwner) return 1;
        return 0;
    });

    const members = sortedMembers.map((member: any) => ({
        ...member,
        profileImageUrl: joinClubMemberImageUrls[member.id] || undefined
    }));


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

    // Handle search input with debouncing
    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            return;
        }

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            // Clear cache and refetch with new search term
            queryClient.removeQueries({
                queryKey: ['infiniteClubSearch', text || 'club', PAGE_SIZE]
            });
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
    }, [searchTimeout, queryClient]);

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
                <Text style={styles.footerText}>Loading more clubs...</Text>
            </View>
        );
    };



    const renderEmptyComponent = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyListText}>No clubs found</Text>
                <Text style={styles.emptySubText}>Try refreshing or check back later</Text>
            </View>
        );
    };

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const handleMemberSelection = (member: any) => {
        setSelectedMember(member);
    };

    // Bottom sheet animation functions
    const showBottomSheet = () => {
        setSelectedMember(null);
        setMembersModal(true);
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
            setMembersModal(false);
            translateY.setValue(bottomSheetHeight);
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

    const renderMemberListItem = ({ item }: { item: any }) => (
        <MemberListItem
            item={item}
            isSelected={selectedMember?.id === item?.id}
            onSelect={handleMemberSelection}
        />
    );


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


    const getJoinClubImageMembersUrls = async (memberItem: any) => {
        console.log('JoinClub getJoinClubImageMembersUrls>>>>>14798', JSON.stringify(memberItem));
        if (memberItem?.profileImage == null) return;

        // Skip if already fetched
        if (joinClubMemberImageUrls[memberItem.id] !== undefined) return;
        console.log('JoinClub getJoinClubImageMembersUrls>>>>>147', JSON.stringify(memberItem));

        const [folder, blobName] = memberItem?.profileImage.split('/');

        try {
            getImageUrlMutation.mutate({
                containerName: folder,
                blobName: blobName
            }, {
                onSuccess: (response) => {
                    const imageUrl = response?.data?.data?.url;
                    console.log('JoinClub Image Members URL response', response.data);

                    // Prefetch image into React Native cache to avoid blink when scrolling back
                    if (imageUrl) {
                        Image.prefetch(imageUrl).catch((prefetchError) => {
                            console.warn('JoinClub Image prefetch failed:', prefetchError);
                        });
                    }

                    // Simple state update instead of recreating entire query cache
                    setJoinClubMemberImageUrls(prev => ({
                        ...prev,
                        [memberItem.id]: imageUrl
                    }));
                },
                onError: (error) => {
                    const errorInfo = getApiErrorInfo(error);
                    ToastManager.error(errorInfo.message);
                    setJoinClubMemberImageUrls(prev => ({
                        ...prev,
                        [memberItem.id]: ""
                    }));
                }
            });
        } catch (err) {
            setJoinClubMemberImageUrls(prev => ({
                ...prev,
                [memberItem.id]: ""
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
    const onJoinClubViewableItemsChangedMembers = useCallback(
        ({
            viewableItems,
        }: {
            viewableItems: Array<{ item: any }>;
        }) => {
            const items = viewableItems.map(({ item }) => item);
            items.forEach((item) => {
                if (item && !item.profileImageUrl) {
                    getJoinClubImageMembersUrls(item);
                }
            });
        },
        [getJoinClubImageMembersUrls]
    );

    const joinClubViewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50, // Increased threshold for better on-demand loading
        minimumViewTime: 100, // Minimum time item must be visible before triggering
        waitForInteraction: false, // Don't wait for user interaction
    }).current;

    const joinClubViewabilityConfigMembers = useRef({
        viewAreaCoveragePercentThreshold: 50, // Increased threshold for better on-demand loading
        minimumViewTime: 100, // Minimum time item must be visible before triggering
        waitForInteraction: false, // Don't wait for user interaction
    }).current;

    const renderClubItem = ({ item }: any) => {
        return (
            <ClubCard
                club={item}
                onJoin={true}
                clubCodeShow={true}
                onJoinPress={() => {
                    setJoinClubDetails(item);

                    // Check if there's only one member with isOwner: true
                    if (rawMembers.length === 1 && rawMembers[0].isOwner === true) {
                        // Auto-select the single owner member and join directly
                        setSelectedMember(rawMembers[0]);

                        // Join club directly without showing modal
                        joinClubMutation.mutate({
                            clubId: item.id,
                            memberId: rawMembers[0].id,
                        }, {
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
                    } else {
                        // Show modal for member selection as usual
                        setMembersModal(true);
                        showBottomSheet();
                    }
                }}
            />
        );
    };

    const joinClub = () => {
        if (joinClubDetails && selectedMember) {

            joinClubMutation.mutate({
                clubId: joinClubDetails?.id,
                memberId: selectedMember?.id,
            }, {
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
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search and join club</Text>
                </View>
                <View style={styles.addMemberContainer}>
                </View>
                <View style={styles.content}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            leftIconStyle={{ marginLeft: theme.spacing.sm }}
                            leftIconSizeWidth={moderateScale(17)}
                            leftIconSizeHeight={moderateScale(17)}
                            placeholder="Unique code and club name"
                            style={styles.searchInput}
                            leftIcon={SVG.search}
                            variant="outlined"
                            maxLength={50}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                    </View>
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
                        // onViewableItemsChanged={onJoinClubViewableItemsChanged}
                        // viewabilityConfig={joinClubViewabilityConfig}
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


            <Modal
                visible={membersModal}
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
                        <FlatList
                            data={members}
                            renderItem={renderMemberListItem}
                            style={styles.membersList}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={() => {
                                return (
                                    <View>
                                        <View style={styles.headerContainer}>
                                            <Text style={styles.mamberHeaderTitle}>Continue as</Text>
                                        </View>
                                    </View>
                                )
                            }}
                            keyExtractor={(item, index) => {
                                // Create a more robust key for members
                                const id = item?.id?.toString() || '';
                                const name = item?.name || '';
                                const email = item?.email || '';
                                const memberCode = item?.membershipCode || '';
                                const createdAt = item?.createdAt || '';

                                // Create a unique composite key using multiple attributes
                                const keyParts = [id, name, email, memberCode, createdAt].filter(part => part && part.toString().trim() !== '');

                                if (keyParts.length > 0) {
                                    return `member-${keyParts.join('-')}`;
                                }

                                // Ultimate fallback with index to ensure uniqueness
                                return `member-unknown-${index}`;
                            }}

                        />

                        <Button
                            title="Continue"
                            onPress={() => {
                                joinClub();
                                hideBottomSheet();
                            }}
                            variant="primary"
                            size="medium"
                            style={styles.nextButton}
                            disabled={selectedMember == null ? true : false}
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
        height: Platform.OS === 'ios' ? 44 : 0, // Status bar height for iOS
        backgroundColor: theme.colors.blue,
        zIndex: 1000,
    },
    header: {
        flex: 1,
        backgroundColor: theme.colors.blue,
        paddingVertical: theme.spacing.xs,
        paddingTop: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.xs,
    },
    headerTitle: {
        marginTop: moderateScale(20),
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
});
