import React, { useState, useRef, use } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Platform,
  Keyboard,
} from 'react-native';
import { Button, hideLoader, showLoader, TextInput } from '../../components/common';
import { ImagePickerComponent } from '../../components/common/ImagePicker';
import { theme } from '../../constants';
import { Strings } from '../../constants/strings';
import { validateEmail, validatePassword, validatePhoneNumber, validateRequired, ImagePickerResult } from '../../utils';
import { getApiErrorInfo, useRegister } from '../../services/authService';
import { moderateScale, verticalScale } from '../../utils/scaling';
import { Fonts } from '../../constants/Fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Images from '../../assets/images';
import SVG from '../../assets/icons';
import ToastManager from '../../components/common/ToastManager';
import { useImageUpload } from '../../hooks/useImageUpload';
import { UploadState } from '../../hooks';
interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [isChecked, setIsChecked] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastImageResult, setLastImageResult] = useState<ImagePickerResult | null>(null);
  const registerMutation = useRegister();
  const [ imageUploadState, resetImageUploadState ] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedUrl: null,
    isRetrying: false,
    retryCount: 0,
  });


  // Refs for password fields
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  
  // Image upload hook
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
    },
    onUploadSuccess: (url) => {
      resetImageUploadState(prev => ({ ...prev, uploadedUrl: url }));
      console.log('Upload successful:', url);
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

  const handleImageSelected = async (result: ImagePickerResult) => {
    setSelectedImage(result.uri);
    setLastImageResult(result);
    // Start upload using the hook
    const uploadResult = await uploadImage(result);
    if (uploadResult.success) {
      console.log('Image uploaded successfully:', uploadResult);
    } else {
      console.error('Image upload failed:', uploadResult.error);
    }
  };



  const handleImageError = (error: string) => {
    ToastManager.error('Error', error);
  };

  const validateForm = () => {
    if (!validateRequired(formData.name)) {
      ToastManager.error(Strings.AUTH.NAME_REQUIRED);
      return false;
    }

    if (!formData.email.trim()) {
      ToastManager.error(Strings.AUTH.EMAIL_REQUIRED);
      return false;
    } else if (!validateEmail(formData.email)) {
      ToastManager.error(Strings.AUTH.VALID_EMAIL_REQUIRED);
      return false;
    }
    if (!formData.phone_number.trim()) {
      ToastManager.error(Strings.AUTH.PHONE_NUMBER_REQUIRED);
      return false;
    } else if (!validatePhoneNumber(formData.phone_number)) {
      ToastManager.error(Strings.AUTH.VALID_PHONE_NUMBER_REQUIRED);
      return false;
    }

    if (!formData.password.trim()) {
      ToastManager.error(Strings.AUTH.PASSWORD_REQUIRED);
      return false;
    } else if (!validatePassword(formData.password)) {
      ToastManager.error(Strings.AUTH.PASSWORD_MIN_LENGTH);
      return false;
    }

    if (!formData.confirmPassword.trim()) {
      ToastManager.error(Strings.AUTH.CONFIRM_PASSWORD_REQUIRED);
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      ToastManager.error( Strings.AUTH.PASSWORDS_DO_NOT_MATCH);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {    

    if (!validateForm()) return;
    Keyboard.dismiss();
    showLoader();
    
      await registerMutation.mutateAsync({
        email: formData.email,
        name: formData.name,
        profileImage: lastImageResult?.fileName || '',
        phoneNumber: formData.phone_number,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }, {
        onSuccess: (response: any) => {
          if (response.status === 409) {
            ToastManager.error(response.data.message || 'OTP verification required');
            navigation.navigate('OTPVerify', { email: formData.email });
          } else {
          navigation.navigate('OTPVerify', { email: formData.email });
          }
        },
        onError: (error) => {
          const errorInfo = getApiErrorInfo(error);
          console.log('Register error===>>>>', errorInfo);
            ToastManager.error(errorInfo.message);
            console.error('Register error:', errorInfo);
        },
        onSettled: () => {
          hideLoader(); 
        }
      });

      
  };



  const onNameChange = (text: string) => {
    const trimmedText = text.trimStart();
    setFormData(prev => ({ ...prev, name: trimmedText }));
  };

  const onEmailChange = (text: string) => {
    const trimmedText = text.trim();
    setFormData(prev => ({ ...prev, email: trimmedText }));
  };

  const onPhoneChange = (text: string) => {
    // Remove all non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, phone_number: numericText }));
  };

  const onPasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setFormData(prev => ({ ...prev, password: trimmedText }));
  };

  const onConfirmPasswordChange = (text: string) => {
    const trimmedText = text.trim();
    setFormData(prev => ({ ...prev, confirmPassword: trimmedText }));
  };


  return (
    <ImageBackground
      source={Images.backgroundImage}
      style={styles.backgroundImage}
      resizeMode="contain"
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.background}
          translucent={Platform.OS === 'android' ? true : false}
        />
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={Platform.OS === 'ios' ? 100 : 150}
          extraHeight={Platform.OS === 'ios' ? 100 : 150}
          showsVerticalScrollIndicator={false}
          enableAutomaticScroll={true}
          scrollEventThrottle={16}
          keyboardOpeningTime={250}
          enableResetScrollToCoords={false}
        >
          <TouchableOpacity style={{marginLeft: theme.spacing.md, marginTop: theme.spacing.md}} onPress={() => navigation.reset({index: 0, routes: [{name: 'Login'}]})}>
            <SVG.arrowLeft height={moderateScale(30)} width={moderateScale(30)} style={styles.logoIcon} />
          </TouchableOpacity>
          <View style={styles.logoSection}>
            <ImagePickerComponent
              progress={imageUploadState?.progress}
              loading={uploadState.isUploading}
              defaultIcon={SVG.uploadImageProfile}
              onImageSelected={handleImageSelected}
              onError={handleImageError}
              imageUri={selectedImage}
              options={{
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              }}
              style={styles.imagePicker}
            />
          </View>

          {/* Login Form */}
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>{Strings.AUTH.SIGN_UP_TITLE}</Text>
            <View style={styles.form}>
              <TextInput
                label={Strings.COMMON.NAME}
                value={formData.name}
                onChangeText={onNameChange}
                placeholder={Strings.COMMON.NAME_PLACEHOLDER}
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={false}
                variant="outlined"
                leftIcon={SVG.user}
                maxLength={30}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />

              <TextInput
                ref={emailRef}
                label={Strings.COMMON.EMAIL}
                value={formData.email}
                onChangeText={onEmailChange}
                placeholder={Strings.COMMON.EMAIL_PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                variant="outlined"
                leftIcon={SVG.Email}
                maxLength={50}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />

              <TextInput
                ref={phoneRef}
                label={Strings.COMMON.PHONE}
                value={formData.phone_number}
                onChangeText={onPhoneChange}
                placeholder={Strings.COMMON.PHONE_PLACEHOLDER}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                variant="outlined"
                leftIcon={SVG.phone}
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />

              <TextInput

                ref={passwordRef}
                label={Strings.COMMON.PASSWORD}
                value={formData.password}
                onChangeText={onPasswordChange}
                placeholder={Strings.COMMON.PASSWORD_PLACEHOLDER}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={SVG.Password}
                showPasswordToggle
                variant="outlined"
                maxLength={30}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              />
              <TextInput
                ref={confirmPasswordRef}
                label={Strings.COMMON.CONFIRM_PASSWORD}
                value={formData.confirmPassword}
                onChangeText={onConfirmPasswordChange}
                placeholder={Strings.COMMON.PASSWORD_PLACEHOLDER}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={SVG.Password}
                showPasswordToggle
                variant="outlined"
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={() => handleRegister()}
              />

              <View style={styles.TandCStyle}>
                <TouchableOpacity  onPress={() => setIsChecked(!isChecked)}>
                  {isChecked ? <SVG.check  width={moderateScale(25)} height={moderateScale(25)}  /> : <SVG.uncheck width={moderateScale(25)} height={moderateScale(25)}  />}
                </TouchableOpacity>
                <Text style={styles.TandCText}>
                  <Text style={styles.iAgreeToStyle}>By signing up, I agree to My Sport Club{'\n'}</Text>
                  <Text onPress={() => Linking.openURL('https://www.google.com')} style={styles.underlineTxt}>Terms & Conditions</Text>
                  <Text style={styles.iAgreeToStyle}> | </Text>
                  <Text onPress={() => Linking.openURL('https://www.google.com')} style={styles.underlineTxt}>Privacy Policy</Text>
                </Text>
              </View>

              <Button
                disabled={!isChecked}
                title={Strings.COMMON.SIGN_UP}
                onPress={handleRegister}
                variant="primary"
                size="medium"
              />

            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
  },
  // Logo Section
  logoSection: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(30),
  },
  logoIcon: {
    marginBottom: theme.spacing.md,
  },
  imagePicker: {
    width: moderateScale(150),
    height: moderateScale(150),
  },
  // Login Section
  loginSection: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
    paddingTop: moderateScale(20),
    paddingBottom: theme.spacing.xl,
  },
  loginTitle: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(24),
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  form: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  TandCStyle: {
    flex: 1,
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  TandCText: {
    marginLeft: theme.spacing.sm,
  },
  iAgreeToStyle: {
    fontFamily: Fonts.outfitRegular,
    fontSize: moderateScale(15),
    color: theme.colors.black
  }, underlineTxt: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: moderateScale(15),
    color: theme.colors.appleGreen,
    textDecorationLine: 'underline'
  }
});
