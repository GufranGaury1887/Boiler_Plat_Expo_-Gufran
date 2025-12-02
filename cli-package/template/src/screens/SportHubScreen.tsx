import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../constants';
import { moderateScale } from '../utils/scaling';
import { Fonts } from '../constants/Fonts';
import SVG from '../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SportHubScreenProps } from '../types';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundColor: string;
  notificationCount: number;
  onPress: () => void;
}

export const SportHubScreen: React.FC<SportHubScreenProps> = ({ navigation }) => {
  const featureCards: FeatureCard[] = [
    {
      id: 'teams',
      title: 'Teams',
      description: 'Join club to start your club journey.',
      icon: <SVG.UsersIcon width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#E8D5F2',
      notificationCount: 2,
      onPress: () => navigation.navigate('Home'),
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Track training, games, and team events with filters and reminders.',
      icon: <SVG.NotificationIcon width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#D5F2E8',
      notificationCount: 3,
      onPress: () => console.log('Calendar pressed'),
    },
    {
      id: 'raffles',
      title: 'Raffles',
      description: 'Support & Win: Buy Raffle Tickets in the App',
      icon: <SVG.icAdd width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#D5E8F2',
      notificationCount: 3,
      onPress: () => console.log('Raffles pressed'),
    },
    {
      id: 'chat',
      title: 'Chat',
      description: 'Connect, coordinate, and cheer on—right from your team group chat.',
      icon: <SVG.NotificationIcon width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#F2D5E8',
      notificationCount: 1,
      onPress: () => console.log('Chat pressed'),
    },
    {
      id: 'shop',
      title: 'Shop',
      description: 'Shop Team Gear & Food & Drinks to Support the Club',
      icon: <SVG.icAdd width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#E8D5F2',
      notificationCount: 3,
      onPress: () => console.log('Shop pressed'),
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Selling tickets to fundraisers, etc.',
      icon: <SVG.NotificationIcon width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#F2E8D5',
      notificationCount: 3,
      onPress: () => console.log('Events pressed'),
    },
    {
      id: 'volunteer',
      title: 'Volunteer Opportunities',
      description: 'Support the club with your time and talent.',
      icon: <SVG.UsersIcon width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#D5E8F2',
      notificationCount: 3,
      onPress: () => console.log('Volunteer pressed'),
    },
    {
      id: 'membership',
      title: 'Membership',
      description: 'Unlock Elite Access to Exclusive Facilities & Events',
      icon: <SVG.icAdd width={moderateScale(40)} height={moderateScale(40)} />,
      backgroundColor: '#E8D5F2',
      notificationCount: 3,
      onPress: () => console.log('Membership pressed'),
    },
  ];

  const renderFeatureCard = (card: FeatureCard) => (
    <TouchableOpacity
      key={card.id}
      style={[styles.featureCard, { backgroundColor: card.backgroundColor }]}
      onPress={card.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {card.icon}
        </View>
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>{card.notificationCount}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardDescription}>{card.description}</Text>
    </TouchableOpacity>
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
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SVG.arrowLeft_white width={moderateScale(25)} height={moderateScale(25)} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>MY SPORT HUB</Text>
          <Text style={styles.subtitle}>
            Your all-in-one center for team updates, events, and performance tracking.
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.cardsGrid}>
            {featureCards.map(renderFeatureCard)}
          </View>
        </ScrollView>
      </View>
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
    backgroundColor: theme.colors.blue,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: theme.spacing.xl,
  },
  titleSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  mainTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: moderateScale(28),
    color: theme.colors.blue,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationBadge: {
    backgroundColor: theme.colors.error,
    borderRadius: moderateScale(12),
    minWidth: moderateScale(24),
    height: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  notificationText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
  },
  cardTitle: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontFamily: Fonts.outfitRegular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: moderateScale(18),
  },
});

export default SportHubScreen;
