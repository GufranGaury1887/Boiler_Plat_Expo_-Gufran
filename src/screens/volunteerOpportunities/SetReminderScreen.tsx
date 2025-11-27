import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, Image, FlatList } from 'react-native';
import { SetReminderScreenProps } from '../../types/navigation';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVolunteerOpportunityDetails, useSetVolunteerReminder, useVolunteerReminder, useDeleteVolunteerReminder } from '../../services/mainServices';
import { ReminderCardItem, SetReminderModal } from '../../components/common';
import ToastManager from '../../components/common/ToastManager';
import { getApiErrorInfo } from '../../services';
import moment from 'moment';




export const SetReminderScreen: React.FC<SetReminderScreenProps> = ({ navigation, route }) => {
    const { selectedClub, item: itemDeteils } = route?.params ?? {};
    const opportunityId = itemDeteils?.id;
    const clubId = selectedClub?.id;
    const memberId = selectedClub?.selectedMember?.id;
    const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

    const { data: opportunityResponse, isLoading, error } = useVolunteerOpportunityDetails(opportunityId);
    const { data: reminderResponse, isLoading: isReminderLoading, refetch: refetchReminder } = useVolunteerReminder(opportunityId, clubId, memberId);

    const setReminderMutation = useSetVolunteerReminder();
    const deleteReminderMutation = useDeleteVolunteerReminder();

    const opportunityDetails = opportunityResponse?.data?.data
    const details = useMemo(() => opportunityDetails?.data?.data ?? itemDeteils ?? {}, [opportunityDetails?.data?.data, itemDeteils]);

    const reminderDataRaw = reminderResponse?.data?.data;
    const reminderData = reminderDataRaw?.opportunityReminders ?? [];


    // Handle setting reminder
    const handleSetReminder = async (reminderDateTime: Date) => {
        if (!opportunityId || !memberId || !clubId) {
            ToastManager.error('Missing Information', 'Unable to set reminder. Missing required information.');
            return;
        }

        try {
            // Format date using moment for API
            const formattedDateTime = moment(reminderDateTime).format("YYYY-MM-DDTHH:mm:ssZ");

            const response = await setReminderMutation.mutateAsync({
                reminderDateTime: formattedDateTime,
                opportunityId: opportunityId,
                memberId: memberId,
                clubId: clubId,
            });


            ToastManager.success('Success', response.data?.message);

            // Close modal
            setIsReminderModalOpen(false);

            // Refetch the reminder data to update the UI
            refetchReminder();
        } catch (error: any) {
            console.error('Failed to set reminder:', error);
            const errorInfo = getApiErrorInfo(error);
            ToastManager.error(errorInfo?.message);
            ToastManager.error('Error', errorInfo?.message || 'Failed to set reminder. Please try again.');
        }
    };

    // Handle deleting reminder
    const handleDeleteReminder = async (reminderId: number | string | undefined) => {
        if (!opportunityId) {
            ToastManager.error('Error', 'Unable to delete reminder. Missing opportunity ID.');
            return;
        }

        if (!reminderId) {
            ToastManager.error('Error', 'Unable to delete reminder. Missing reminder ID.');
            console.error('reminderId is undefined or null:', reminderId);
            return;
        }

        try {
            const reminderIdNumber = typeof reminderId === 'string' ? parseInt(reminderId, 10) : reminderId;

            if (isNaN(reminderIdNumber)) {
                ToastManager.error('Error', 'Invalid reminder ID format.');
                return;
            }

            await deleteReminderMutation.mutateAsync({
                opportunityId: opportunityId,
                reminderId: reminderIdNumber,
                clubId: clubId,
                memberId: memberId,
            });

            ToastManager.success('Success', 'Reminder has been deleted successfully!');

            // Refetch the reminder data to update the UI
            refetchReminder();
        } catch (error: any) {
            console.error('Failed to delete reminder:', error);
            ToastManager.error('Error', error?.message || 'Failed to delete reminder. Please try again.');
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
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View style={styles.navRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
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
                                        <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.userNameSty}>{selectedClub?.clubName ?? 'Unknown Club'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerMain}>
                        <Text style={styles.headerTitle}>{details?.title ?? 'Volunteer Opportunity'}</Text>
                        <View style={styles.opMetaRow}>
                            <SVG.locationWhite width={moderateScale(18)} height={moderateScale(18)} />
                            <Text style={styles.opMetaText}>{details?.address}</Text>
                        </View>
                        {itemDeteils?.scheduleDate && (
                            <View style={styles.opMetaRow}>
                                <SVG.CalendarWhite width={moderateScale(18)} height={moderateScale(18)} />
                                <Text style={styles.opMetaText}>{itemDeteils.scheduleDate}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>
                        MY REMINDERS
                    </Text>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.emptyText}>Loading opportunity details...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.errorText}>Error loading opportunity details.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={reminderData}
                            style={styles.reminderList}
                            keyExtractor={(item) => item?.reminderId?.toString() || item?.reminderDateTime.toString()}
                            ListFooterComponent={<></>}
                            ListFooterComponentStyle={styles.reminderListFooter}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const reminderId = item?.reminderId;
                                return (
                                    <ReminderCardItem
                                        reminderData={item}
                                        onDelete={() => {
                                            if (reminderId) {
                                                handleDeleteReminder(reminderId);
                                            } else {
                                                console.warn('Cannot delete: reminderId is missing', item);
                                                ToastManager.error('Error', 'Cannot delete reminder: ID is missing.');
                                            }
                                        }}
                                    />
                                );
                            }}
                            ListEmptyComponent={() => {
                                return (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyStateText}>
                                            No reminders set yet
                                        </Text>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Add Reminder Button */}
                <TouchableOpacity
                    style={styles.addReminderButton}
                    onPress={() => setIsReminderModalOpen(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.addReminderButtonText}>+</Text>
                </TouchableOpacity>
            </SafeAreaView>

            {/* Set Reminder Modal */}
            <SetReminderModal
                maxDate={reminderDataRaw?.scheduledDate}
                visible={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                onSave={handleSetReminder}
                onSuccessClose={true}
            />
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
    reminderListFooter: {
        marginBottom: moderateScale(50),
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
    headerSubtitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: theme.spacing.xs,
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
        paddingTop: moderateScale(10),
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg
    },
    reminderList: {
        flex: 1,
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
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.blue,
        marginBottom: theme.spacing.sm,
    },
    listTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.blue,
    },
    sectionSubtitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.DarkGray,
    },
    descriptionText: {
        marginTop: theme.spacing.xs,
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.paraText,
        lineHeight: moderateScale(22),
    },
    timeSlotsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
    },
    timeSlotChip: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.xxl,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    timeSlotChipActive: {
        backgroundColor: theme.colors.blue,
        borderColor: theme.colors.blue,
    },
    timeSlotChipText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.DarkGray,
    },
    timeSlotChipTextActive: {
        color: theme.colors.white,
    },
    quickActionsRow: {
        marginTop: theme.spacing.sm,
        gap: theme.spacing.md
    },
    primaryActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.blue,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.xxl,
        marginRight: theme.spacing.sm,
    },
    primaryActionText: {
        marginLeft: theme.spacing.sm,
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.white,
    },
    reminderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: theme.colors.appleGreen,
        borderRadius: theme.borderRadius.xxl,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    reminderText: {
        marginLeft: theme.spacing.sm,
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.appleGreen,
    },
    reminderIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reminderTrack: {
        width: moderateScale(28),
        height: moderateScale(4),
        backgroundColor: theme.colors.appleGreen,
        borderRadius: moderateScale(2),
        marginRight: theme.spacing.xs,
    },
    reminderKnob: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(6),
        backgroundColor: theme.colors.appleGreen,
    },
    volunteerFilterScroll: {
        paddingVertical: theme.spacing.xs,
        paddingRight: theme.spacing.lg,
    },
    volunteerFilterChip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.xxl,
        backgroundColor: theme.colors.lightLavenderGray,
    },
    volunteerFilterChipActive: {
        backgroundColor: theme.colors.blue,
    },
    volunteerFilterText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.DarkGray,
    },
    volunteerFilterTextActive: {
        color: theme.colors.white,
    },
    volunteerList: {
    },
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
    volunteerInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'

    },
    volunteerSlot: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.black,
    },
    volunteerSlotText: {
        marginTop: theme.spacing.xs,
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.DarkGray,
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

    setReminderButtonText: {
        color: theme.colors.appleGreen,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    chatButtonText: {
        color: theme.colors.white,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    saveButton: {
        // marginTop: theme.spacing.md,
        width: '100%',
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
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.appleGreen,
        marginTop: theme.spacing.sm,
    },
    reminderIconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: theme.colors.appleGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    reminderContent: {
        flex: 1,
    },
    reminderLabel: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.DarkGray,
        marginBottom: theme.spacing.xs,
    },
    reminderDateTime: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.black,
    },
    addReminderButton: {
        position: 'absolute',
        bottom: moderateScale(50),
        right: moderateScale(25),
        width: moderateScale(56),
        height: moderateScale(56),
        borderRadius: moderateScale(28),
        backgroundColor: theme.colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.black,
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    addReminderButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(32),
        color: theme.colors.white,
        marginBottom: moderateScale(2),
    },
});
