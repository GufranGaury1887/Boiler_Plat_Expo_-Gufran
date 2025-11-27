import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { moderateScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import { theme } from '../../constants';

const { width } = Dimensions.get('window');

// Custom Toast Configuration
export const toastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <View style={styles.toastContent}>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <View style={styles.toastContent}>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
  info: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <View style={styles.toastContent}>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
  warning: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, styles.warningToast]}>
      <View style={styles.toastContent}>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{text1}</Text>
          {text2 && <Text style={styles.toastMessage}>{text2}</Text>}
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    minHeight: moderateScale(40),
    width: width * 0.9,
    marginHorizontal: width * 0.05,
    borderRadius: moderateScale(16),
    marginTop: Platform.OS === 'ios' ? StatusBar.currentHeight + moderateScale(15) : moderateScale(20),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: moderateScale(12),
  },
  successToast: {
    backgroundColor: theme.colors.success,
    borderColor: '#45A049',
  },
  errorToast: {
    backgroundColor: '#F44336',
    borderColor: '#D32F2F',
  },
  infoToast: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
  },
  warningToast: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
  },
  toastTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.outfitSemiBold,
    color: theme.colors.white,
    marginBottom: moderateScale(2),
    letterSpacing: 0.2,
  },
  toastMessage: {
    fontSize: moderateScale(14),
    color: theme.colors.white,
    lineHeight: moderateScale(18),
    flexWrap: 'wrap',
    fontFamily: Fonts.outfitRegular,
  },
});
