import React, { useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    Platform,
    TouchableOpacity,
    Image,
    RefreshControl,
    Keyboard,
} from "react-native";
import moment from "moment";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTeamThreads, ChatThread } from "@services/mainServices";
import { ChatThreadsScreenProps } from "@navigation";
import { moderateScale } from "@utils/scaling";
import { Fonts } from "@constants/Fonts";
import { theme } from "@constants";
import SVG from "@assets/icons";

export const ChatThreadsScreen: React.FC<ChatThreadsScreenProps> = ({
    navigation,
    route,
}) => {
    const { team }: any = route?.params ?? {};
    const teamId = team?.teamId;
    const memberId = team?.memberId;
    const clubImage = team?.teamProfileImage;

    const {
        data: threadsResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useTeamThreads(teamId, memberId);

    // Get threads data from response
    const threads = threadsResponse?.data?.data || [];

    useFocusEffect(useCallback(() => {
        refetch();
    }, [refetch]));

    // Refresh data
    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleThreadPress = (item: any) => {

        navigation.navigate("ChatScreen", {
            itemDetails: item,
            memberId: memberId,
            teamId: teamId,
            team: team,
            userType: "teams"
        });
    };



    const renderThreadCard = ({ item }: { item: ChatThread }) => {
        return (
            <TouchableOpacity
                style={styles.threadCard}
                onPress={() => handleThreadPress(item)}
            >
                <View style={styles.threadInfo}>
                    <View style={styles.threadHeader}>
                        <Text style={styles.threadName} numberOfLines={1}>
                            {item?.threadName}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                            {item?.isMute && (
                                <SVG.mute width={moderateScale(18)} height={moderateScale(18)} />
                            )}
                            {item?.unreadMessageCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationText}>{item?.unreadMessageCount}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {item?.lastMessageText == "Attachment_Image" ? (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            Attachment Image
                        </Text>
                    ) : (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item?.lastMessageText || 'No messages yet'}
                        </Text>
                    )}


                    {item?.lastMessageSentAt && (
                        <View>
                            <Text style={styles.lastMessageTime}>{moment(new Date(item?.lastMessageSentAt + "Z")).format('DD/MM/YYYY, hh:mm A')}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyComponent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading chat threads...</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chat threads available</Text>
                <Text style={styles.emptySubText}>Start a conversation to see threads here</Text>
            </View>
        );
    };

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={theme.colors.blue} barStyle="light-content" />
            {Platform.OS === "android" && <View style={styles.statusBarBackground} />}

            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <SVG.arrowLeft_white
                            width={moderateScale(25)}
                            height={moderateScale(25)}
                        />
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", flex: 1 }}>
                        <View style={styles.userConSty}>
                            {!!clubImage ? (
                                <Image
                                    source={{ uri: clubImage }}
                                    style={styles.userDetailsSty}
                                    resizeMode='cover'
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
                        <View style={styles.clubInfoContainer}>
                            <Text style={styles.userNameSty}>
                                {team?.teamName || "Unknown Member"}
                            </Text>
                            <Text style={styles.totalMembersSty}>
                                {team?.totalMembers || 0}{" "}
                                {(team?.totalMembers || 0) === 1 ? "member" : "members"}
                            </Text>
                        </View>
                    </View>
                </View>

            </View>
            <View style={styles.contentList}>
                <Text style={styles.sectionHeading}>Chat Threads</Text>
                <FlatList
                    data={threads}
                    renderItem={renderThreadCard}
                    keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                    style={styles.clubsList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                    removeClippedSubviews={false}
                    initialNumToRender={10}
                    ListEmptyComponent={renderEmptyComponent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor={theme.colors.primary}
                        />
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.blue,
    },
    statusBarBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 44 : 0,
        backgroundColor: theme.colors.blue,
        zIndex: 1000,
    },
    header: {
        backgroundColor: theme.colors.blue,
        paddingTop: Platform.OS === "android" ? theme.spacing.lg : theme.spacing.xs,
        paddingBottom: theme.spacing.xl,
    },
    headerTopRow: {
        flexDirection: "row",
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
    },
    clubInfoContainer: {
        marginLeft: moderateScale(4),
        justifyContent: 'center',
    },
    userNameSty: {
        color: theme.colors.white,
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(16),
    },
    totalMembersSty: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(11),
        color: theme.colors.appleGreen,
    },
    userDetailsSty: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(18),
    },
    userConSty: {
        marginLeft: moderateScale(12),
        marginRight: theme.spacing.xs,
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
        borderColor: theme.colors.imageBorder,
        backgroundColor: theme.colors.imageBorder,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholderLogoHeader: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
    },
    sectionHeading: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.black,
        marginBottom: theme.spacing.md,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: theme.spacing.xl,
    },
    emptyText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: theme.spacing.xl,
    },
    loadingText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
    },
    clubsList: {
        flex: 1,
    },
    flatListContent: {
        paddingBottom: theme.spacing.xl,
    },
    contentList: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
        marginTop: -theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
    },
    threadCard: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.lightLavenderGray,
        marginBottom: theme.spacing.sm,
        borderRadius: theme.borderRadius.xl,

    },
    threadInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    threadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    threadName: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
        flex: 1,
    },
    lastMessage: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    lastMessageTime: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.black,
        alignSelf: 'flex-end',
    },
    emptySubText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    notificationBadge: {
        backgroundColor: theme.colors.error,
        borderRadius: moderateScale(10),
        minWidth: moderateScale(25),
        height: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center'
    },
    notificationText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(12),
        color: theme.colors.white,
    },
});
