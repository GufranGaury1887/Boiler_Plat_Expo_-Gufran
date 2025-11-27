import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, SectionList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@constants';
import { Fonts } from '@constants/Fonts';
import { moderateScale } from '@utils/scaling';
import SVG from '@assets/icons';
import Images from '@assets/images';
import { EventScreenProps } from '@navigation';
import { SearchBar } from 'react-native-screens';
import { TextInput } from '@components/common';

// Mock Data
interface Event {
    id: string;
    type: 'match' | 'training' | 'fundraiser' | 'event';
    title: string;
    subtitle?: string;
    time: string;
    location: string;
    team1?: { name: string; logo: any };
    team2?: { name: string; logo: any };
    tag?: string;
}

interface Section {
    title: string;
    data: Event[];
}

const EVENTS_DATA: Section[] = [
    {
        title: '6th May 2025',
        data: [
            {
                id: '1',
                type: 'match',
                title: 'Net Masters',
                time: '3:00 PM',
                location: '98 Shirley Street 4209, Sydney',
                team1: { name: 'All Starts', logo: Images.clubDefauldImage },
                team2: { name: 'Pirates', logo: Images.clubDefauldImage },
                subtitle: 'SAT, DEC 16'
            }
        ]
    },
    {
        title: '7th May 2025',
        data: [
            {
                id: '2',
                type: 'training',
                title: 'Team Strength Training',
                time: '2:00 PM - 4:00 PM',
                location: '98 Shirley Street 4209, Sydney',
                tag: 'Training'
            },
            {
                id: '3',
                type: 'fundraiser',
                title: 'Fundraiser Event',
                time: '2:00 PM - 4:00 PM',
                location: '98 Shirley Street 4209, Sydney',
                tag: 'Fundraiser'
            }
        ]
    }
];

export const EventScreen: React.FC<EventScreenProps> = ({ navigation, route }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedClub } = route.params || {};

    const renderItem = ({ item }: { item: Event }) => {
        if (item.type === 'match') {
            return (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Image source={Images.clubDefauldImage} style={styles.smallLogo} />
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>

                    <View style={styles.matchInfo}>
                        <Text style={styles.matchDate}>{item.subtitle}</Text>
                        <Text style={styles.matchTime}>{item.time}</Text>
                    </View>

                    <View style={styles.teamsContainer}>
                        <View style={styles.team}>
                            <Image source={item.team1?.logo} style={styles.teamLogo} />
                            <View>
                                <Text style={styles.teamName}>{item.team1?.name}</Text>
                                <Text style={styles.teamSubName}>Boomers</Text>
                            </View>
                        </View>
                        <Text style={styles.vsText}>VS</Text>
                        <View style={styles.team}>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.teamName}>{item.team2?.name}</Text>
                                <Text style={styles.teamSubName}>Eagles</Text>
                            </View>
                            <Image source={item.team2?.logo} style={styles.teamLogo} />
                        </View>
                    </View>

                    <View style={styles.locationContainer}>
                        <SVG.locationIcon width={moderateScale(16)} height={moderateScale(16)} />
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image source={Images.clubDefauldImage} style={styles.smallLogo} />
                    <Text style={styles.cardTitle}>Net Masters</Text>
                </View>

                <View style={styles.eventRow}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    {item.tag && (
                        <View style={[styles.tag, item.tag === 'Training' ? styles.trainingTag : styles.fundraiserTag]}>
                            <Text style={[styles.tagText, item.tag === 'Training' ? styles.trainingTagText : styles.fundraiserTagText]}>
                                {item.tag}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.eventTime}>{item.time}</Text>

                <View style={styles.locationContainer}>
                    <SVG.locationIcon width={moderateScale(16)} height={moderateScale(16)} />
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>
        );
    };

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyListText}>No events found</Text>
            <Text style={styles.emptySubText}>Try refreshing or check back later</Text>
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
                                    source={{ uri: selectedClub.clubImage }}
                                    resizeMode='cover'
                                    style={styles.userDetailsSty} />
                            ) : (
                                <View style={styles.placeholderLogoHeader}>
                                    <SVG.UsersIcon width={moderateScale(20)} height={moderateScale(20)} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.userNameSty}>{selectedClub?.clubName || 'Boomers Club'}</Text>
                    </View>
                </View>
                <Text style={styles.headerTitle}>Events</Text>

                <View style={styles.content}>
                    <View style={styles.searchContainer}>
                        {/* <SVG.search width={moderateScale(20)} height={moderateScale(20)} /> */}
                        {/* <TextInput
                            style={styles.searchInput}
                            placeholder="Search here"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        /> */}
                        <TextInput
                            leftIconStyle={{ marginLeft: theme.spacing.sm }}
                            leftIconSizeWidth={moderateScale(17)}
                            leftIconSizeHeight={moderateScale(17)}
                            placeholder="Unique code and club name"
                            style={styles.searchInput}
                            leftIcon={SVG.search}
                            variant="outlined"
                            maxLength={50}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                    </View>
                    <View style={{ marginTop: theme.spacing.md }}>

                        <SectionList
                            sections={EVENTS_DATA}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            renderSectionHeader={renderSectionHeader}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            stickySectionHeadersEnabled={false}
                            ListEmptyComponent={renderEmptyComponent}
                        />
                    </View>
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
    searchContainer: {
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    searchInput: {
        flex: 1,
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.text,
    },
    sectionHeader: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.blue,
        marginBottom: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    listContent: {
        paddingBottom: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: moderateScale(16),
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.imageBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    smallLogo: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        marginRight: theme.spacing.xs,
    },
    cardTitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: moderateScale(14),
        color: theme.colors.text,
    },
    matchInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    matchDate: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.black,
        textTransform: 'uppercase',
    },
    matchTime: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.text,
    },
    teamsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    team: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    teamLogo: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        marginHorizontal: theme.spacing.sm,
    },
    teamName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(14),
        color: theme.colors.text,
    },
    teamSubName: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
    },
    vsText: {
        fontFamily: Fonts.outfitBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
        marginHorizontal: theme.spacing.sm,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: theme.spacing.sm,
    },
    locationText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
    },
    eventRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    eventTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.text,
    },
    tag: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs / 2,
        borderRadius: moderateScale(12),
    },
    trainingTag: {
        backgroundColor: '#E0F7FA',
    },
    fundraiserTag: {
        backgroundColor: '#FCE4EC',
    },
    tagText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(10),
    },
    trainingTagText: {
        color: '#006064',
    },
    fundraiserTagText: {
        color: '#880E4F',
    },
    eventTime: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
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
});
