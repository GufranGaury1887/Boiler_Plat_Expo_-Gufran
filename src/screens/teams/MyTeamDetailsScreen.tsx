import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Platform, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { MyTeamDetailsScreenProps } from '../../types/navigation';
import { Strings, theme } from '../../constants';
import { moderateScale, width } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common';
import { useTeamDetails } from '../../services/mainServices';
import { getApiErrorInfo, useGetImageUrl } from '../../services/authService';
import ToastManager from '../../components/common/ToastManager';

export const MyTeamDetailsScreen: React.FC<MyTeamDetailsScreenProps> = ({ navigation, route }) => {
    // const { club, selectedClub } = route?.params ?? {};
    // const teamId = club?.teamId;


    const { club, selectedClub, selectedMember }: any = route?.params ?? {};

    const teamDetail = route?.params ?? {}
    const teamId = club?.teamId;
    console.log("teamDetail===>>>", teamDetail);


    const { data, isLoading, error, refetch } = useTeamDetails(teamId);

    const TeamDetails: any = data?.data?.data;
    console.log("Team Details:", route?.params);

    const getImageUrlMutation = useGetImageUrl();

    const [teamImageUrl, setTeamImageUrl] = useState<string>('');
    const [memberImages, setMemberImages] = useState<{ [key: string]: string }>({});
    const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');

    // Function to get team profile image URL
    const handleGetTeamImageUrl = () => {
        if (!TeamDetails?.teamDetail?.teamProfileImage) return;

        const teamImageName = TeamDetails.teamDetail.teamProfileImage;

        // Check if it contains a folder path
        let containerName = 'teams'; // default container
        let blobName = teamImageName;

        if (teamImageName.includes('/')) {
            const [folder, blob] = teamImageName.split('/');
            containerName = folder;
            blobName = blob;
        }

        setImageLoading(prev => ({ ...prev, teamProfile: true }));

        getImageUrlMutation.mutate({
            containerName: containerName,
            blobName: blobName
        }, {
            onSuccess: (response) => {
                const imageUrl = response?.data?.data?.url;
                setTeamImageUrl(imageUrl);
                console.log('Team Image URL response', response.data);
                setImageLoading(prev => ({ ...prev, teamProfile: false }));
            },
            onError: (error) => {
                const errorInfo = getApiErrorInfo(error);
                ToastManager.error(errorInfo?.message);
                console.error('Failed to get team image URL:', error);
                setTeamImageUrl('');
                setImageLoading(prev => ({ ...prev, teamProfile: false }));
            }
        });
    };

    // Function to get member image URL
    const handleGetMemberImageUrl = (memberImage: string, memberId: string) => {
        if (!memberImage) return;

        let containerName = 'members'; // default container
        let blobName = memberImage;

        if (memberImage.includes('/')) {
            const [folder, blob] = memberImage.split('/');
            containerName = folder;
            blobName = blob;
        }

        setImageLoading(prev => ({ ...prev, [memberId]: true }));

        getImageUrlMutation.mutate({
            containerName: containerName,
            blobName: blobName
        }, {
            onSuccess: (response) => {
                const imageUrl = response?.data?.data?.url;
                setMemberImages(prev => ({ ...prev, [memberId]: imageUrl }));
                setImageLoading(prev => ({ ...prev, [memberId]: false }));
            },
            onError: (error) => {
                const errorInfo = getApiErrorInfo(error);
                console.error('Failed to get member image URL:', error);
                setImageLoading(prev => ({ ...prev, [memberId]: false }));
            }
        });
    };

    // Effect to load team profile image
    useEffect(() => {
        if (TeamDetails?.teamDetail?.teamProfileImage) {
            handleGetTeamImageUrl();
        }
    }, [TeamDetails?.teamDetail?.teamProfileImage]);

    // Effect to load member images
    useEffect(() => {
        if (TeamDetails?.memberDetailList) {
            console.log('Processing member images:', TeamDetails.memberDetailList);
            TeamDetails.memberDetailList.forEach((member: any) => {
                console.log('Member:', member.memberName, 'Image:', member.memberImage, 'Has image:', member.memberImage && member.memberImage.trim() !== '');
                if (member.memberImage && member.memberImage.trim() !== '') {
                    handleGetMemberImageUrl(member.memberImage, member.memberId.toString());
                }
            });
        }
    }, [TeamDetails?.memberDetailList]);




    // Function to generate date data for horizontal picker
    const generateDateData = () => {
        const dates = [];
        const today = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Generate 14 days (7 before and 7 after today)
        for (let i = -7; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            dates.push({
                id: i,
                date: date.getDate(),
                month: date.getMonth() + 1,
                dayName: dayNames[date.getDay()],
                isToday: i === 0,
                fullDate: date
            });
        }

        return dates;
    };

    // Function to render date item
    const renderDateItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity style={[
                styles.dateItem,
                item.isToday && styles.activeDateItem
            ]}>
                <Text style={[
                    styles.dateNumber,
                    item.isToday && styles.activeDateText
                ]}>
                    {item.date}
                </Text>
                <Text style={[
                    styles.dayName,
                    item.isToday && styles.activeDateText
                ]}>
                    {item.dayName}
                </Text>
            </TouchableOpacity>
        );
    };

    // Function to render individual player card
    const renderPlayerCard = (player: any) => {

        return (
            <View key={player.memberId} style={styles.playerCard}>
                {player?.memberImage ? (
                    <Image
                        source={{ uri: player?.memberImage }}
                        style={styles.playerImage}
                    />
                ) : (
                    <View style={styles.playerPlaceholder}>
                        <SVG.emptyUser
                            width={moderateScale(50)}
                            height={moderateScale(50)}
                        />
                    </View>
                )}
                {/* {isLoadingMemberImage && (
                    <View style={styles.memberImageLoader}>
                        <ActivityIndicator 
                            size="small" 
                            color={theme.colors.appleGreen} 
                        />
                    </View>
                )} */}
                <View style={styles.playerNameOverlay}>
                    <Text style={styles.playerName}>{player.memberName || 'Unknown Player'}</Text>
                </View>
            </View>
        );
    };

    if (!club) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Team Details</Text>
                    </View>
                </SafeAreaView>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No team data available</Text>
                    <Button
                        title="Go Back"
                        onPress={() => navigation.goBack()}
                        variant="primary"
                        size="medium"
                    />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android' ? true : false}
            />
            {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}

            <View style={styles.header}>
                <View style={styles.headerTopRow}>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
                    </TouchableOpacity>


                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.userConSty}>
                            {!!selectedClub?.clubImage ? (
                                <Image
                                source={{ uri: selectedClub?.clubImage }} style={styles.userDetailsSty} resizeMode='cover' />
                                // onLoadEnd={() => setIsLoading(false)}
                                // onLoad={() => setIsLoading(true)}
                                // onLoadStart={() => setIsLoading(true)}
                            ) : (
                                <View style={styles.placeholderLogoHeader}>
                                    <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Unknown Club'}</Text>
                    </View>

                </View>

                {/* Club Image Centered */}
                <View style={styles.centerImageContainer}>
                    {TeamDetails?.teamDetail?.teamProfileImage ? (
                        <Image
                            source={{ uri: TeamDetails?.teamDetail?.teamProfileImage }}
                            style={styles.centerClubImage}
                        />
                    ) : (
                        <View style={styles.centerPlaceholderImage}>
                            <SVG.emptyUser width={moderateScale(60)} height={moderateScale(60)} />
                        </View>
                    )}
                </View>

                {/* Club Name Centered */}
                <View style={styles.centerTextContainer}>
                    <Text style={styles.centerClubName} numberOfLines={2}>
                        {TeamDetails?.teamDetail?.teamName || 'Unknown Team'}
                    </Text>
                </View>

                {/* Total Members */}
                <View style={styles.centerMemberInfo}>
                    <View style={styles.totalMembersContainer}>
                        <SVG.profileAppleGreen width={moderateScale(16)} height={moderateScale(16)} />
                        <Text style={styles.totalMembersText}>
                            {TeamDetails?.teamDetail?.totalMembers || 0} {(TeamDetails?.teamDetail?.totalMembers || 0) === 1 ? 'member' : 'members'}
                        </Text>
                    </View>
                </View>

                {/* Chat Button */}
                <View style={styles.chatButtonContainer}>
                    <TouchableOpacity style={styles.chatButton} onPress={() => {
                        const navigationData = {
                            team: club,
                            selectedMember: selectedMember,
                            selectedClub: selectedClub
                        }
                        navigation.navigate('ChatThreads', navigationData);
                    }}>
                        <SVG.chatAppleGreen width={moderateScale(18)} height={moderateScale(18)} color={theme.colors.appleGreen} />
                        <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tab Bar */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
                        onPress={() => setActiveTab('details')}
                    >
                        <Text style={[styles.tabButtonText, activeTab === 'details' && styles.activeTabButtonText]}>
                            Team Details
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'schedule' && styles.activeTabButton]}
                        onPress={() => setActiveTab('schedule')}
                    >
                        <Text style={[styles.tabButtonText, activeTab === 'schedule' && styles.activeTabButtonText]}>
                            Team Schedule
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                {activeTab === 'details' ? (
                    <View style={styles.tabContent}>
                        {/* Team Info Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeading}>TEAM INFO</Text>
                            <Text style={styles.sectionContent}>
                                {TeamDetails?.teamDetail?.teamDescription || 'No team description available.'}
                            </Text>
                        </View>

                        {/* Head Coach Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeading}>HEAD COACH</Text>
                            <View style={styles.coachCard}>
                                <View style={styles.coachImageContainer}>
                                    <SVG.HeadCoachIcon width={moderateScale(27)} height={moderateScale(28)} />
                                </View>
                                <View style={styles.coachDetails}>
                                    <Text style={styles.coachName}>{TeamDetails?.teamDetail?.headCoachName || 'Unknown Coach'}</Text>
                                    {/* <Text style={styles.coachTitle}>
                                       ? Head Coach since {TeamDetails?.teamDetail?.createdOn ? new Date(TeamDetails.teamDetail.createdOn).getFullYear() : 'Unknown'}
                                    </Text> */}
                                </View>
                            </View>
                        </View>


                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionHeading}>TEAM PLAYERS</Text>
                            {/* Team Players Grid */}
                            <View style={styles.playersGrid}>
                                <FlatList
                                    data={TeamDetails?.memberDetailList || []}
                                    renderItem={({ item }) => renderPlayerCard(item)}
                                    numColumns={3}
                                    keyExtractor={(item) => item?.memberId?.toString() || Math.random().toString()}
                                    columnWrapperStyle={styles.playersRow}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.tabContent}>
                        {/* Team Schedule Content */}
                        <View style={styles.sectionContainer}>
                            {/* <View style={styles.horizontalLine} />
                            <FlatList
                                data={generateDateData()}
                                renderItem={renderDateItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={styles.datePickerContainer}
                                style={styles.datePicker}
                            />
                            <View style={styles.horizontalLine} /> */}
                            <Text style={styles.sectionHeading}>UPCOMING MATCHES</Text>
                            <Text style={styles.sectionContent}>
                                Schedule Matches will be displayed here Soon.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
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
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.xl,

    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(22),
        color: theme.colors.white,
    },
    headerSubtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.white,
        opacity: 0.8,
        marginTop: moderateScale(2),
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        marginTop: -theme.spacing.md,
    },
    teamImageContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        paddingTop: theme.spacing.xl,
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
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),

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

    teamImage: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: theme.colors.background,
    },
    placeholderImage: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamInfoContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    teamName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(24),
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoLabel: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        flex: 1,
    },
    infoValue: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.text,
        flex: 2,
        textAlign: 'right',
    },
    actionsContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    actionButton: {
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    secondaryActions: {
        marginTop: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.xxl,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.sm,
    },
    secondaryButtonText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.primary,
    },
    leaveButton: {
        borderColor: theme.colors.error,
    },
    leaveButtonText: {
        color: theme.colors.error,
    },
    errorContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
    },
    errorText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(16),
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    // Member Information Styles
    memberInfoContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    memberCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    memberImageContainer: {
        marginRight: theme.spacing.md,
    },
    memberImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
    },
    placeholderMemberImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginBottom: moderateScale(4),
    },
    memberRelation: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginBottom: moderateScale(2),
    },
    memberBirthDate: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        marginBottom: moderateScale(4),
    },
    ownerBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(4),
        borderRadius: moderateScale(12),
        alignSelf: 'flex-start',
    },
    ownerBadgeText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(10),
        color: theme.colors.white,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
    },
    clubInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    headerClubImageContainer: {
        marginRight: theme.spacing.md,
    },
    headerClubImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: theme.colors.background,
    },
    headerPlaceholderImage: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerClubName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(20),
        color: theme.colors.white,
        marginBottom: moderateScale(4),
    },
    headerMemberText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.appleGreen,
        opacity: 0.8,
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
    chatButtonContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xs,
    },
    chatButton: {
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
    chatButtonText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.appleGreen,
    },
    centerImageContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    centerClubImage: {
        width: moderateScale(120),
        height: moderateScale(120),
        borderRadius: moderateScale(60),
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.imageBorder,

    },
    centerPlaceholderImage: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerTextContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    centerClubName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(22),
        color: theme.colors.white,
        textAlign: 'center',
    },
    centerMemberInfo: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    totalMembersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    totalMembersText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(12),
        color: theme.colors.appleGreen,
        opacity: 0.8,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
        height: moderateScale(40),
        backgroundColor: theme.colors.background,
        borderRadius: moderateScale(29),
        padding: moderateScale(2),
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        marginTop: theme.spacing.md
    },
    tabButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.xxl,
        alignItems: 'center',
    },
    activeTabButton: {
        backgroundColor: theme.colors.blue,
    },
    tabButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
    },
    activeTabButtonText: {
        color: theme.colors.white,
        fontSize: moderateScale(14),
        fontFamily: Fonts.outfitSemiBold,
    },
    tabContent: {
        paddingHorizontal: theme.spacing.lg,
    },
    sectionContainer: {
        marginBottom: theme.spacing.sm,
    },
    sectionHeading: {
        fontFamily: Fonts.outfitLight,
        fontSize: moderateScale(11.67),
        color: theme.colors.blue,
        marginVertical: theme.spacing.xs,
    },
    sectionContent: {
        fontFamily: Fonts.outfitLight,
        fontSize: moderateScale(13),
        color: theme.colors.paraText,
        lineHeight: moderateScale(20),
    },
    coachCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
        alignItems: 'center',
    },
    coachImageContainer: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(35),
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: moderateScale(8),
        marginRight: theme.spacing.md,
        opacity: 1,
    },
    coachDetails: {
        flex: 1,
    },
    coachName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginBottom: moderateScale(4),
    },
    coachTitle: {
        fontFamily: Fonts.outfitLight,
        fontSize: moderateScale(12),
        color: theme.colors.appleGreen,
        marginBottom: moderateScale(2),
    },
    coachExperience: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
    },
    playersGrid: {
        marginHorizontal: -theme.spacing.sm, // To counteract the gap in rows
    },
    playersRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    playerCard: {
        position: 'relative',
        width: width / 3 - theme.spacing.md,
        height: moderateScale(113.49),
        borderRadius: moderateScale(19.09),
        borderWidth: moderateScale(1.06),
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    playerImage: {
        width: '100%',
        height: '100%',
        borderRadius: moderateScale(19.09),
    },
    playerNameOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: moderateScale(4),
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    playerName: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(12),
        alignSelf: 'center',
        color: theme.colors.white,
        opacity: 1,
        textAlign: 'left',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    playerPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(19.09),
    },
    // Date Picker Styles
    horizontalLine: {
        height: moderateScale(1),
        backgroundColor: theme.colors.border,
        marginVertical: moderateScale(1),
    },
    datePicker: {
        marginVertical: theme.spacing.xs,
    },
    datePickerContainer: {
        paddingHorizontal: theme.spacing.sm,
    },
    dateItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginHorizontal: theme.spacing.xs,
        borderRadius: moderateScale(8),
        // minWidth: moderateScale(40),
    },
    activeDateItem: {
        backgroundColor: theme.colors.appleGreen,
        height: moderateScale(42),
    },
    dateNumber: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(12),
        color: theme.colors.appleGreen,
        marginBottom: moderateScale(2),
    },
    dayName: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(10),
        color: theme.colors.textSecondary,
    },
    activeDateText: {
        color: theme.colors.white,
        fontSize: moderateScale(14),
    },
    memberImageLoader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -10,
        marginLeft: -10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: moderateScale(10),
        padding: moderateScale(5),
    },
});