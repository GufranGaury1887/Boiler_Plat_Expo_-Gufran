
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClubDetailsScreenProps } from '../../types';
import { useState } from 'react';
import Images from '../../assets/images';




export const ClubDetailsScreen: React.FC<ClubDetailsScreenProps> = ({ navigation, route }) => {
    const selectedClub = route.params;
    const [imageError, setImageError] = useState(false);

    // Helper function to create navigation data
    const createNavigationData = () => {
        const navigationData = {
            selectedClub: selectedClub,
            selectedMember: selectedClub?.selectedMember
        };
        return navigationData;
    };

    const featureCards: any[] = [
        {
            id: 'teams',
            title: 'Teams',
            description: 'Join club to start your club journey.',
            icon: <SVG.Teams width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#F9F1FF',
            notificationCount: 2,
            cardHeight: 'short',
            onPress: () => navigation.navigate('MyTeam', createNavigationData()),
        },
        {
            id: 'calendar',
            title: 'Calendar',
            description: 'Track training, games, and team events with filters and reminders.',
            icon: <SVG.Calendar width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#EBFBF5',
            notificationCount: 3,
            cardHeight: 'tall',
            onPress: () => {
                console.log('Calendar pressed', createNavigationData());
                // Future navigation: navigation.navigate('Calendar', createNavigationData())
            },
        },
        {
            id: 'raffles',
            title: 'Raffles',
            description: 'Support & Win: Buy Raffle Tickets in the App',
            icon: <SVG.Raffles width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#EAF7FF',
            notificationCount: 3,
            cardHeight: 'medium',
            onPress: () => {
                console.log('Raffles pressed', createNavigationData());
                navigation.navigate('Raffles', createNavigationData());
            },
        },
        {
            id: 'Announcements',
            title: 'Announcements',
            description: 'Connect, coordinate, and cheer on—right from your team group chat.',
            icon: <SVG.Chat width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#FFF3F3',
            notificationCount: 1,
            cardHeight: 'tall',
            onPress: () => {
                console.log('Chat pressed', createNavigationData());
                navigation.navigate('Announcements', createNavigationData())
            },
        },
        {
            id: 'shop',
            title: 'Shop',
            description: 'Shop Team Gear & Food & Drinks to Support the Club',
            icon: <SVG.Shop width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#F5F7FF',
            notificationCount: 3,
            cardHeight: 'medium',
            onPress: () => {
                console.log('Shop pressed', createNavigationData());
                // Future navigation: navigation.navigate('Shop', createNavigationData())
            },
        },
        {
            id: 'events',
            title: 'Events',
            description: 'Selling tickets to fundraisers, etc.',
            icon: <SVG.Events width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#FFF1DB',
            notificationCount: 3,
            cardHeight: 'short',
            onPress: () => {
                console.log('Events pressed', createNavigationData());
                navigation: navigation.navigate('EventScreen', createNavigationData())
            },
        },
        {
            id: 'volunteer',
            title: 'Volunteer Opportunities',
            description: 'Support the club with your time and talent.',
            icon: <SVG.Volunteer width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#EFF9FF',
            notificationCount: 3,
            cardHeight: 'medium',
            onPress: () => {
                console.log('Volunteer pressed', createNavigationData());
                navigation: navigation.navigate('VolunteerOpportunitiesScreen', createNavigationData())
            },
        },
        {
            id: 'membership',
            title: 'Membership',
            description: 'Unlock Elite Access to Exclusive Facilities & Events',
            icon: <SVG.Membership width={moderateScale(40)} height={moderateScale(40)} />,
            backgroundColor: '#F7E9FF',
            notificationCount: 3,
            cardHeight: 'medium',
            onPress: () => {
                console.log('Membership pressed', createNavigationData());
                // Future navigation: navigation.navigate('Membership', createNavigationData())
            },
        },
    ];



    const renderFeatureCard = (card: any) => (
        <TouchableOpacity
            key={card.id}
            style={[
                styles.featureCard,
                { backgroundColor: card.backgroundColor }
            ]}
            onPress={() => card?.onPress()}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                {card.icon}
                <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>{card.notificationCount}</Text>
                </View>
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
        </TouchableOpacity>
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
                <View style={styles.headerContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.userConSty}>
                                {!!selectedClub?.selectedMember?.profileImage ? (
                                    <Image
                                        // onLoadEnd={() => setIsLoading(false)}
                                        // onLoad={() => setIsLoading(true)}
                                        // onLoadStart={() => setIsLoading(true)}
                                        source={{ uri: selectedClub.selectedMember.profileImage }} style={styles.userDetailsSty} />
                                ) : (
                                    <View style={styles.placeholderLogoHeader}>
                                        <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                    </View>)}
                            </View>
                            <Text style={styles.userNameSty}>{selectedClub?.selectedMember?.name || 'Unknown Member'}</Text>
                        </View>
                    </View>




                    <View style={styles.clubInfoContainer}>
                        <View style={styles.clubLogoContainer}>
                            <View style={styles.clubLogo}>
                                {!!selectedClub?.clubImage && !imageError ? (
                                    <Image
                                        source={{ uri: selectedClub?.clubImage }} style={styles.clubLogo}
                                        onError={() => {
                                            setImageError(true);
                                        }}
                                    // onLoadEnd={() => setIsLoading(false)}
                                    // onLoad={() => setIsLoading(true)}
                                    // onLoadStart={() => setIsLoading(true)}
                                    />
                                ) : (
                                    <View style={styles.placeholderLogo}>
                                        <Image source={Images.clubDefauldImage} style={styles.clubLogo} />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.clubDetails}>
                            <Text style={styles.clubName} numberOfLines={1}>{selectedClub?.clubName || 'Club Name'}</Text>

                            <View style={styles.memberInfoRow}>
                                <View style={styles.memberCountContainer}>
                                    <SVG.profileAppleGreen width={moderateScale(16)} height={moderateScale(16)} />
                                    <Text style={styles.memberCount}>
                                        {selectedClub?.totalMembers || 0} {(selectedClub?.totalMembers || 0) === 1 ? 'member' : 'members'}
                                    </Text>
                                </View>
                                <Text style={styles.clubCode}>{selectedClub?.clubCode || 'N/A'}</Text>
                            </View>

                            <View style={styles.addressContainer}>
                                <SVG.locationWhite width={moderateScale(16)} height={moderateScale(16)} />
                                <Text numberOfLines={1} style={styles.clubAddress}>{selectedClub?.clubAddress || 'Address not available'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            <View style={styles.content}>

                <Text style={styles.mainTitle}>MY SPORT HUB</Text>
                <Text style={styles.subtitle}>
                    Your all-in-one center for team updates, events, and performance tracking.
                </Text>
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.cardsGrid}>
                        {featureCards.map(renderFeatureCard)}
                    </View>
                </ScrollView>
            </View>
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
        backgroundColor: theme.colors.blue,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: moderateScale(200),
    },
    headerContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    backButton: {
    },
    clubInfoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        marginTop: moderateScale(10)
    },
    clubLogoContainer: {
        marginRight: theme.spacing.md,
    },
    clubLogo: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(12),
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    clubDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    clubName: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(18),
        color: theme.colors.white,
        marginBottom: theme.spacing.sm,
    },
    memberInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    memberCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberCount: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.appleGreen,
        marginLeft: theme.spacing.xs,
    },
    clubCode: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.appleGreen,
        alignSelf: 'flex-end',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clubAddress: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.white,
        marginLeft: theme.spacing.xs,
        flex: 1,
    },

    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        paddingTop: theme.spacing.xl,
    },
    titleSection: {
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    mainTitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.blue,
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.lg,

    },
    subtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.text,
        lineHeight: moderateScale(22),
        marginLeft: theme.spacing.lg,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: theme.spacing.md,
    },
    featureCard: {
        width: '48%',
        backgroundColor: theme.colors.background,
        borderRadius: moderateScale(16),
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    iconContainer: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(16),
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',

    },
    notificationBadge: {
        backgroundColor: theme.colors.error,
        borderRadius: moderateScale(10),
        minWidth: moderateScale(25),
        height: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: moderateScale(-10),
        top: moderateScale(-10),
    },
    notificationText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(12),
        color: theme.colors.white,
    },
    cardTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    cardDescription: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        lineHeight: moderateScale(16),
    },
    placeholderLogo: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: theme.colors.imageBorder,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    userDetailsSty: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        resizeMode: 'cover',
    },
    userDefaultIcone: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(10)
    },
    placeholderLogoHeader: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    userNameSty: {
        marginTop: moderateScale(5),
        color: theme.colors.white,
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(15)
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
    }
});