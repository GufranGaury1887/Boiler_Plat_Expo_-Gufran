import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import SVG from '../../assets/icons';
import { Fonts } from '../../constants/Fonts';
import { theme } from '../../constants/theme';
import { moderateScale } from '../../utils/scaling';
import { Button } from '../../components/common';
import { SuccessScreenProps } from '../../types/navigation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SuccessModalProps {
    visible: boolean;
    userName?: string;
    onClose: () => void;
    onGoToHome?: () => void;
    onSkipToAddMember?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    userName = 'Peter',
    onClose,
    onGoToHome,
    onSkipToAddMember,
}) => {
    const handleSkipToAddMember = () => {
        onClose();
        onSkipToAddMember?.();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={styles.content}>
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <SVG.SuccessIcone width={moderateScale(92)} height={moderateScale(92)} />
                    </View>

                    {/* Success Message */}
                    <Text style={styles.successTitle}>Successfully Registered!</Text>

                    {/* Welcome Message */}
                    <Text style={styles.welcomeText}>Welcome, {userName}!</Text>

                    {/* Description */}
                    <Text style={styles.descriptionText}>
                        Join the club and explore the upcoming events, matches, and activities and more.
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Go to Home"
                            onPress={onGoToHome}
                            variant="primary"
                            size="medium"
                            style={styles.goToHomeButton}
                        />

                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkipToAddMember}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.skipButtonText}>Tap to Skip & Add Member</Text>
                        </TouchableOpacity>
                    </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.9,
        maxHeight: SCREEN_HEIGHT * 0.8,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        padding: theme.spacing.lg,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: theme.spacing.xl,
    },
    successTitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xl,
        color: theme.colors.appleGreen,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    welcomeText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    descriptionText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        textAlign: 'center',
        lineHeight: theme.typography.fontSize.md * 1.5,
        marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
        width: '100%',
        gap: theme.spacing.md,
    },
    goToHomeButton: {
        width: '100%',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    skipButtonText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        textDecorationLine: 'underline',
    },
});

// Wrapper component for backward compatibility
const SuccessScreen: React.FC<SuccessScreenProps> = ({
    navigation,
}) => {
    const [showModal, setShowModal] = React.useState(true);
    const userName = 'Peter';

    const handleGoToHome = () => {
        setShowModal(false);
        navigation.navigate('Home' as never);
    };

    const handleSkipToAddMember = () => {
        setShowModal(false);
        navigation.navigate('AddMember' as never);
    };

    return (
        <SuccessModal
            visible={showModal}
            userName={userName}
            onClose={() => setShowModal(false)}
            onGoToHome={handleGoToHome}
            onSkipToAddMember={handleSkipToAddMember}
        />
    );
};

export { SuccessModal };
export default SuccessScreen;
