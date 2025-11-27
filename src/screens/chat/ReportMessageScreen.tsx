import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView,
    TextInput,
    Alert,
    StatusBar
} from "react-native";
import { theme } from "../../constants";
import { moderateScale } from "../../utils/scaling";
import { Fonts } from "../../constants/Fonts";

interface ReportMessageScreenProps {
    navigation: any;
    route: {
        params: {
            message: any;
            memberId: string;
            onReportSubmit?: (reason: string, message: any) => void;
        };
    };
}

export const ReportMessageScreen: React.FC<ReportMessageScreenProps> = ({ navigation, route }) => {
    const { message, memberId, onReportSubmit } = route.params;
    const [reportReason, setReportReason] = useState('');

    useEffect(() => {
        // Set navigation options
        navigation.setOptions({
            presentation: 'transparentModal',
            headerShown: false,
        });
    }, [navigation]);

    const handleReportSubmit = () => {
        if (!reportReason.trim()) {
            Alert.alert("Error", "Please provide a reason for reporting this message.");
            return;
        }

        // Call the callback function if provided
        if (onReportSubmit) {
            onReportSubmit(reportReason, message);
        }

        // Log the report
        console.log("Reporting message:", {
            messageId: message?._id,
            reason: reportReason,
            reportedBy: memberId
        });

        Alert.alert(
            "Report Submitted",
            "Your report has been submitted successfully. We will review it shortly.",
            [
                {
                    text: "OK",
                    onPress: () => navigation.goBack()
                }
            ]
        );
    };

    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <TouchableOpacity 
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <TouchableOpacity 
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Report Message</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalBody} 
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.modalSubtitle}>
                                Why are you reporting this message?
                            </Text>

                            <TextInput
                                style={styles.reportInput}
                                placeholder="Please describe the issue..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={6}
                                value={reportReason}
                                onChangeText={setReportReason}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleClose}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleReportSubmit}
                            >
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: moderateScale(16),
        width: '90%',
        maxHeight: '80%',
        overflow: 'hidden',
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(18),
        color: theme.colors.black,
    },
    closeButton: {
        fontSize: moderateScale(24),
        color: theme.colors.textSecondary,
        fontWeight: '300',
    },
    modalBody: {
        padding: moderateScale(16),
        flexGrow: 1,
    },
    modalSubtitle: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.textSecondary,
        marginBottom: moderateScale(12),
    },
    reportInput: {
        fontFamily: Fonts.outfitRegular,
        fontSize: moderateScale(14),
        color: theme.colors.black,
        backgroundColor: theme.colors.lightLavenderGray,
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        minHeight: moderateScale(120),
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        padding: moderateScale(16),
    },
    cancelButton: {
        flex: 1,
        paddingVertical: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: moderateScale(8),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.black,
    },
    submitButton: {
        flex: 1,
        paddingVertical: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.blue,
        borderRadius: moderateScale(8),
        marginLeft: moderateScale(8),
    },
    submitButtonText: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: moderateScale(16),
        color: theme.colors.white,
    },
});

