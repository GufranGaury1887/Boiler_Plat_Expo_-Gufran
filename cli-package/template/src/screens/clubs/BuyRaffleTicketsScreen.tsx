import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@constants';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';
import SVG from '@assets/icons';
import { MainStackParamList } from '@navigation';
import { useVerifyReferralCode } from '@services/mainServices';
import { getApiErrorInfo } from '@services';
import { TextInput } from '@components/common';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

type BuyRaffleTicketsScreenProps = NativeStackScreenProps<MainStackParamList, 'BuyRaffleTickets'>;

interface TicketOption {
    id: number;
    raffleId: number;
    ticketCount: number;
    totalAmount: number;
    perTicketAmount: number;
}

export const BuyRaffleTicketsScreen: React.FC<BuyRaffleTicketsScreenProps> = ({ navigation, route }) => {

    const {
        selectedClub,
        selectedMember,
        raffleId,
        raffleTitle,
        ticketOptions,
    } = route.params;

    const [selectedTicket, setSelectedTicket] = useState<TicketOption | null>(null);
    const [referralCode, setReferralCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [referralError, setReferralError] = useState<string | null>(null);
    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

    const verifyReferralCodeMutation = useVerifyReferralCode();

    useEffect(() => {
        // Set first ticket as default selection
        if (ticketOptions && ticketOptions.length > 0) {
            setSelectedTicket(ticketOptions[0]);
        }
    }, []);

    const handleSelectTicket = (ticket: TicketOption) => {
        setSelectedTicket(ticket);
    };

    const handlePlaceOrder = async () => {
        Keyboard.dismiss();
        setReferralError(null);
        if (!selectedTicket) {
            Alert.alert('Select Tickets', 'Please select a ticket package first.');
            return;
        }

        Alert.alert(
            'Payment Integration Required',
            'Payment processing functionality needs to be implemented. Please integrate your preferred payment gateway.',
            [{ text: 'OK' }]
        );
        
        /* 
        // TODO: Implement payment processing logic here
        // Example implementation structure:
        
        setIsProcessing(true);

        try {
            // Verify referral code if present
            if (referralCode.trim()) {
                try {
                    const verifyResult = await verifyReferralCodeMutation.mutateAsync({
                        raffleId: raffleId,
                        clubId: selectedClub?.id || 0,
                        memberId: selectedMember?.id || 0,
                        referralCode: referralCode.trim()
                    });
                    console.log("verifyResult====?", verifyResult);

                } catch (error: any) {
                    const errorInfo = getApiErrorInfo(error);
                    console.error('[BuyRaffleTicketsScreen]', errorInfo);
                    setReferralError(errorInfo?.message || 'Invalid referral code');
                    setIsProcessing(false);
                    setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd(true);
                    }, 100);
                    return;
                }
            }

            // Process payment with your payment gateway
            // const paymentResult = await yourPaymentService.processPayment({
            //     amount: selectedTicket.totalAmount,
            //     ticketInfo: selectedTicket,
            //     referralCode: referralCode
            // });

            // if (paymentResult.success) {
            //     Alert.alert(
            //         'Purchase Successful',
            //         `You've purchased ${selectedTicket.ticketCount} raffle ticket${selectedTicket.ticketCount > 1 ? 's' : ''} for ${raffleTitle}!\n\nGood luck! 🍀`,
            //         [
            //             {
            //                 text: 'OK',
            //                 onPress: () => {
            //                     navigation.navigate('ClubDetails', {
            //                         selectedClub,
            //                         selectedMember
            //                     });
            //                 },
            //             },
            //         ]
            //     );
            // }
        } catch (error: any) {
            console.error('[BuyRaffleTicketsScreen] Payment error:', error);
            Alert.alert(
                'Payment Failed',
                error?.message || 'Unable to process payment. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsProcessing(false);
        }
        */
    };

    const renderTicketOption = ({ item }: { item: TicketOption }) => {
        const isSelected = selectedTicket?.id === item.id;

        return (
            <TouchableOpacity
                style={[styles.ticketOption, isSelected && styles.ticketOptionSelected]}
                onPress={() => handleSelectTicket(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.ticketInfo}>
                    <Text style={styles.ticketText}>
                        {item.ticketCount} ticket{item.ticketCount > 1 ? 's' : ''} for{' '}
                        <Text style={styles.ticketPrice}>{formatCurrency(item.totalAmount)}</Text>
                        {' '}
                        <Text style={styles.ticketPricePerUnit}>
                            ({formatCurrency(item.perTicketAmount)} ea)
                        </Text>
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>
                    {selectedTicket ? formatCurrency(selectedTicket.totalAmount) : '$0.00'}
                </Text>
            </View>

            <View style={styles.inputContainer}>
                {/* <TextInput
                    style={[styles.input, !!referralError && styles.inputError]}
                    placeholder="Enter referral code"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={referralCode}
                    onChangeText={(text) => {
                        setReferralCode(text);
                        if (referralError) setReferralError(null);
                    }}
                    autoCapitalize="characters"
                /> */}

                <TextInput
                    style={styles.input}
                    placeholder="Enter referral code"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={referralCode}
                    maxLength={10}
                    textAlign='center'
                    onChangeText={(text) => {
                        setReferralCode(text);
                        if (referralError) setReferralError(null);
                    }}
                    autoCapitalize="characters"
                />
                {!!referralError && (
                    <Text style={styles.errorText}>{referralError}</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.placeOrderButton, (!selectedTicket || isProcessing) && styles.placeOrderButtonDisabled]}
                onPress={handlePlaceOrder}
                disabled={!selectedTicket || isProcessing}
                activeOpacity={0.8}
            >
                {isProcessing ? (
                    <>
                        <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.placeOrderButtonText}>Processing...</Text>
                    </>
                ) : (
                    <Text style={styles.placeOrderButtonText}>Place Order</Text>
                )}
            </TouchableOpacity>

            <View style={styles.paymentMethodsContainer}>
                <Text style={styles.paymentMethodsText}>💳 Payment Gateway Not Configured</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android' ? true : false}
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
                    <KeyboardAwareScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        enableOnAndroid={true}
                        enableAutomaticScroll={true}
                        extraScrollHeight={moderateScale(100)}
                        keyboardOpeningTime={250}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <Text style={styles.questionTitle}>How Many Tickets?</Text>

                        <View style={styles.listContent}>
                            {ticketOptions.map((item) => (
                                <View key={item.id}>
                                    {renderTicketOption({ item })}
                                </View>
                            ))}

                            {/* {renderFooter()} */}
                            <View style={styles.footerContainer}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total Amount:</Text>
                                    <Text style={styles.totalAmount}>
                                        {selectedTicket ? formatCurrency(selectedTicket.totalAmount) : '$0.00'}
                                    </Text>
                                </View>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter referral code"
                                        placeholderTextColor={theme.colors.textSecondary}
                                        value={referralCode}
                                        maxLength={10}
                                        textAlign='center'
                                        onChangeText={(text) => {
                                            setReferralCode(text);
                                            if (referralError) setReferralError(null);
                                        }}
                                        autoCapitalize="characters"
                                    />
                                    {!!referralError && (
                                        <Text style={styles.errorText}>{referralError}</Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[styles.placeOrderButton, (!selectedTicket || isProcessing) && styles.placeOrderButtonDisabled]}
                                    onPress={handlePlaceOrder}
                                    disabled={!selectedTicket || isProcessing}
                                    activeOpacity={0.8}
                                >
                                    {isProcessing ? (
                                        <>
                                            <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                                            <Text style={styles.placeOrderButtonText}>Processing...</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.placeOrderButtonText}>Place Order</Text>
                                    )}
                                </TouchableOpacity>


                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>

            {/* Full-screen loader during payment processing */}
            {isProcessing && (
                <View style={styles.loaderOverlay}><ActivityIndicator size="large" color={theme.colors.blue} /></View>
            )}
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
        marginTop: theme.spacing.md,
    },
    scrollContent: {
        flexGrow: 1,
    },
    questionTitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.black,
        marginBottom: theme.spacing.md,
        letterSpacing: 0.5,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
    ticketOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: moderateScale(12),
        borderWidth: 2,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    ticketOptionSelected: {
        borderColor: theme.colors.blue,
        backgroundColor: theme.colors.lightLavenderGray,
    },
    radioButton: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    radioButtonSelected: {
        borderColor: theme.colors.blue,
    },
    radioButtonInner: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: moderateScale(6),
        backgroundColor: theme.colors.blue,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(15),
        color: theme.colors.text,
    },
    ticketPrice: {
        fontFamily: Fonts.outfitBold,
        color: theme.colors.text,
    },
    ticketPricePerUnit: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    footerContainer: {
        marginTop: theme.spacing.lg,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    totalLabel: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginRight: theme.spacing.sm,
    },
    totalAmount: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(20),
        color: theme.colors.appleGreen,
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.xxl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.text,
        textAlign: 'center',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: moderateScale(12),
        fontFamily: Fonts.outfitRegular,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    placeOrderButton: {
        backgroundColor: theme.colors.blue,
        borderRadius: moderateScale(25),
        paddingVertical: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
    },
    placeOrderButtonDisabled: {
        backgroundColor: theme.colors.textSecondary,
        opacity: 0.7,
    },
    placeOrderButtonText: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(16),
        color: theme.colors.white,
    },
    paymentMethodsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(12),
        paddingVertical: theme.spacing.sm,
    },
    paymentMethodsText: {
        fontSize: moderateScale(13),
        color: '#666',
        fontFamily: Fonts.outfitRegular,
    },
    loaderOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
});
