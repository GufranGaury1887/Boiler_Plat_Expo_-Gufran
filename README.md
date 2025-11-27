# Square Payment Integration - React Native Expo

A complete implementation of Square In-App Payments SDK in an Expo React Native project with sandbox testing support.

## 🚀 Quick Start

### 1. Get Your Square Application ID

1. Visit [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create a new application or select existing one
3. Copy your **Sandbox Application ID** from the Credentials page

### 2. Configure the App

Edit `config/square.config.ts`:

```typescript
export const SQUARE_CONFIG = {
  applicationId: 'YOUR_SANDBOX_APPLICATION_ID_HERE', // Replace this!
  environment: 'SANDBOX',
  currencyCode: 'USD',
  countryCode: 'US',
};
```

### 3. Add iOS Build Script (Required for iOS)

Open `ios/square.xcworkspace` in Xcode:
1. Select your app target
2. Go to **Build Phases** tab
3. Click **+** → **New Run Script Phase**
4. Add this script:

```bash
FRAMEWORKS="${BUILT_PRODUCTS_DIR}/${FRAMEWORKS_FOLDER_PATH}"
"${FRAMEWORKS}/SquareInAppPaymentsSDK.framework/setup"
```

5. Drag it to run after "Embed Frameworks"

### 4. Run the App

```bash
# iOS
npx expo prebuild -p ios
npx expo run:ios

# Android
npx expo prebuild -p android
npx expo run:android
```

## 🧪 Testing in Sandbox

Use these test card numbers (any future exp date, any CVV):

- **Visa:** 4111 1111 1111 1111 ✅
- **Mastercard:** 5105 1051 0510 5100 ✅
- **Discover:** 6011 0000 0000 0004 ✅
- **Declined:** 4000 0000 0000 0002 ❌

Tap "📋 View Sandbox Test Cards" button in the app to see all test cards.

## 📱 Features

- ✅ Square In-App Payments SDK integration
- ✅ Secure card entry with Square's form
- ✅ Multiple purchase options (features, balance)
- ✅ Sandbox testing support
- ✅ TypeScript support
- ✅ Error handling and user feedback
- ✅ iOS & Android support

## 📂 Project Structure

```
square/
├── config/
│   └── square.config.ts          # Configuration
├── services/
│   └── PaymentService.ts         # Payment logic
├── screens/
│   └── PaymentScreen.tsx         # UI
├── types/
│   └── react-native-square-in-app-payments.d.ts
├── ios/                          # iOS native
├── android/                      # Android native
└── App.tsx                       # Entry point
```

## 📖 Full Documentation

See [SQUARE_SETUP.md](./SQUARE_SETUP.md) for:
- Complete setup instructions
- iOS & Android configuration details
- Troubleshooting guide
- Production deployment steps
- Backend integration guide
- Advanced features (Apple Pay, Google Pay)

## ⚠️ Important Notes

### Security
- **Never** commit your Production Application ID to version control
- Use Sandbox mode for all testing
- Process payments on your backend server in production

### Backend Integration Required
The current implementation uses **mock payment processing**. For production:

1. Create a backend server
2. Send card nonces to your backend
3. Process payments using Square's Payments API
4. Return results to the app

See `services/PaymentService.ts` comments for details.

## 🐛 Troubleshooting

### "Application ID not configured"
- Update `config/square.config.ts` with your Square Application ID
- Restart the app

### iOS build fails
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### Android build fails
- Ensure minSdkVersion is 24 or higher in `android/build.gradle`
- Sync Gradle files in Android Studio

## 📚 Resources

- [Square Developer Portal](https://developer.squareup.com/)
- [In-App Payments SDK Docs](https://developer.squareup.com/docs/in-app-payments-sdk/overview)
- [React Native Plugin](https://github.com/square/in-app-payments-react-native-plugin)
- [Payments API](https://developer.squareup.com/docs/payments-api/overview)

## 🆘 Support

- [Square Developer Forums](https://developer.squareup.com/forums)
- [GitHub Issues](https://github.com/square/in-app-payments-react-native-plugin/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/square-connect)

## 📝 License

This project uses Square In-App Payments SDK. Review Square's [Terms of Service](https://squareup.com/legal/general/ua).

---

**Ready to accept payments? Update your config and start testing! 💳**
