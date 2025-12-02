import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import moment from 'moment';

interface ReminderData {
    reminderDateTime: string;
    reminderId?: string | number;
}

interface ReminderCardItemProps {
    reminderData: ReminderData;
    onDelete?: () => void;
}

export const ReminderCardItem: React.FC<ReminderCardItemProps> = ({
    reminderData,
    onDelete,
}) => {



    const handleDelete = () => {
        if (onDelete) {
            Alert.alert(
                'Delete Reminder',
                'Are you sure you want to delete this reminder?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => { },
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: onDelete,
                        style: 'destructive',
                    },
                ],
            );
        }
    };

    return (
        <View style={styles.reminderCard}>

            <View style={styles.reminderContent}>

                <Text style={styles.reminderDateTime}>
                    {moment(reminderData.reminderDateTime).format('DD MMM YYYY, h:mm A')}
                </Text>
            </View>

            {onDelete && (
                <TouchableOpacity
                    onPress={handleDelete}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <SVG.Delete
                        width={moderateScale(35)}
                        height={moderateScale(35)}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    reminderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: moderateScale(12),
        marginTop: theme.spacing.sm,
    },
    reminderContent: {
        flex: 1,
    },
    reminderDateTime: {
        fontFamily: Fonts.outfitMedium,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.black,
    },

});
