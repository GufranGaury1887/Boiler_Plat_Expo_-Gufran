import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Button } from './Button';
import { theme } from '@constants';
import { moderateScale } from '@utils/scaling';
import { Fonts } from '@constants/Fonts';


interface SetReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (reminderDateTime: Date) => void;
    onSuccessClose?: boolean;
    maxDate?: string;
}

export const SetReminderModal: React.FC<SetReminderModalProps> = ({
    visible,
    onClose,
    onSave,
    onSuccessClose = false,
    maxDate
}) => {

    const screenHeight = Dimensions.get('window').height;
    const bottomSheetHeight = screenHeight * 0.6; // 60% of screen height
    const translateY = useRef(new Animated.Value(bottomSheetHeight)).current;

    // Calculate the minimum allowed date (Current time + 30 min, rounded to nearest 30-min interval)
    const getCalculatedMinimumDate = () => {
        const now = new Date();
        // Add 30 minutes
        now.setMinutes(now.getMinutes() + 30);

        // Round up to the nearest 30-minute interval (:00 or :30)
        const minutes = now.getMinutes();
        if (minutes > 0 && minutes <= 30) {
            // Round up to :30
            now.setMinutes(30);
        } else if (minutes > 30) {
            // Round up to next hour :00
            now.setHours(now.getHours() + 1);
            now.setMinutes(0);
        }

        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    };

    // Initialize with calculated minimum date
    const getInitialDate = () => {
        return getCalculatedMinimumDate();
    };

    // Get minimum date for picker
    const getMinimumDate = () => {
        return getCalculatedMinimumDate();
    };

    const [date, setDate] = useState(getInitialDate());
    const [minimumDate, setMinimumDate] = useState(getMinimumDate());
    const [isFutureTime, setIsFutureTime] = useState(true);

    // Convert maxDate string to Date object
    const getMaximumDate = () => {
        if (!maxDate) return undefined;
        const parsedDate = new Date(maxDate);
        return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    };

    // Animate modal on visibility change
    useEffect(() => {
        if (visible) {
            showBottomSheet();
        }
    }, [visible]);

    useEffect(() => {
        if (onSuccessClose) {
            handleClose();
        }
    }, [onSuccessClose]);

    // Check if selected time is valid
    useEffect(() => {
        const checkIfFutureTime = () => {
            const minDate = getCalculatedMinimumDate();
            setIsFutureTime(date >= minDate);

            // Update minimum date for picker
            setMinimumDate(minDate);
        };

        checkIfFutureTime();
        // Check every second to update button state and minimum date
        const interval = setInterval(checkIfFutureTime, 1000);

        return () => clearInterval(interval);
    }, [date]);

    // Bottom sheet animation functions
    const showBottomSheet = () => {
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    };

    const hideBottomSheet = () => {
        Animated.timing(translateY, {
            toValue: bottomSheetHeight,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            translateY.setValue(bottomSheetHeight);
            onClose();
        });
    };

    // PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                translateY.setOffset((translateY as any)._value);
                translateY.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow downward movement
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                translateY.flattenOffset();

                // If swiped down more than 100px or with high velocity, close the modal
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    hideBottomSheet();
                } else {
                    // Snap back to original position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }).start();
                }
            },
        })
    ).current;

    const handleSave = () => {
        onSave(date);
    };

    const handleClose = () => {
        // Reset to next available time slot when closing
        setDate(getInitialDate());
        hideBottomSheet();
    };

    const handleDateChange = (newDate: Date) => {
        console.log("Selected date:", newDate);
        console.log("Current time:", new Date());

        // Just set the date, validation will be done by the button enable/disable state
        setDate(newDate);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.dragHandle} {...panResponder.panHandlers} />
                    <View style={styles.content}>
                        <Text style={styles.modalTitle}>
                            Set Reminder
                        </Text>

                        {/* Date Time Picker */}
                        <View style={styles.pickerContainer}>
                            <DatePicker
                                theme='auto'
                                mode='datetime'
                                date={date}
                                minimumDate={minimumDate}
                                maximumDate={getMaximumDate()}
                                minuteInterval={30}
                                onDateChange={handleDateChange}
                            />
                        </View>

                        {/* Save Button */}
                        <View style={styles.buttonContainer}>
                            <Button
                                title='Submit'
                                onPress={handleSave}
                                variant="primary"
                                size="medium"
                                style={styles.saveButton}
                                disabled={!isFutureTime}
                            />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: moderateScale(20),
        borderTopRightRadius: moderateScale(20),
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.xl,
        height: '45%',
        maxHeight: '45%',
    },

    dragHandle: {
        width: moderateScale(40),
        height: moderateScale(4),
        backgroundColor: theme.colors.border,
        borderRadius: moderateScale(2),
        alignSelf: 'center',
        marginBottom: theme.spacing.sm,
    },
    content: {
        flex: 1,
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontFamily: Fonts.outfitSemiBold,
        color: theme.colors.text,
    },
    pickerContainer: {
        alignItems: 'center',
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
});
