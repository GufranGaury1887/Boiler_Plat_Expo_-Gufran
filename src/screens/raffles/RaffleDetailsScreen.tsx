import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Modal,
    useWindowDimensions,
    Alert,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@navigation';
import { useRaffleDetails } from '../../services/mainServices';
import { Button } from '../../components/common';
import { useFocusEffect } from '@react-navigation/native';

type RaffleDetailsScreenProps = NativeStackScreenProps<MainStackParamList, 'RaffleDetails'>;

export const RaffleDetailsScreen: React.FC<RaffleDetailsScreenProps> = ({ navigation, route }) => {
    const { selectedClub, selectedMember, raffleId } = route.params;

    // Fetch raffle details from API
    const { data: raffleResponse, isLoading, isError, error, refetch } = useRaffleDetails(raffleId);

    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [])
    );


    // Get direct API data
    const raffleData = raffleResponse?.data?.data;

    // Modal state for description
    const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);

    // Get window dimensions for HTML rendering
    const { width } = useWindowDimensions();

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.blue} />
                <ActivityIndicator size="large" color={theme.colors.blue} />
            </View>
        );
    }

    // Error state
    if (isError) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg }]}>
                <StatusBar barStyle="light-content" backgroundColor={theme.colors.blue} />
                <Text style={styles.title}>Failed to load raffle details</Text>
                <TouchableOpacity
                    style={[styles.buyButton, { marginTop: theme.spacing.md }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buyButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Helper to format amount
    const formatAmount = (amount: number) => {
        return amount > 0 ? `$${amount.toLocaleString()}` : '$0';
    };

    // Helper to get ordinal suffix
    const getOrdinalSuffix = (rank: number) => {
        const lastDigit = rank % 10;
        const lastTwoDigits = rank % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return 'th';
        }

        switch (lastDigit) {
            case 1:
                return ' st';
            case 2:
                return ' nd';
            case 3:
                return ' rd';
            default:
                return ' th';
        }
    };


    const handleOpenMap = (lat: number | undefined, lng: number | undefined, label: string) => {
        if (lat && lng && lat !== 0 && lng !== 0) {
            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
            const latLng = `${lat},${lng}`;
            const url = Platform.select({
                ios: `${scheme}${label}@${latLng}`,
                android: `${scheme}${latLng}(${label})`
            });
            if (url) {
                Linking.openURL(url);
            }
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android'}
            />
            {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}

            <SafeAreaView style={styles.header}>
                <View style={{ flexDirection: 'row', paddingHorizontal: theme.spacing.lg }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.userConSty}>
                            {!!selectedClub?.clubImage ? (
                                <Image
                                    source={{ uri: selectedClub?.clubImage }}
                                    resizeMode='cover'
                                    style={styles.userDetailsSty}
                                />
                            ) : (
                                <View style={styles.placeholderLogoHeader}>
                                    <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Club'}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Banner Image */}
                        {raffleData.bannerImageUrl && (
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: raffleData.bannerImageUrl }}
                                    style={styles.raffleImage}
                                />
                            </View>
                        )}

                        <View style={styles.mainContent}>
                            {/* Title */}
                            <Text numberOfLines={2} style={styles.title}>{raffleData.raffleTitle}</Text>

                            {/* Purchase End Date */}
                            <Text style={styles.dateRange}>End Date: {raffleData.purchaseEndDate}</Text>

                            {/* Buy Tickets Button */}
                            <Button
                                title="Buy"
                                navigation.navigate('BuyRaffleTickets', {
                                    selectedClub,
                                    selectedMember,
                                    raffleId: raffleData.raffleId,
                                    raffleTitle: raffleData.raffleTitle,
                                    ticketOptions: raffleData.ticketOptions || [],
                                })
                                variant='primary'
                                size='small'
                                style={{ marginBottom: moderateScale(16) }}
                                textStyle={{ fontFamily: Fonts.outfitBold, fontSize: moderateScale(16), color: theme.colors.white }}
                            />

                            {/* Prize Pool */}
                            <View style={{ backgroundColor: theme.colors.lightLavenderGray, alignItems: 'center', paddingVertical: moderateScale(20), paddingHorizontal: moderateScale(10), borderRadius: moderateScale(10), marginBottom: moderateScale(20) }}>

                                <View style={styles.prizePoolContainer}>
                                    <Text style={styles.prizePoolLabel}>Prize Pool: <Text style={styles.prizeAmount}>${raffleData.totalPricePoolAmount}</Text></Text>

                                </View>

                                {/* Draw Date */}
                                <View style={styles.drawDateContainer}>
                                    <Text style={styles.drawDate}>
                                        Draw Date: {raffleData?.drawDate}{raffleData?.drawTime && ` ${raffleData?.drawTime}`}
                                    </Text>
                                </View>
                            </View>

                            {/* View Description Button - Opens modal with HTML description */}
                            {raffleData.description && (
                                <Button
                                    title="View Details"
                                    onPress={() => setIsDescriptionModalVisible(true)}
                                    variant='outline'
                                    size='small'
                                    style={{ marginBottom: moderateScale(16), borderColor: theme.colors.blue, borderWidth: 1 }}
                                    textStyle={{ fontFamily: Fonts.outfitBold, fontSize: moderateScale(16), color: theme.colors.blue }}
                                />
                            )}

                            {/* Terms & Conditions */}
                            {raffleData?.termsAndConditionFileUrl && (
                                <TouchableOpacity
                                    style={styles.termsButton}
                                    onPress={async () => {
                                        try {
                                            const url = raffleData.termsAndConditionFileUrl;
                                            const supported = await Linking.canOpenURL(url);

                                            if (supported) {
                                                await Linking.openURL(url);
                                            } else {
                                                Alert.alert(
                                                    'Error',
                                                    'Unable to open the document URL.',
                                                    [{ text: 'OK' }]
                                                );
                                            }
                                        } catch (error) {
                                            console.error('Error opening document:', error);
                                            Alert.alert(
                                                'Error',
                                                'Unable to open the document. Please try again later.',
                                                [{ text: 'OK' }]
                                            );
                                        }
                                    }}
                                >
                                    <SVG.PDFAppleGreen width={moderateScale(20)} height={moderateScale(20)} />
                                    <Text style={styles.termsButtonText}>Terms & Conditions</Text>
                                    <SVG.DownloadBlue width={moderateScale(20)} height={moderateScale(20)} />
                                </TouchableOpacity>
                            )}

                            {/* The Draw Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>The Draw</Text>

                                <View style={styles.infoRow}>
                                <View style={styles.infoRowIconBG}>
                                    <SVG.CalendarBlue width={moderateScale(25)} height={moderateScale(25)} />
                                </View>
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Date</Text>
                                        <Text style={styles.infoValue}>{raffleData.drawDate}</Text>
                                    </View>
                                </View>

                                {raffleData.drawTime && (
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoRowIconBG}>
                                            <SVG.Clock_Blue width={moderateScale(25)} height={moderateScale(25)} />
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Time</Text>
                                            <Text style={styles.infoValue}>{raffleData.drawTime}</Text>
                                        </View>
                                    </View>
                                )}

                                {raffleData.locationAddress && (
                                    <TouchableOpacity style={styles.infoRow}
                                        onPress={() => handleOpenMap(raffleData.latitude, raffleData.longitude, raffleData.locationAddress)}
                                    >
                                         <View style={styles.infoRowIconBG}>
                                        <SVG.locationBlue width={moderateScale(25)} height={moderateScale(25)} />
                                         </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>Location</Text>
                                            <Text style={styles.infoValue}>{raffleData.locationAddress}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Set Reminders */}
                            <Button
                                title="Manage Reminders"
                                onPress={() => {
                                    navigation.navigate('SetRaffleReminder', {
                                        selectedClub,
                                        selectedMember,
                                        raffle: raffleData,
                                    });
                                }}
                                variant='outline'
                                size='small'
                                style={{ marginBottom: moderateScale(20), borderColor: theme.colors.blue, borderWidth: 1 }}
                                textStyle={{ fontFamily: Fonts.outfitBold, fontSize: moderateScale(16), color: theme.colors.blue }}
                            />

                            {/* Prizes Section */}
                            {raffleData.pricePools && raffleData.pricePools.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>The Prize</Text>
                                    <View style={styles.prizesContainer}>
                                        {raffleData?.pricePools.map((prize, index) => (
                                            <View key={prize.id} style={styles.prizeCard}>
                                                <View style={{
                                                    marginRight: moderateScale(12),
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: moderateScale(55),
                                                    height: moderateScale(55),
                                                    borderRadius: moderateScale(28.5),
                                                    backgroundColor: theme.colors.white,
                                                    borderWidth: 1.5,
                                                    borderColor: theme.colors.lightLavenderGray,
                                                }}>
                                                    <Text style={styles.prizePosition}>{prize?.prizeRank}{getOrdinalSuffix(prize?.prizeRank)}</Text>
                                                    <Text style={styles.prizeText}>PRIZE</Text>
                                                </View>

                                                <View style={{ flex: 1, backgroundColor: theme.colors.lightLavenderGray, borderRadius: moderateScale(8), }}>

                                                    {prize?.bannerImageUrl && (
                                                        <Image
                                                            source={{ uri: prize?.bannerImageUrl }}
                                                            style={styles.prizeImage}
                                                        />
                                                    )}
                                                    <View style={{ padding: moderateScale(8) }}>
                                                        <Text numberOfLines={5} style={styles.prizeTitle}>{prize?.title} (${prize?.prizeAmount})</Text>
                                                        <Text style={styles.prizeAmountText}>{prize?.description}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>

            {/* Description Modal */}
            <Modal
                visible={isDescriptionModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsDescriptionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setIsDescriptionModalVisible(false)}
                    />
                    <View style={styles.modalContainer}>
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Raffle Description</Text>
                            <TouchableOpacity
                                onPress={() => setIsDescriptionModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* HTML Content with ScrollView */}
                        <ScrollView
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {raffleData?.description ? (
                                <RenderHtml
                                    contentWidth={width - moderateScale(80)}
                                    source={{ html: raffleData.description }}
                                    tagsStyles={{
                                        body: {
                                            fontFamily: Fonts.outfitRegular,
                                            fontSize: moderateScale(14),
                                            color: theme.colors.text,
                                            lineHeight: moderateScale(22),
                                        },
                                        p: {
                                            marginBottom: moderateScale(12),
                                        },
                                        h1: {
                                            fontFamily: Fonts.outfitBold,
                                            fontSize: moderateScale(20),
                                            color: theme.colors.text,
                                            marginBottom: moderateScale(12),
                                        },
                                        h2: {
                                            fontFamily: Fonts.outfitBold,
                                            fontSize: moderateScale(18),
                                            color: theme.colors.text,
                                            marginBottom: moderateScale(10),
                                        },
                                        h3: {
                                            fontFamily: Fonts.outfitSemiBold,
                                            fontSize: moderateScale(16),
                                            color: theme.colors.text,
                                            marginBottom: moderateScale(8),
                                        },
                                        strong: {
                                            fontFamily: Fonts.outfitBold,
                                        },
                                        em: {
                                            fontFamily: Fonts.outfitRegular,
                                            fontStyle: 'italic',
                                        },
                                        u: {
                                            textDecorationLine: 'underline',
                                            textDecorationStyle: 'solid',
                                        },
                                        s: {
                                            textDecorationLine: 'line-through',
                                            textDecorationStyle: 'solid',
                                        },
                                        ul: {
                                            marginBottom: moderateScale(12),
                                        },
                                        ol: {
                                            marginBottom: moderateScale(12),
                                        },
                                        li: {
                                            marginBottom: moderateScale(6),
                                        },
                                    }}
                                />
                            ) : (
                                <Text style={styles.noDescriptionText}>No description available</Text>
                            )}
                        </ScrollView>
                    </View>
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
        paddingVertical: theme.spacing.xs,
        paddingTop: Platform.OS === 'android' ? theme.spacing.lg : theme.spacing.xs,
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
    userNameSty: {
        marginTop: moderateScale(5),
        color: theme.colors.white,
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(15),
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
    content: {
        flex: 1,
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
    },
    scrollContent: {
        paddingBottom: theme.spacing.xl,
    },
    imageContainer: {
        width: '100%',
        height: moderateScale(200),
    },
    raffleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: moderateScale(18),
    },
    mainContent: {
        paddingTop: theme.spacing.md,
    },
    title: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
        marginBottom: moderateScale(8),
    },
    dateRange: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(13),
        color: theme.colors.text,
        marginBottom: moderateScale(16),
    },
    buyButton: {
        backgroundColor: theme.colors.blue,
        borderRadius: moderateScale(25),
        paddingVertical: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%',
        marginBottom: moderateScale(16),
    },
    buyButtonDisabled: {
        backgroundColor: theme.colors.textSecondary,
        opacity: 0.7,
    },
    buyButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.white,
    },
    prizePoolContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: moderateScale(4),
    },
    prizePoolLabel: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(16),
        color: theme.colors.appleGreen,
    },
    prizeAmount: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.appleGreen,
    },
    drawDateContainer: {
        alignItems: 'center',
    },
    drawDate: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
    },
    section: {
        marginBottom: moderateScale(20),
    },
    sectionTitle: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginBottom: moderateScale(8),
    },
    description: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(13),
        color: theme.colors.text,
        lineHeight: moderateScale(20),
        marginBottom: moderateScale(12),
    },
    detailsButton: {
        backgroundColor: theme.colors.white,
        borderWidth: 1.5,
        borderColor: theme.colors.blue,
        borderRadius: moderateScale(25),
        paddingVertical: moderateScale(14),
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    detailsButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    termsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    termsButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
        flex: 1,
        marginLeft: theme.spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingVertical: moderateScale(14),
        marginBottom: moderateScale(10),
        borderBottomWidth: 1.5,
        borderColor: theme.colors.lightLavenderGray,
    },
    infoRowIconBG: {
        backgroundColor: theme.colors.lightLavenderGray,
        padding: moderateScale(12),
        borderRadius: theme.borderRadius.xxl
    },
    infoTextContainer: {
        marginLeft: moderateScale(16),
        flex: 1,
    },
    infoLabel: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(13),
        color: theme.colors.text,
        marginBottom: moderateScale(2),
    },
    infoValue: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(13),
        color: theme.colors.text,
    },
    reminderButton: {
        backgroundColor: theme.colors.white,
        borderRadius: moderateScale(25),
        paddingVertical: moderateScale(14),
        alignItems: 'center',
        marginBottom: moderateScale(20),
        borderWidth: 1.5,
        borderColor: theme.colors.blue,
    },
    reminderButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    prizesContainer: {
        gap: moderateScale(12),
    },
    prizeCard: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: moderateScale(12),
    },
    prizePosition: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    prizeText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(10),
        color: theme.colors.paraText,
    },
    prizeImage: {
        width: '100%',
        height: moderateScale(120),
        borderRadius: moderateScale(8),
    },
    prizeTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    prizeAmountText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(13),
        color: theme.colors.black,
    },
    // Modal Styles (matching JoinClub pattern)
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
        height: '75%',
        maxHeight: '75%',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    modalTitle: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
    },
    closeButton: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: moderateScale(20),
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    modalScrollView: {
        flex: 1,
    },
    noDescriptionText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.xl,
    },
});
