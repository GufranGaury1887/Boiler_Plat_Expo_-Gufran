import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import SVG from '../../assets/icons';
import Images from '../../assets/images';

interface TeamCardProps {
  team: {
    isPrivate?: boolean;
    id?: string | number;
    name?: string;
    teamName?: string;
    teamImageUrl?: string;
    profileImage?: string;
    logo?: string;
    members?: number;
    address?: string;
    location?: string;
    teamCode?: string;
    color?: string;
    description?: string;
    teamAddress?: string;
    onJoinPress?: () => void;
    onChatPress?: () => void;
    onCancelPress?: () => void;
    onJoin?: boolean;
    onChat?: boolean;
    onCancel?: boolean;
    teamCodeShow?: boolean;
    totalMembers?: number;
    teamProfileImage?: string;
  };
  onPress?: () => void;
  onJoinPress?: () => void;
  onChatPress?: () => void;
  onCancelPress?: () => void;
  onJoin?: boolean;
  onChat?: boolean;
  onCancel?: boolean;
  teamCodeShow?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  onPress, 
  onJoinPress, 
  onChatPress,
  onCancelPress, 
  onCancel,
  onJoin, 
  onChat, 
  teamCodeShow 

}) => {
  const [imageError, setImageError] = useState(false);
    
  const teamName = team?.teamName || team?.teamName || 'Unnamed Team';
  const teamImage = team?.teamImageUrl || team?.teamProfileImage || team?.profileImage;
  const memberCount = team?.members || team?.totalMembers || 0;
  const address = team?.address || team?.location || '';
  const teamCode = team?.teamCode || '';
  const teamAddress = team?.teamAddress || '';
  const privateTeam = team?.isPrivate || '';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.logoContainer}>
        {teamImage && !imageError ? (
          <Image source={{ uri: teamImage }} style={styles.logo} 
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

      {/* Team Information */}
      <View style={styles.infoContainer}>
        {/* Team Name */}
        <Text style={styles.teamName} numberOfLines={1}>
          {teamName}
        </Text>

        {/* Members Count */}
        <View style={styles.membersRow}>
          <View style={styles.membersIcon}>
            <SVG.UsersIcon width={moderateScale(16)} height={moderateScale(16)} />
          </View>
          <Text style={styles.membersText}>
            {memberCount > 0 ? memberCount : 'No'} {memberCount <= 1 ? 'member' : 'members'}
          </Text>
        </View>

        {/* Address */}
        {teamAddress != "" && (
          <View style={styles.addressRow}>
            <SVG.locationIcon width={moderateScale(16)} height={moderateScale(16)} />
            <Text style={styles.addressText} numberOfLines={1}>
              {teamAddress}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons - Positioned on the right, vertically centered */}
      {onJoin && (
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.actionButtonContainer} 
          onPress={onJoinPress}
          activeOpacity={0.8}>
          <View style={[styles.joinButton, { width: !privateTeam ? moderateScale(50) : moderateScale(60), height: moderateScale(25) }]}>
            <Text style={styles.joinButtonText}>{!privateTeam ? 'Join' : 'Request'}</Text>
          </View>
        </TouchableOpacity>
      )}

      {onCancel && (
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.actionButtonContainer} 
          onPress={onCancelPress}
          activeOpacity={0.8}>
          <View style={[styles.cancelButton, { width: moderateScale(50), height: moderateScale(25) }]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </View>
        </TouchableOpacity>
      )}

      {teamCodeShow && (
        <View style={styles.teamCodeContainer}>
          <Text style={styles.teamCodeText}>{teamCode}</Text>
        </View>
      )}

      {/* Chat Icon - Positioned on the right, vertically centered */}
      {onChat && (
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.chatIconContainer} 
          onPress={onChatPress}
          activeOpacity={0.8}>
          <SVG.chatAppleGreenBG style= {{marginRight: moderateScale(8)}} width={moderateScale(35)} height={moderateScale(35)} />
        </TouchableOpacity>
      )}
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
  teamName: {
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
  teamCodeText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: Fonts.outfitLight,
    color: theme.colors.appleGreen,
  },
  teamCodeContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.appleGreen,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
  },
  joinButtonText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.appleGreen,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cancelButton,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
  },
  cancelButtonText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.cancelButton,
  },
  chatIconContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default TeamCard;
