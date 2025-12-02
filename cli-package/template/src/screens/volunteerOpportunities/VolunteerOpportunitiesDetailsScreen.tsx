import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Animated,
    Modal,
    PanResponder,
    ActivityIndicator,
    FlatList,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VolunteerOpportunitiesDetailsScreenProps } from '../../types/navigation';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import {
    useVolunteerOpportunityDetails,
    useVolunteerOpportunityVolunteers,
    useJoinVolunteerOpportunity,
    useVolunteerSlots,
    useCancelVolunteerRequest,
    VolunteerOpportunitySlot,
} from '../../services/mainServices';
import { Button } from '../../components/common';
import ToastManager from '../../components/common/ToastManager';
import { useFocusEffect } from '@react-navigation/native';

// Helper: Extract nested arrays from various data structures
const getFirstPopulatedArray = (...candidates: unknown[]): any[] => {
    for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate;
        }

        if (candidate && typeof candidate === 'object') {
            const casted = candidate as Record<string, unknown>;
            const nestedSlots =
                casted.slots ??
                casted.lstSlots ??
                casted.data ??
                casted.items ??
                casted.list;

            if (Array.isArray(nestedSlots) && nestedSlots.length > 0) {
                return nestedSlots;
            }
        }
    }

    return [];
};

export const VolunteerOpportunitiesDetailsScreen: React.FC<
    VolunteerOpportunitiesDetailsScreenProps
> = ({ navigation, route }) => {
    const { selectedClub, item: itemDetails } = route?.params ?? {};

    // Extract identifiers
    const teamId = selectedClub?.id;
    const team = selectedClub;
    const opportunityId = itemDetails?.id;
    const opportunityType = itemDetails?.opportunityType;
    const clubId = selectedClub?.id;
    const memberId = selectedClub?.selectedMember?.id;

    // Mutations
    const joinOpportunityMutation = useJoinVolunteerOpportunity();
    const cancelVolunteerRequestMutation = useCancelVolunteerRequest();

    // State
    const [selectedSlot, setSelectedSlot] = useState<VolunteerOpportunitySlot | null>(null);
    const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Bottom sheet animation
    const screenHeight = Dimensions.get('window').height;
    const bottomSheetHeight = screenHeight * 0.45;
    const bottomSheetTranslateY = useRef(new Animated.Value(bottomSheetHeight)).current;




    // Queries
    const {
        data: volunteersResponse,
        isLoading: isVolunteersLoading,
        refetch: refetchVolunteers,
    } = useVolunteerOpportunityVolunteers(opportunityId, selectedSlot?.slotId);
    const {
        data: opportunityResponse,
        isLoading,
        error,
        refetch: refetchOpportunity,
    } = useVolunteerOpportunityDetails(opportunityId);
    const {
        data: slotsResponse,
        isLoading: isSlotsLoading,
        error: slotsError,
        refetch: refetchSlots,
    } = useVolunteerSlots(opportunityId, memberId);

    // Computed values
    const opportunityDetails = opportunityResponse?.data?.data;
    const details = useMemo(
        () => opportunityDetails ?? itemDetails ?? {},
        [opportunityDetails, itemDetails]
    );


    useFocusEffect(
        React.useCallback(() => {
            handleRefetchAllData();
        }, [])
    );


    // Process slots
    const slots = slotsResponse?.data?.data|| [];

    // Process volunteers
    const volunteersDetails = volunteersResponse?.data?.data || [];
  

    // Navigation helper
    const createNavigationData = () => ({
        selectedClub,
        selectedMember: selectedClub?.selectedMember,
        item: itemDetails,
    });

    // Handler: Join opportunity
    const handleJoinVolunteerOpportunity = async (volunteer: any) => {
        const slotId = Number(volunteer?.slotId ?? 0);
        const opType = Number(itemDetails?.opportunityType ?? 1);

        if (!opportunityId || Number.isNaN(opportunityId)) {
            ToastManager.error('Opportunity ID is missing');
            return;
        }

        try {
            const response = await joinOpportunityMutation.mutateAsync({
                opportunityId,
                slotId,
                opportunityType: opType,
                memberId,
            });

            ToastManager.success(
                response.data?.message || 'Successfully joined volunteer opportunity'
            );
            await handleRefreshAllData();
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to join opportunity';
            ToastManager.error(errorMessage);
        }
    };

    // Handler: Cancel request
    const handleCancelVolunteerRequest = async (volunteer: any) => {
        const slotId = Number(volunteer?.slotId ?? 0);

        if (!opportunityId || Number.isNaN(opportunityId)) {
            ToastManager.error('Opportunity ID is missing');
            return;
        }

        if (!memberId || Number.isNaN(memberId)) {
            ToastManager.error('Member ID is missing');
            return;
        }

        if (!slotId || Number.isNaN(slotId)) {
            ToastManager.error('Slot ID is missing');
            return;
        }

        try {
            const response = await cancelVolunteerRequestMutation.mutateAsync({
                opportunityId,
                memberId,
                slotId,
            });

            ToastManager.success(
                response.data?.message || 'Volunteer request cancelled successfully'
            );
            await refetchSlots();
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to cancel volunteer request';
            ToastManager.error(errorMessage);
            console.error('Cancel volunteer request error:', error);
        }
    };

    // Modal: Close sheet
    const closeSlotSelectionSheet = () => {
        Animated.timing(bottomSheetTranslateY, {
            toValue: bottomSheetHeight,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsSlotModalVisible(false);
            setSelectedSlot(null);
            bottomSheetTranslateY.setValue(bottomSheetHeight);
        });
    };

    // Modal: Open sheet
    const openSlotSelectionSheet = (volunteer: any) => {
        setSelectedSlot(volunteer ?? null);
        setIsSlotModalVisible(true);
        refetchVolunteers()
        bottomSheetTranslateY.setValue(bottomSheetHeight);
        Animated.timing(bottomSheetTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // PanResponder: Swipe gestures
    const slotSelectionPanResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
                Math.abs(gestureState.dy) > 5,
            onPanResponderGrant: () => {
                bottomSheetTranslateY.extractOffset();
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    bottomSheetTranslateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                bottomSheetTranslateY.flattenOffset();

                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    closeSlotSelectionSheet();
                } else {
                    Animated.spring(bottomSheetTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    // Render volunteer item
    const renderSlotItem = ({ item }: { item: any }) => (
        <View style={styles.volunteerItemContainer}>
            <View style={styles.volunteerAvatarSection}>
                {item?.profileImage ? (
                    <Image
                        source={{ uri: item?.profileImage }}
                        style={styles.volunteerModalAvatar}
                        resizeMode="cover"
                    />
                ) : (
                    <SVG.emptyUser style={{ marginBottom: theme.spacing.xs }} width={moderateScale(50)} height={moderateScale(50)} />
                )}
            </View>
            <Text style={styles.volunteerName}>{item?.memberName}</Text>
        </View>
    );

    // Refresh all data
    const handleRefreshAllData = async () => {
        setIsRefetching(true);
        try {
            await Promise.all([refetchSlots(), refetchOpportunity(), refetchVolunteers()]);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to refresh data';
            ToastManager.error('Refresh Error', message);
            console.error('Error refreshing all data:', error);
        } finally {
            setIsRefetching(false);
        }
    };

    const handleRefetchAllData = async () => {
        try {
            await Promise.all([refetchSlots(), refetchOpportunity(), refetchVolunteers()]);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to refresh data';
            ToastManager.error('Refresh Error', message);
            console.error('Error refreshing all data:', error);
        }

    };

    // Refresh slots only
    const handleRefreshSlots = async () => {
        setIsRefetching(true);
        try {
            await refetchSlots();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to refresh slots';
            ToastManager.error('Refresh Error', message);
            console.error('Error refreshing slots:', error);
        } finally {
            setIsRefetching(false);
        }
    };

    const descriptionText = opportunityDetails?.description || 'No description available for this opportunity yet.';
    const shouldShowReadMore = descriptionText.length > 200;

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android'}
            />
            {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.navRow}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <SVG.arrowLeft_white
                                width={moderateScale(25)}
                                height={moderateScale(25)}
                            />
                        </TouchableOpacity>
                        <View style={styles.clubInfoContainer}>
                            <View style={styles.userConSty}>
                                {selectedClub?.clubImage ? (
                                    <Image
                                        source={{ uri: selectedClub.clubImage }}
                                        style={styles.userDetailsSty}
                                        resizeMode="cover"
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
                            <Text style={styles.userNameSty}>
                                {details?.clubName ?? 'Unknown Team'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerMain}>
                        <Text style={styles.headerTitle}>
                            {details?.title ?? 'Volunteer Opportunity'}
                        </Text>
                        <View style={styles.opMetaRow}>
                            <SVG.locationWhite
                                width={moderateScale(18)}
                                height={moderateScale(18)}
                            />
                            <Text style={styles.opMetaText}>{details?.address}</Text>
                        </View>
                        {itemDetails?.scheduleDate && (
                            <View style={styles.opMetaRow}>
                                <SVG.CalendarWhite
                                    width={moderateScale(18)}
                                    height={moderateScale(18)}
                                />
                                <Text style={styles.opMetaText}>
                                    {itemDetails.scheduleDate}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.content}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.emptyText}>
                                Loading opportunity details...
                            </Text>
                        </View>
                    ) : error ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.errorText}>
                                Error loading opportunity details.
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefetching}
                                    onRefresh={handleRefreshAllData}
                                    tintColor={theme.colors.blue}
                                    progressBackgroundColor={theme.colors.background}
                                />
                            }
                        >
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>
                                    {isDescriptionExpanded ? descriptionText : descriptionText.slice(0, 200) + (shouldShowReadMore ? '...' : '')}
                                    {shouldShowReadMore && (
                                        <Text
                                            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                            style={{ color: theme.colors.blue, fontFamily: Fonts.outfitMedium }}
                                        >
                                            {isDescriptionExpanded ? ' Show Less' : ' Show More'}
                                        </Text>
                                    )}
                                </Text>
                            </View>

                            {details?.isExpired ? null : (


                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                                    <View style={styles.quickActionsRow}>
                                        <Button
                                            title="Manage Reminders"
                                            onPress={() => {
                                                navigation.navigate('SetReminder', createNavigationData());
                                            }}
                                            variant="outline"
                                            textStyle={styles.setReminderButtonText}
                                            size="small"
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.listTitle}>Volunteers</Text>
                                </View>
                                <View style={styles.volunteerList}>
                                    {isSlotsLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <Text style={styles.emptyStateText}>
                                                Loading slots...
                                            </Text>
                                            <ActivityIndicator
                                                size="small"
                                                color={theme.colors.primary}
                                            />
                                        </View>
                                    ) : slotsError ? (
                                        <View style={styles.loadingContainer}>
                                            <Text style={styles.errorText}>
                                                Failed to load slots. Please try again.
                                            </Text>
                                            <TouchableOpacity
                                                onPress={handleRefreshSlots}
                                                style={styles.retryButtonContainer}
                                            >
                                                <Text style={styles.retryButtonText}>Retry</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : slots.length > 0 ? (
                                        slots.map((volunteer: any) => (
                                            <View key={volunteer.id} style={styles.volunteerCard}>
                                                <View style={styles.slotHeaderRow}>
                                                    <Text style={styles.volunteerSlot}>
                                                        {volunteer?.slotStartTime} -{' '}
                                                        {volunteer?.slotEndTime}
                                                    </Text>
                                                    {volunteer?.applicationStatus === 1 ? (
                                                        <SVG.rightAppleGreen
                                                            style={styles.statusIconMargin}
                                                            width={moderateScale(25)}
                                                            height={moderateScale(25)}
                                                        />
                                                    ) : volunteer?.applicationStatus === 2 ? (
                                                        <SVG.PendingAppleGreen
                                                            style={styles.statusIconMargin}
                                                            width={moderateScale(20)}
                                                            height={moderateScale(20)}
                                                        />
                                                    ) : null}
                                                </View>
                                                <View style={styles.volunteerActionRow}>
                                                    {opportunityType === 1 ? (
                                                        <>
                                                            {volunteer?.applicationStatus === 3 ? (
                                                                <>
                                                                    {!volunteer?.isExpired && (
                                                                        <TouchableOpacity
                                                                            disabled={
                                                                                volunteer?.isExpired
                                                                            }
                                                                            onPress={() =>
                                                                                handleJoinVolunteerOpportunity(volunteer)
                                                                            }
                                                                            style={styles.joinButton}
                                                                        >
                                                                            <Text style={styles.joinButtonText}>
                                                                                Join
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        navigation.navigate('ChatScreen', {
                                                                            itemDetails: volunteer,
                                                                            memberId,
                                                                            teamId: volunteer?.opportunityId, //this is opportunityId
                                                                            team,
                                                                            userType: 'volunteer',
                                                                        });
                                                                    }}
                                                                >
                                                                    {volunteer?.unreadMessageCount > 0 ? (
                                                                        <SVG.UNREAD_CHAT_BLUE_BG width={30} height={30} />
                                                                    ) : (
                                                                        <SVG.chatBlueBG width={30} height={30} />
                                                                    )}
                                                                </TouchableOpacity>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {volunteer?.applicationStatus === 3 ? (
                                                                <>
                                                                    {!volunteer?.isExpired && (
                                                                        <TouchableOpacity
                                                                            disabled={
                                                                                volunteer?.isExpired
                                                                            }
                                                                            onPress={() =>
                                                                                handleJoinVolunteerOpportunity(volunteer)
                                                                            }
                                                                            style={styles.joinButton}
                                                                        >
                                                                            <Text style={styles.joinButtonText}>
                                                                                Join
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </>
                                                            ) : volunteer?.applicationStatus === 2 ? (
                                                                <>
                                                                    {volunteer?.isExpired ? null : (
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                handleCancelVolunteerRequest(volunteer)
                                                                            }
                                                                            disabled={
                                                                                volunteer?.isExpired
                                                                            }
                                                                            style={[
                                                                                styles.cancelButton,
                                                                                cancelVolunteerRequestMutation.isPending &&
                                                                                styles.cancelButtonDisabled,
                                                                            ]}
                                                                        >
                                                                            <Text
                                                                                style={[
                                                                                    styles.cancelButtonText,
                                                                                    cancelVolunteerRequestMutation.isPending &&
                                                                                    styles.cancelButtonTextDisabled,
                                                                                ]}
                                                                            >
                                                                                {cancelVolunteerRequestMutation.isPending
                                                                                    ? 'Canceling...'
                                                                                    : 'Cancel'}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <TouchableOpacity
                                                                    onPress={() => {
                                                                        navigation.navigate('ChatScreen', {
                                                                            itemDetails: volunteer,
                                                                            memberId,
                                                                            teamId: volunteer?.opportunityId, //this is opportunityId
                                                                            team,
                                                                            userType: 'volunteer',
                                                                        });
                                                                    }}
                                                                >
                                                                    {volunteer?.unreadMessageCount > 0 ? (
                                                                        <SVG.UNREAD_CHAT_BLUE_BG width={30} height={30} />
                                                                    ) : (
                                                                        <SVG.chatBlueBG width={30} height={30} />
                                                                    )}
                                                                </TouchableOpacity>
                                                            )}
                                                        </>
                                                    )}
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            openSlotSelectionSheet(volunteer)
                                                        }
                                                    >
                                                        <SVG.volunteerMember
                                                            style={styles.volunteerMemberIconMargin}
                                                            width={moderateScale(30)}
                                                            height={moderateScale(30)}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyStateText}>
                                                No slots available for this opportunity yet.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Volunteer Members Modal */}
                <Modal
                    visible={isSlotModalVisible}
                    animationType="fade"
                    transparent
                    onRequestClose={closeSlotSelectionSheet}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            activeOpacity={1}
                            onPress={closeSlotSelectionSheet}
                        />
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [{ translateY: bottomSheetTranslateY }],
                                },
                            ]}
                        >
                            <View
                                style={styles.dragHandle}
                                {...slotSelectionPanResponder.panHandlers}
                            />
                            {isVolunteersLoading ? (
                                <View style={styles.slotLoadingContainer}>
                                    <ActivityIndicator
                                        size="small"
                                        color={theme.colors.primary}
                                    />
                                </View>
                            ) : (
                                <FlatList
                                    data={volunteersDetails}
                                    renderItem={renderSlotItem}
                                    style={styles.membersList}
                                    showsVerticalScrollIndicator={false}
                                    ListHeaderComponent={() => (
                                        <View style={styles.headerContainer}>
                                            <Text style={styles.mamberHeaderTitle}>
                                                Joined Volunteers
                                            </Text>
                                            <View style={styles.slotTimeRow}>
                                                <SVG.Clock_Blue
                                                    width={moderateScale(28)}
                                                    height={moderateScale(28)}
                                                />
                                                <Text style={styles.slotTimeHeaderText}>
                                                    {selectedSlot?.slotStartTime} -{' '}
                                                    {selectedSlot?.slotEndTime}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={() => (
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>
                                                No volunteers available
                                            </Text>
                                        </View>
                                    )}
                                    keyExtractor={(item) => `volunteer-${item.id}`}
                                />
                            )}
                        </Animated.View>
                    </View>
                </Modal>
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
        height: Platform.OS === 'ios' ? 44 : 0,
        backgroundColor: theme.colors.blue,
        zIndex: 1000,
    },
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.blue,
    },
    header: {
        paddingBottom: theme.spacing.lg,
        backgroundColor: theme.colors.blue,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    clubInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    placeholderLogoHeader: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    userDetailsSty: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        resizeMode: 'cover',
    },
    userNameSty: {
        color: theme.colors.white,
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(15),
    },
    headerMain: {
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.sm,
    },
    headerTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(24),
        color: theme.colors.white,
        marginBottom: theme.spacing.sm,
    },
    opMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    opMetaText: {
        marginLeft: theme.spacing.xs,
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: moderateScale(28),
        borderTopRightRadius: moderateScale(28),
        paddingTop: theme.spacing.lg,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.black,
    },
    listTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.blue,
    },
    descriptionText: {
        marginTop: theme.spacing.xs,
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.paraText,
        lineHeight: moderateScale(22),
    },
    quickActionsRow: {
        marginTop: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    setReminderButtonText: {
        color: theme.colors.appleGreen,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    volunteerList: {},
    volunteerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: moderateScale(18),
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.lightLavenderGray,
    },
    slotHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    volunteerSlot: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.black,
    },
    statusIconMargin: {
        marginLeft: theme.spacing.xs,
    },
    volunteerActionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    joinButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.appleGreen,
        borderRadius: theme.borderRadius.xxl,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    joinButtonText: {
        color: theme.colors.appleGreen,
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xs,
    },
    cancelButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.red,
        borderRadius: theme.borderRadius.xxl,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    cancelButtonDisabled: {
        borderColor: theme.colors.DarkGray,
        opacity: 0.6,
    },
    cancelButtonText: {
        color: theme.colors.red,
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xs,
    },
    cancelButtonTextDisabled: {
        color: theme.colors.DarkGray,
    },
    volunteerMemberIconMargin: {
        marginLeft: theme.spacing.xs,
        marginTop: moderateScale(2),
    },
    retryButtonContainer: {
        marginTop: theme.spacing.sm,
    },
    retryButtonText: {
        color: theme.colors.blue,
        textDecorationLine: 'underline',
    },
    emptyState: {
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.DarkGray,
        marginBottom: theme.spacing.sm,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    emptyText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.DarkGray,
        textAlign: 'center',
    },
    errorText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.cancelButton,
        marginTop: theme.spacing.md,
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
    slotLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
    },
    membersList: {
        flex: 1,
    },
    headerContainer: {
        paddingVertical: theme.spacing.xs,
        borderBottomColor: theme.colors.lightLavenderGray,
        marginBottom: theme.spacing.sm,
    },
    mamberHeaderTitle: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    slotTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    slotTimeHeaderText: {
        color: theme.colors.black,
        marginLeft: theme.spacing.sm,
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
    },
    volunteerItemContainer: {
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.xs,
        paddingTop: theme.spacing.sm,
    },
    volunteerAvatarSection: {
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    volunteerModalAvatar: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        marginBottom: theme.spacing.xs,
    },
    volunteerName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        flex: 1,
    },
    emptyContainer: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
});
