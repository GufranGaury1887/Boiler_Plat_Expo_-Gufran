import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { ImagePickerComponent } from './ImagePicker';
import { theme } from '../../constants';
import { Strings } from '../../constants/strings';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import { ImagePickerResult, pickImage } from '../../utils/imagePicker';
import DatePicker from 'react-native-date-picker';
import { Validation } from '../../utils/validation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ToastManager from './ToastManager';
import { UploadState, useImageUpload } from '../../hooks/useImageUpload';


interface AddMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (memberData: any) => void;
    onSuccessClose: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    visible,
    onClose,
    onSave,
    onSuccessClose,
}) => {
    const [memberName, setMemberName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [relationshipType, setRelationshipType] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [profileImage, setProfileImage] = useState<ImagePickerResult | null>(null);
    const [imageUploadState, resetImageUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null,
        uploadedUrl: null,
        isRetrying: false,
        retryCount: 0,
    });

    // Error states for validation
    const [errors, setErrors] = useState({
        name: '',
        dateOfBirth: '',
        relationshipType: ''
    });

    useEffect(() => {
        if (onSuccessClose) {
            onClose();
            handleClose();
        }
    }, [onSuccessClose]);




    const {
        uploadState,
        uploadImage,
    } = useImageUpload({
        containerName: 'user',
        maxRetries: 3,
        retryDelay: 1000,
        onUploadStart: () => {

            console.log('Upload started');
        },
        onUploadProgress: (progress) => {
            resetImageUploadState(prev => ({ ...prev, progress }));
            console.log(`Upload progress: ${progress}%`);
        },
        onUploadSuccess: (url) => {
            resetImageUploadState(prev => ({ ...prev, uploadedUrl: url }));
            console.log('Upload successful:', url);
            // ToastManager.success('Success', 'Image uploaded successfully');
        },
        onUploadError: (error) => {
            resetImageUploadState(prev => ({ ...prev, error }));
            console.error('Upload error:', error);
            ToastManager.error('Upload Failed', error);
        },
        onUploadComplete: () => {
            resetImageUploadState(prev => ({ ...prev, progress: 0 }));
            console.log('Upload completed');
        },
    });

    const handleImagePicker = async (result: ImagePickerResult) => {
        try {
            console.log("result===???", result);
            if (result && result.uri) {
                setProfileImage(result);
                const uploadResult = await uploadImage(result);
                if (uploadResult.success) {
                    console.log('Image uploaded successfully:', uploadResult);
                } else {
                    console.error('Image upload failed:', uploadResult.error);
                }

            }
        } catch (error) {
            console.error('Error handling image:', error);
            Alert.alert('Error', 'Failed to handle image');
        }
    };

    const handleDateChange = (selectedDate: Date) => {
        setDateOfBirth(selectedDate);
        // Validate date when user selects a new date
        if (errors.dateOfBirth) {
            validateDateOfBirth(selectedDate);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) {
            return Strings.AUTH.DATE_OF_BIRTH_PLACEHOLDER;
        }
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Validation functions
    const validateName = (name: string) => {
        if (!Validation.validateRequired(name)) {
            setErrors(prev => ({ ...prev, name: 'Member name is required' }));
            return false;
        } else if (!Validation.validateMemberName(name)) {
            setErrors(prev => ({ ...prev, name: 'Name must be 2-30 characters long and contain only letters and spaces' }));
            return false;
        } else {
            setErrors(prev => ({ ...prev, name: '' }));
            return true;
        }
    };

    const validateDateOfBirth = (date: Date | null) => {
        if (!date) {
            setErrors(prev => ({ ...prev, dateOfBirth: 'Date of birth is required' }));
            return false;
        } else {
            setErrors(prev => ({ ...prev, dateOfBirth: '' }));
            return true;
        }
    };

    const validateRelationshipType = (relationship: string) => {
        if (!Validation.validateRequired(relationship)) {
            setErrors(prev => ({ ...prev, relationshipType: 'Relationship type is required' }));
            return false;
            // } else if (!Validation.validateRelationshipType(relationship)) {
            //     setErrors(prev => ({ ...prev, relationshipType: 'Please select a valid relationship type' }));
            //     return false;

        } else if (relationship.length < 3) {
            setErrors(prev => ({ ...prev, relationshipType: 'Please type a minimum of 3 characters' }));
            return false;

        } else {
            setErrors(prev => ({ ...prev, relationshipType: '' }));
            return true;
        }
    };

    // Handle input changes with validation
    const handleNameChange = (text: string) => {
        setMemberName(text);
        if (errors.name) {
            validateName(text);
        }
    };

    const handleRelationshipChange = (text: string) => {
        setRelationshipType(text);
        if (errors.relationshipType) {
            validateRelationshipType(text);
        }
    };

    const handleSave = () => {
        // Validate all fields
        const isNameValid = validateName(memberName);
        const isDateValid = validateDateOfBirth(dateOfBirth);
        const isRelationshipValid = validateRelationshipType(relationshipType);

        // If any validation fails, don't proceed
        if (!isNameValid || !isDateValid || !isRelationshipValid) {
            return;
        }

        const memberData = {
            name: memberName.trim(),
            dateOfBirth: formatDate(dateOfBirth),
            relationshipType: relationshipType.trim(),
            profileImage: profileImage,
        };

        onSave(memberData);
    };

    const handleClose = () => {
        setMemberName('');
        setDateOfBirth(null);
        setRelationshipType('');
        setProfileImage(null);
        setErrors({
            name: '',
            dateOfBirth: '',
            relationshipType: ''
        });
        onClose();
    };


    const handleImageError = (error: string) => {
        ToastManager.error('Error', error);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={(e) => {
                        e.stopPropagation();
                        Keyboard.dismiss();
                    }}
                >
                    <KeyboardAwareScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        enableOnAndroid={true}
                        enableAutomaticScroll={true}
                        extraScrollHeight={120}
                        keyboardOpeningTime={250}
                    >
                        {/* Drag Handle */}
                        <View style={styles.dragHandle} />

                        {/* Profile Photo Upload */}
                        <View style={styles.photoSection}>
                            <ImagePickerComponent
                                progress={imageUploadState?.progress}
                                loading={uploadState.isUploading}
                                defaultIcon={SVG.uploadImageMember}
                                onImageSelected={handleImagePicker}
                                onError={handleImageError}
                                imageUri={profileImage?.uri}
                                options={{
                                    allowsEditing: true,
                                    aspect: [1, 1],
                                    quality: 0.8,
                                }}
                                style={styles.photoContainer}
                            />
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formSection}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    label={Strings.AUTH.MEMBER_NAME}
                                    value={memberName}
                                    onChangeText={handleNameChange}
                                    placeholder={Strings.AUTH.MEMBER_NAME_PLACEHOLDER}
                                    keyboardType="default"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    variant="outlined"
                                    error={errors.name}
                                    maxLength={30}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>{Strings.AUTH.DATE_OF_BIRTH}</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={[
                                        styles.dateInput,
                                        errors.dateOfBirth && styles.errorInput
                                    ]}
                                >
                                    <Text style={[
                                        styles.dateText,
                                        !dateOfBirth && styles.placeholderText
                                    ]}>
                                        {formatDate(dateOfBirth)}
                                    </Text>
                                    <SVG.chevronRight width={moderateScale(16)} height={moderateScale(16)} />
                                </TouchableOpacity>
                                {errors.dateOfBirth ? (
                                    <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                                ) : null}
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    label={Strings.AUTH.TYPE_OF_RELATIONSHIP}
                                    value={relationshipType}
                                    onChangeText={handleRelationshipChange}
                                    placeholder={Strings.AUTH.TYPE_OF_RELATIONSHIP_PLACEHOLDER}
                                    keyboardType="default"
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                    variant="outlined"
                                    error={errors.relationshipType}
                                    maxLength={15}
                                />
                            </View>
                        </View>

                        {/* Save Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title={Strings.AUTH.SAVE}
                                onPress={handleSave}
                                variant="primary"
                                size="medium"
                                style={styles.saveButton}
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Date Picker */}
            <DatePicker
                modal
                open={showDatePicker}
                date={dateOfBirth || new Date()}
                mode="date"
                maximumDate={new Date()}
                onConfirm={(date) => {
                    setShowDatePicker(false);
                    handleDateChange(date);
                }}
                onCancel={() => {
                    setShowDatePicker(false);
                }}
                title="Select Date of Birth"
                confirmText="Confirm"
                cancelText="Cancel"
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        maxHeight: '90%',
        minHeight: '75%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: theme.spacing.xs,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    closeButton: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    closeButtonText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.blue,
    },
    headerTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.text,
    },
    placeholder: {
        width: moderateScale(60),
    },
    dragHandle: {
        width: moderateScale(40),
        height: moderateScale(4),
        backgroundColor: '#D1D5DB',
        borderRadius: moderateScale(2),
        alignSelf: 'center',
        marginBottom: theme.spacing.lg,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    photoSection: {
        alignItems: 'center',
    },
    photoContainer: {
    },
    profileImage: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: theme.colors.surface,
    },
    photoPlaceholder: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'solid',
    },
    photoText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    formSection: {
        marginBottom: theme.spacing.xs,
    },
    inputContainer: {
        marginVertical: theme.spacing.xs,
    },
    inputLabel: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.sm,
        color: '#374151',
        marginBottom: theme.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: moderateScale(8),
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.white,
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: moderateScale(30),
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.white,
        minHeight: moderateScale(50),
    },
    dateText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.text,
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    bottomContainer: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    buttonContainer: {
        marginTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
    },
    saveButton: {
        width: '100%',
        backgroundColor: theme.colors.blue,
        paddingVertical: theme.spacing.md,
    },
    errorText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.error,
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.xs,

    },
    errorInput: {
        borderColor: theme.colors.error,
        borderWidth: 2
    },
});
