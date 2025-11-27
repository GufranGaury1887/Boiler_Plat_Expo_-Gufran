import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    Platform,
} from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import DatePicker from 'react-native-date-picker';

interface ReminderCalendarProps {
    onSelectDateTime: (date: Date) => void;
    selectedDateTime?: Date;
}

export const ReminderCalendar: React.FC<ReminderCalendarProps> = ({
    onSelectDateTime,
    selectedDateTime,
}) => {
    // Initialize with minimum 30 minutes from now
    const getInitialDate = () => {
        const now = new Date();
        // Add 30 minutes to current time
        now.setMinutes(now.getMinutes() + 30);
        
        // Round to nearest 30-minute slot
        const minutes = now.getMinutes();
        if (minutes < 30) {
            now.setMinutes(30);
        } else if (minutes > 30) {
            now.setMinutes(60);
        }
        
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    };

    // Get minimum date (current time, not 30 minutes ahead)
    // We'll handle the 30-minute buffer in the validation
    const getMinimumDate = () => {
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        return now;
    };

    const [date, setDate] = useState(selectedDateTime || getInitialDate());
    const [minimumDate, setMinimumDate] = useState(getMinimumDate());
    const [isFutureTime, setIsFutureTime] = useState(true);

    // Check if selected time is at least 30 minutes in the future
    useEffect(() => {
        const checkIfFutureTime = () => {
            const now = new Date();
            const minimumAllowedTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
            setIsFutureTime(date >= minimumAllowedTime);
            
            // Update minimum date
            setMinimumDate(getMinimumDate());
        };

        checkIfFutureTime();
        // Check every second to update button state and minimum date
        const interval = setInterval(checkIfFutureTime, 1000);

        return () => clearInterval(interval);
    }, [date]);

    const handleDateChange = (newDate: Date) => {
        setDate(newDate);
        onSelectDateTime(newDate);
    };

    return (
        <View style={styles.container}>

            {/* Date Time Picker */}
            <View style={styles.pickerContainer}>
                <DatePicker
                    mode='datetime'
                    date={date}
                    minimumDate={minimumDate}
                    minuteInterval={30}
                    onDateChange={handleDateChange}
                />
            </View>

            {/* Validation Info */}
            {!isFutureTime && (
                <Text style={styles.validationText}>
                    Reminder must be at least 60 minutes in the future
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.lg,
    },
    title: {
        fontFamily: Fonts.outfitSemiBold,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.black,
        marginBottom: theme.spacing.md,
    },
    pickerContainer: {
        alignItems: 'center',
        borderColor: theme.colors.border,
        borderRadius: moderateScale(12),
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.background,
        minHeight: moderateScale(250),
    },
    validationText: {
        fontFamily: Fonts.outfitRegular,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.cancelButton,
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },
});
