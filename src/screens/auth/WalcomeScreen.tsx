import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../constants';
import { Fonts } from '../../constants/Fonts';
import { AuthStackParamList } from '../../types/navigation';
import Images from '../../assets/images';
import { moderateScale, verticalScale } from '../../utils/scaling';
import SVG from '../../assets/icons';
import { Button } from '../../components/common';
import { StorageService } from '../../utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface OnboardingSlide {
    id: number;
    subtitle: string;
    description: string;
}

const onboardingSlides: OnboardingSlide[] = [
    {
        id: 1,
        subtitle: 'Your Game, Your Club, Your Community.',
        description: 'Join a new era of sports where players, coaches, and fans stay connected, motivated, and ready to win.',
    },
    {
        id: 2,
        subtitle: 'Your Game, Your Club, Your Community.',
        description: 'Join a new era of sports where players, coaches, and fans stay connected, motivated, and ready to win.',
    },
    {
        id: 3,
        subtitle: 'Your Game, Your Club, Your Community.',
        description: 'Join a new era of sports where players, coaches, and fans stay connected, motivated, and ready to win.',
    },
];

const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSlideChange = (index: number) => {
        setCurrentSlideIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * SCREEN_WIDTH,
            animated: true,
        });
    };

    const handleSignIn = () => {
        // Mark welcome screen as shown before navigating
        StorageService.preferences.setWelcomeScreenShown(true);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleSignUp = () => {
        // Mark welcome screen as shown before navigating
        StorageService.preferences.setWelcomeScreenShown(true);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Register' }],
        });
    };

    const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
            <View style={styles.slideContent}>
                <Text style={styles.slideDescription}>{item.description}</Text>
                <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            </View>

    );

    const renderPaginationDots = () => (
        <View style={styles.paginationContainer}>
            {onboardingSlides.map((slide, index) => (
                <TouchableOpacity
                    key={`pagination-${slide.id}`}
                    style={[
                        styles.paginationDot,
                        index === currentSlideIndex && styles.activePaginationDot,
                    ]}
                    onPress={() => handleSlideChange(index)}
                />
            ))}
        </View>
    );

    return (
        <ImageBackground
            source={Images.backgroundImage}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <SafeAreaView edges={['top']} style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <SVG.login_logo
                        height={moderateScale(200)}
                        width={moderateScale(200)}
                        style={styles.logoIcon}
                    />
                </View>

                {/* Curved Background Content Card */}
                <View style={styles.curvedBackgroundContainer}>
                    <SVG.curvViewImage
                        width={SCREEN_WIDTH}
                        height={verticalScale(430)}
                        style={styles.curvedBackgroundImage}
                    />

                    <View style={styles.contentCard}>
                        {/* Interactive Slider */}
                        <ScrollView
                            ref={scrollViewRef}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                setCurrentSlideIndex(index);
                            }}
                        >
                            {onboardingSlides.map((slide, index) => (
                                <View key={slide.id} style={styles.slideWrapper}>
                                    {renderSlide({ item: slide, index })}
                                </View>
                            ))}
                        </ScrollView>

                        {/* Pagination Dots */}
                        {renderPaginationDots()}

                        {/* Action Buttons */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Sign In"
                                onPress={handleSignIn}
                                variant="outline"
                                size="medium"
                                textStyle={styles.signInButtonText}
                            />
                            <Button
                                title="Sign Up"
                                onPress={handleSignUp}
                                variant="primary"
                                size="medium"
                                style={styles.signUpButton}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    logoSection: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(20),
    },
    logoIcon: {
        marginBottom: verticalScale(16),
    },
    curvedBackgroundContainer: {
        flex: 1,
        position: 'relative',
        marginTop: verticalScale(20),
    },
    curvedBackgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    contentCard: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: verticalScale(90),
        paddingHorizontal: theme.spacing.lg,
        zIndex: 2,
    },
   
    slideWrapper: {
        width: SCREEN_WIDTH - (theme.spacing.lg * 2),
    },
    slideContainer: {
    },
    slideContent: {
        alignItems: 'center',
    },

    slideSubtitle: {
        alignSelf: 'flex-start',
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.black,
        fontFamily: Fonts.outfitRegular,
        marginTop: theme.spacing.sm,
    },

    slideDescription: {
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.black,
        fontFamily: Fonts.outfitRegular,
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    paginationDot: {
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.spacing.xs,
    },
    activePaginationDot: {
        width: moderateScale(24),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: theme.colors.appleGreen,
    },
    buttonContainer: {
        paddingBottom: theme.spacing.xl,
    },
    signInButton: {
        backgroundColor: theme.colors.white,
        borderColor: theme.colors.appleGreen,
        marginBottom: theme.spacing.md,
    },
    signInButtonText: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.appleGreen,
    },
    signUpButton: {
        marginVertical: theme.spacing.md,
    },
});

export { WelcomeScreen };
export default WelcomeScreen;
