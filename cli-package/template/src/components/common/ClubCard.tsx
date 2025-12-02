import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import Images from '../../assets/images';

interface ClubCardProps {
  club: {
    id?: string | number;
    name?: string;
    clubName?: string;
    clubImageUrl?: string;
    profileImage?: string;
    logo?: string;
    members?: number;
    address?: string;
    location?: string;
    clubCode?: string;
    color?: string;
    description?: string;
    clubAddress?: string;
    onJoinPress?: () => void;
    onChatPress?: () => void;
    onJoin?: boolean;
    onChat?: boolean;
    totalMembers?: number;
    clubImage?: string;
  };
  onPress?: () => void;
  onJoinPress?: () => void;
  onChatPress?: () => void;
  onJoin?: boolean;
  onChat?: boolean;
  clubCodeShow?: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onPress,
  onJoinPress,
  onChatPress,
  onJoin,
  onChat,
  clubCodeShow
}) => {
  const [imageError, setImageError] = useState(false);
  const clubName = club?.name || club?.clubName || 'Unnamed Club';
  const clubImage = club?.clubImage || club?.profileImage || club?.logo;
  const memberCount = club?.members || club?.totalMembers || 0;
  const address = club?.address || club?.location || '';
  const clubCode = club?.clubCode || '';
  const clubAddress = club?.clubAddress || '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.logoContainer}>
        {clubImage && !imageError ? (
          <Image source={{ uri: clubImage }} style={styles.logo}
            onError={() => {
              setImageError(true);
            }}
          />

        ) : (
          <View style={[styles.placeholderLogo]}>
            <Image source={Images.clubDefauldImage} style={styles.logo} />
          </View>
        )}
        {imageError && (
          <View style={styles.placeholderLogo}>
            <Image source={Images.clubDefauldImage} style={styles.logo} />
          </View>
        )}
      </View>

      {/* Club Information */}
      <View style={styles.infoContainer}>
        {/* Club Name */}
        <Text style={styles.clubName} numberOfLines={1}>
          {clubName}
        </Text>

        {/* Members Count */}
        <View style={styles.membersRow}>
          <View style={styles.membersIcon}>
            <SVG.UsersIcon width={moderateScale(16)} height={moderateScale(16)} />
          </View>
          <Text style={styles.membersText}>
            {memberCount > 0 ? memberCount : 'No'} {memberCount <= 1 ? 'member' : 'members'}
          </Text>

          <View style={styles.clubCodeContainer}>
            {onChat ? (
              <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={[styles.clubCodeText, { width: moderateScale(50), height: moderateScale(25), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.appleGreen, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.background }]}
                onPress={onChatPress}>
                <Text style={{ fontFamily: Fonts.outfitSemiBold, fontSize: theme.typography.fontSize.xs, color: theme.colors.appleGreen }}>Chat</Text>
              </TouchableOpacity>
            ) : clubCodeShow ? (
              <Text style={styles.clubCodeText}>
                {clubCode}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Address */}
        {clubAddress != "" && (
          <View style={styles.addressRow}>
            <SVG.locationIcon width={moderateScale(16)} height={moderateScale(16)} />
            <Text style={styles.addressText} numberOfLines={1}>
              {clubAddress}
            </Text>
          </View>
        )}

        {onJoin && (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.clubCodeText, { marginTop: theme.spacing.sm, alignSelf: 'flex-start', width: moderateScale(50), height: moderateScale(25), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.appleGreen, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.background }]}
            onPress={onJoinPress}>
            <Text style={{ fontFamily: Fonts.outfitSemiBold, fontSize: theme.typography.fontSize.xs, color: theme.colors.appleGreen }}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.lightLavenderGray,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  logoContainer: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
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
  placeholderText: {
    fontSize: moderateScale(24),
    fontFamily: Fonts.outfitBold,
    color: theme.colors.white,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  clubName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: Fonts.outfitSemiBold,
    color: theme.colors.text,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: moderateScale(6),
  },
  membersIcon: {
    marginRight: moderateScale(6),
  },
  membersIconText: {
    fontSize: moderateScale(14),
  },
  membersText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: Fonts.outfitLight,
    color: theme.colors.primary,
  },
  clubCodeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: Fonts.outfitLight,
    color: theme.colors.appleGreen,
    alignSelf: 'flex-end',
    marginRight: moderateScale(8),
  },
  clubCodeContainer: {
    // width: moderateScale(150),
    flex: 1,
    alignSelf: 'flex-end',
  },
  colorIndicator: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginLeft: moderateScale(8),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: moderateScale(12),
    marginRight: moderateScale(6),
  },
  addressText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: Fonts.outfitLight,
    color: theme.colors.text,
    flex: 1,
    marginLeft: moderateScale(8),
  },
  arrowContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: moderateScale(20),
    fontFamily: Fonts.outfitBold,
    color: theme.colors.textSecondary,
  },
  cancelButton: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: Fonts.outfitLight,
    color: theme.colors.appleGreen,
    alignSelf: 'flex-end',
    marginRight: moderateScale(8),
  },
  cancelButtonText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.cancelButton,
  },
});

export default ClubCard;
