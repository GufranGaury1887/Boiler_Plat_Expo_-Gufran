import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Image, RefreshControl, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Strings, theme } from '@constants';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import SVG from '@assets/icons';
import { AnnouncementsScreenProps } from '@navigation';
import { useInfiniteAnnouncements, Announcement } from '@services/mainServices';

export const Announcements: React.FC<AnnouncementsScreenProps> = ({ navigation, route }) => {
    const { selectedClub, selectedMember: initialSelectedMember } = route?.params ?? {}
    const clubId = selectedClub?.id || 0;
    console.log("Announcements selectedClub", selectedClub);
    const pageSize = 10; // Default page size

    // Use infinite query for announcements
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
    } = useInfiniteAnnouncements(clubId, pageSize);

    // Flatten all pages into a single array
    const announcementsData = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap(page => {
            const pageData = page?.data?.data;
            if (!pageData) return [];

            // Handle both structures: { announcements: [] } or direct array
            if (Array.isArray(pageData)) {
                return pageData;
            }

            // Handle object structure with announcements property
            if (pageData && typeof pageData === 'object' && 'announcements' in pageData) {
                return pageData.announcements || [];
            }

            return [];
        });
    }, [data]);

    const keyExtractor = (item: Announcement, index: number): string => {
        // Create a unique key using message and sentOn date
        const messageHash = item.message?.substring(0, 20) || '';
        const dateHash = item.sentOn || index.toString();
        return `announcement-${dateHash}-${index}`;
    };

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Handle load more when reaching the end
    const handleLoadMore = useCallback(async () => {
        console.log('handleLoadMore called - hasNextPage:', hasNextPage, 'isFetchingNextPage:', isFetchingNextPage);
        if (hasNextPage && !isFetchingNextPage) {
            console.log('Fetching next page...');
            await fetchNextPage();
        } else {
            console.log('Not fetching - hasNextPage:', hasNextPage, 'isFetchingNextPage:', isFetchingNextPage);
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);




    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.emptyListText}>Loading announcements...</Text>
                </View>
            );
        }

        if (isError) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>Failed to load announcements</Text>
                    <Text style={styles.emptySubText}>{error?.message || 'Please try again'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyListText}>No announcements found</Text>
                <Text style={styles.emptySubText}>Try refreshing or check back later</Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.footerText}>Loading more...</Text>
            </View>
        );
    };

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);



    const formatSentOn = (sentOn?: string | number | Date): string => {
        if (!sentOn) return '';

        const tryFormat = (d: Date) => {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            if (hours === 0) hours = 12;
            return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
        };

        let date = new Date(sentOn);

        if (isNaN(date.getTime()) && typeof sentOn === 'string') {
            // Fallback parser for formats like: "29 Oct 2025 07:13 PM"
            const match = sentOn.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})\s(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
            if (match) {
                const [, dStr, monStr, yStr, hStr, mStr, apStr] = match;
                const monthMap: Record<string, number> = {
                    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
                };
                const monthIndex = monthMap[monStr as keyof typeof monthMap];
                if (monthIndex !== undefined) {
                    let hour24 = parseInt(hStr, 10) % 12;
                    const isPM = /pm/i.test(apStr);
                    if (isPM) hour24 += 12;
                    const year = parseInt(yStr, 10);
                    const day = parseInt(dStr, 10);
                    const minute = parseInt(mStr, 10);
                    date = new Date(year, monthIndex, day, hour24, minute, 0, 0);
                }
            }
        }

        if (isNaN(date.getTime())) return String(sentOn);

        return tryFormat(date);
    };


    const renderAnnouncementItem = ({ item }: { item: Announcement }) => {
        if (!item) return null;

        return (
            <View style={styles.announcementCard}>
                {/* Message Content */}
                <Text style={styles.announcementMessage}>{item.message}</Text>

                {/* Image if available */}
                {item.image && (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.announcementImage}
                        resizeMode="cover"
                    />
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    <Text style={styles.announcementBy}>By Club Admin</Text>

                    {/* Date/Time */}
                    {item.sentOn && (
                        <Text style={styles.announcementDate}>{formatSentOn(item.sentOn)}</Text>
                    )}
                </View>
            </View>
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
                                source={{ uri: selectedClub?.clubImage }}
                                resizeMode='cover'
                                style={styles.userDetailsSty} />
                            ) : (
                                <View style={styles.placeholderLogoHeader}>
                                    <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Unknown Club'}</Text>
                    </View>
                </View>
                <Text style={styles.headerTitle}>{Strings.Announcements.ANNOUNCEMENTS}</Text>
                <View style={styles.content}>
                    <FlatList
                        data={announcementsData}
                        renderItem={renderAnnouncementItem}
                        keyExtractor={keyExtractor}
                        style={styles.clubsList}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        removeClippedSubviews={false}
                        initialNumToRender={10}
                        ListEmptyComponent={renderEmptyComponent}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={onRefresh}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        windowSize={10}
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
        paddingVertical: theme.spacing.xs,
        paddingTop: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.xs,
    },
    headerTitle: {
        marginTop: moderateScale(20),
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(22),
        color: theme.colors.white,
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
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

    // New Announcement Card Styles
    announcementCard: {
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: moderateScale(12),
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    announcementMessage: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(15),
        color: theme.colors.text,
        lineHeight: moderateScale(22),
        marginBottom: theme.spacing.sm,
    },
    announcementImage: {
        width: '100%',
        height: moderateScale(200),
        borderRadius: moderateScale(8),
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.border,
    },
    announcementDate: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    announcementBy: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.black,
        marginTop: theme.spacing.xs,
    },
});
