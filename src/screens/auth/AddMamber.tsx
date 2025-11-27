import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    FlatList,
    Image,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common';
import { theme } from '../../constants';
import { Strings } from '../../constants/strings';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { AddMemberScreenProps } from '../../types/navigation';
import { useAuthStore } from '../../stores/authStore';
import { getApiErrorInfo, MembersRequest, useMembers, useGetImageUrl } from '../../services/authService';
import { useUpdateMember, UpdateMemberRequest } from '../../services/authService';
import ToastManager from '../../components/common/ToastManager';
import { SuccessModal } from './SuccessScreen';
import { AddMemberModal } from '../../components/common/index';


interface Member {
    id: string;
    name: string;
    profileImage: string;
    isOwner: boolean;
    memberImageUrl?: string;
}

export const AddMemberScreen: React.FC<AddMemberScreenProps> = ({ navigation }) => {
    const updateMemberMutation = useUpdateMember();
    const getImageUrlMutation = useGetImageUrl();

    const [showModal, setShowModal] = useState(false);
    const [addMemberSuccessClose, setAddMemberSuccessClose] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [addMemberImageUrls, setAddMemberImageUrls] = useState<Record<number, string>>({});
    const { setUser } = useAuthStore();



    const membersParams: MembersRequest = {
        PageNumber: 0,
        PageSize: 20,
    };

    const handleUpdateMember = (memberId: number, memberData: UpdateMemberRequest) => {
        updateMemberMutation.mutate({
            memberId,
            memberData: memberData
        }, {
            onSuccess: (response) => {
                if(response?.status === 202){
                    Alert.alert("Add Member", response.data.message);
                }else{
                    setAddMemberSuccessClose(true);
                    setTimeout(() => {
                        setShowModal(false);
                        ToastManager.success( response.data.message);
                        refetch()
                        setAddMemberSuccessClose(false);
                    }, 1000);
                }
            },
            onError: (error) => {
                const errorInfo = getApiErrorInfo(error);
                ToastManager.error(errorInfo?.message);
            }
        });
    };

    const { data, isLoading, isError, refetch } = useMembers(membersParams);
    const rawMembers = (data?.data?.data || []).filter((member: Member) => !member.isOwner);

    
    // Add memberImageUrl from state
    const members = rawMembers.map((member: any) => ({
        ...member,
        memberImageUrl: addMemberImageUrls[member.id] || undefined
    }));
    
    const ownerName = data?.data?.data?.find(member => member.isOwner === true)?.name;


    const handleSkip = () => {
        setShowSuccessModal(true);
    };

    const handleAddMember = () => {
        setShowModal(!showModal);
    };

    const handleSaveMember = (memberData: any) => {
        const newMember: UpdateMemberRequest = {
            birthDate: memberData.dateOfBirth,
            relation: memberData.relationshipType,
            name: memberData.name,
            profileImage: memberData.profileImage?.fileName || '',
        };
        handleUpdateMember(0, newMember)
    };

    const handleNext = () => {
        // Update user to mark that member addition is complete
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
            setUser({
                ...currentUser,
                isAddMember: false
            });
        }
    };

    const getAddMemberImageUrls = async (memberItem: any) => {
        if (memberItem?.profileImage == null) return;
        
        // Skip if already fetched
        if (addMemberImageUrls[memberItem.id] !== undefined) return;

        const [folder, blobName] = memberItem?.profileImage.split('/');

        try {
            getImageUrlMutation.mutate({
                containerName: folder,
                blobName: blobName
            }, {
                onSuccess: (response) => {
                    const imageUrl = response?.data?.data?.url;
                    console.log('AddMember Image URL response', response.data);
                    
                    // Prefetch image into React Native cache to avoid blink when scrolling back
                    if (imageUrl) {
                        Image.prefetch(imageUrl).catch((prefetchError) => {
                            console.warn('AddMember Image prefetch failed:', prefetchError);
                        });
                    }
                    
                    // Simple state update instead of recreating entire query cache
                    setAddMemberImageUrls(prev => ({
                        ...prev,
                        [memberItem.id]: imageUrl
                    }));
                },
                onError: (error) => {
                    const errorInfo = getApiErrorInfo(error);
                    ToastManager.error(errorInfo?.message);
                    console.error('Failed to get AddMember image URL:', error);
                    
                    // Simple state update for failed image fetch
                    setAddMemberImageUrls(prev => ({
                        ...prev,
                        [memberItem.id]: ""
                    }));
                }
            });
        } catch (err) {
            console.error('Error in getAddMemberImageUrls:', err);
            setAddMemberImageUrls(prev => ({
                ...prev,
                [memberItem.id]: ""
            }));
        }
    };

    const onAddMemberViewableItemsChanged = useCallback(
        ({
            viewableItems,
        }: {
            viewableItems: Array<{ item: any }>;
        }) => {
            const items = viewableItems.map(({ item }) => item);

            // On-demand image fetching for viewable member items
            items.forEach((item) => {
                if (item && !item.memberImageUrl) {
                    console.log('AddMember onViewableItemsChanged>>>>>', JSON.stringify(item));
                    getAddMemberImageUrls(item);
                }
            });
        },
        [getAddMemberImageUrls]
    );

    const addMemberViewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50, // Increased threshold for better on-demand loading
        minimumViewTime: 100, // Minimum time item must be visible before triggering
        waitForInteraction: false, // Don't wait for user interaction
    }).current;

    const renderMemberItem = ({ item }: { item: Member }) => {
        return (
            <View style={styles.memberItem}>
                {item?.profileImage ? (
                    <Image source={{ uri: item?.profileImage }} style={styles.profileImage} />
                ) : (
                    <View style={[styles.profileImage, { backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                        <SVG.emptyUser width={moderateScale(20)} height={moderateScale(20)} />
                    </View>
                )}
                <Text style={styles.memberName}>{item.name}</Text>
            </View>
        );
    };

    const keyExtractor = (item: Member, index: number) => {
        // Create a more robust key that combines multiple attributes to ensure uniqueness
        const id = item?.id?.toString() || '';
        const name = item?.name || '';
        const email = item?.profileImage || '';

        // Create a unique composite key using multiple attributes
        const keyParts = [id, name, email].filter(part => part && part.toString().trim() !== '');

        if (keyParts.length > 0) {
            return `member-${keyParts.join('-')}-${index}`;
        }

        // Ultimate fallback with index to ensure uniqueness
        return `member-unknown-${index}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.blue}
                translucent={Platform.OS === 'android' ? true : false}
            />

            {/* Status Bar Background for iOS */}
            {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}

            {/* Header Section */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipButtonText}>{Strings.AUTH.SKIP}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{Strings.AUTH.ADD_MEMBER_TITLE}</Text>
            </SafeAreaView>

            {/* Add Member Button */}
            <View style={styles.addMemberContainer}>
                <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
                    <SVG.icAdd width={moderateScale(20)} height={moderateScale(20)} />
                    <Text style={styles.addMemberButtonText}>{Strings.AUTH.ADD_MEMBER_SUBTITLE}</Text>
                </TouchableOpacity>
            </View>

            {/* Content Section */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>{Strings.AUTH.ADD_MEMBER_SECTION_TITLE}</Text>

                <FlatList
                    data={members}
                    renderItem={renderMemberItem}
                    keyExtractor={keyExtractor}
                    style={styles.membersList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={10}
                    // onViewableItemsChanged={onAddMemberViewableItemsChanged}
                    // viewabilityConfig={addMemberViewabilityConfig}
                    getItemLayout={(data, index) => ({
                        length: moderateScale(70), // Approximate item height
                        offset: moderateScale(70) * index,
                        index,
                    })}
                    refreshing={isLoading}
                    onRefresh={refetch}
                    ListEmptyComponent={() => (
                        <Text style={styles.emptyListText}>No members found</Text>
                    )}

                />
            </View>

            <View style={styles.bottomContainer}>
                <Button
                    disabled={members?.length <= 0 ? true : false}
                    title={Strings.AUTH.NEXT}
                    onPress={handleSkip}
                    variant="primary"
                    size="medium"
                    style={styles.nextButton}
                />
            </View>
            <AddMemberModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSaveMember}
                onSuccessClose={addMemberSuccessClose}
            />
            <SuccessModal
                visible={showSuccessModal}
                userName={ownerName}
                onClose={() => setShowSuccessModal(false)}
                onGoToHome={() => handleNext()}
                onSkipToAddMember={() => navigation.navigate('AddMember' as never)}
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
        height: Platform.OS === 'ios' ? 44 : 0, // Status bar height for iOS
        backgroundColor: theme.colors.blue,
        zIndex: 1000,
    },
    header: {
        backgroundColor: theme.colors.blue,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        alignSelf: 'flex-start',
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(24),
        color: theme.colors.white,
        marginTop: moderateScale(20),
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    skipButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.white,
    },
    addMemberContainer: {
        backgroundColor: "theme.colors.blue",
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
    },
    addMemberButton: {
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
    addMemberButtonText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.appleGreen,
    },
    content: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopLeftRadius: moderateScale(30),
        borderTopRightRadius: moderateScale(30),
    },
    sectionTitle: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.blue,
        marginBottom: theme.spacing.md,
        letterSpacing: 0.5,
    },
    membersList: {
        flex: 1,
    },
    flatListContent: {
        paddingBottom: theme.spacing.sm,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    profileImage: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: theme.colors.surface,
    },
    memberName: {
        fontFamily: Fonts.outfitBold,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    bottomContainer: {
        height: moderateScale(120),
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
    },
    nextButton: {
        width: '100%',
        marginTop: moderateScale(-10),
    },
    emptyListText: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
        textAlign: 'center',
    },
});
