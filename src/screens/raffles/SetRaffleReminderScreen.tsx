import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, Image, FlatList } from 'react-native';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRaffleDetails, useSetRaffleReminder, useRaffleReminder, useDeleteRaffleReminder } from '@services/mainServices';
import { ReminderCardItem, SetReminderModal } from '@components/common';
import { SetRaffleReminderScreenProps } from '@navigation';
import ToastManager from '@components/common/ToastManager';
import { moderateScale } from '@utils/scaling';
import { getApiErrorInfo } from '@services';
import { Fonts } from '@constants/Fonts';
import { theme } from '@constants';
import SVG from '@assets/icons';




export const SetRaffleReminderScreen: React.FC<SetRaffleReminderScreenProps> = ({ navigation, route }) => {

    const { selectedClub, raffle: raffleDetails } = route?.params ?? {};
    const raffleId = raffleDetails?.raffleId;
    const clubId = selectedClub?.id;
    const memberId = selectedClub?.selectedMember?.id;
    const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

    const { data: raffleResponse, isLoading, error } = useRaffleDetails(raffleId);
    const { data: reminderResponse, isLoading: isReminderLoading, refetch: refetchReminder } = useRaffleReminder(raffleId, clubId, memberId);

    const setReminderMutation = useSetRaffleReminder();
    const deleteReminderMutation = useDeleteRaffleReminder();

    const raffleData = raffleResponse?.data?.data;
    const details = useMemo(() => raffleData ?? raffleDetails ?? {}, [raffleData, raffleDetails]);

    const reminderDataRaw = reminderResponse?.data?.data;
    const reminderData = reminderDataRaw?.raffleReminders ?? [];

    // Handle setting reminder
    const handleSetReminder = async (reminderDateTime: Date) => {
        if (!raffleId || !memberId || !clubId) {
            ToastManager.error('Missing Information', 'Unable to set reminder. Missing required information.');
            return;
        }

        try {
            // Format date using moment for API
            const formattedDateTime = moment(reminderDateTime).format("YYYY-MM-DDTHH:mm:ssZ");

            const response = await setReminderMutation.mutateAsync({
                reminderDateTime: formattedDateTime,
                raffleId: raffleId,
                memberId: memberId,
                clubId: clubId,
            });


            ToastManager.success(response.data?.message);

            // Close modal
            setIsReminderModalOpen(false);

            // Refetch the reminder data to update the UI
            refetchReminder();
        } catch (error: any) {
            console.error('Failed to set reminder:', error);
            const errorInfo = getApiErrorInfo(error);
            ToastManager.error(errorInfo?.message || 'Failed to set reminder. Please try again.');
        }
    };

    // Handle deleting reminder
    const handleDeleteReminder = async (reminderId: number | string | undefined) => {
        if (!raffleId) {
            ToastManager.error('Unable to delete reminder. Missing raffle ID.');
            return;
        }

        if (!reminderId) {
            ToastManager.error('Unable to delete reminder. Missing reminder ID.');
            console.error('reminderId is undefined or null:', reminderId);
            return;
        }

        try {
            const reminderIdNumber = typeof reminderId === 'string' ? parseInt(reminderId, 10) : reminderId;

            if (isNaN(reminderIdNumber)) {
                ToastManager.error('Invalid reminder ID format.');
                return;
            }

            await deleteReminderMutation.mutateAsync({
                raffleId: raffleId,
                reminderId: reminderIdNumber,
                clubId: clubId,
                memberId: memberId,
            });

            ToastManager.success('Reminder has been deleted successfully!');

            // Refetch the reminder data to update the UI
            refetchReminder();
        } catch (error: any) {
            console.error('Failed to delete reminder:', error);
            ToastManager.error(error?.message || 'Failed to delete reminder. Please try again.');
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
                        <Text style={styles.headerTitle}>{details?.raffleTitle ?? 'Raffle'}</Text>
                        {details?.locationAddress && (
                            <View style={styles.opMetaRow}>
                                <SVG.locationWhite width={moderateScale(18)} height={moderateScale(18)} />
                                <Text style={styles.opMetaText}>{details.locationAddress}</Text>
                            </View>
                        )}
                        {details?.drawDate && (
                            <View style={styles.opMetaRow}>
                                <SVG.CalendarWhite width={moderateScale(18)} height={moderateScale(18)} />
                                <Text style={styles.opMetaText}>{details.drawDate}</Text>
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
                            <Text style={styles.emptyText}>Loading raffle details...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.errorText}>Error loading raffle details.</Text>
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
                                console.log("ssss", item);

                                const reminderId = item?.reminderId;
                                return (
                                    <ReminderCardItem
                                        reminderData={item}
                                        onDelete={() => {
                                            if (reminderId) {
                                                handleDeleteReminder(reminderId);
                                            } else {
                                                console.warn('Cannot delete: reminderId is missing', item);
                                                ToastManager.error('Cannot delete reminder: ID is missing.');
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
                maxDate={reminderDataRaw?.raffleDrawDate}
                visible={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                onSave={(date) => {
                    setIsReminderModalOpen(false);
                    handleSetReminder(date);
                }}
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
    sectionTitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.blue,
        marginBottom: theme.spacing.sm,
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
