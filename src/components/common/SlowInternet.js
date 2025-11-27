import React, { FC } from 'react'
import { Text, View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SVG from '../../assets/icons'
import { moderateScale } from '../../utils/scaling'
import { Fonts } from '../../constants/Fonts'

export const SlowInternet = ({ isLoading, message }) =>
  isLoading ? (
    <SafeAreaView style={styles.mainView}>
      <View style={styles.contentView}>
        <View style={styles.iconContainer}>
          <SVG.no_wifi width={moderateScale(50)} height={moderateScale(50)} />
        </View>
        <Text style={styles.messageText}>
          {message}
        </Text>
      </View>
    </SafeAreaView>
  ) : (
    <></>
  )

const styles = StyleSheet.create({
  mainView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    marginTop: moderateScale(2),
    fontSize: moderateScale(16),
    fontFamily:Fonts.outfitBold,
  }
})
