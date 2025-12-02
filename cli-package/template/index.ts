import { registerRootComponent } from 'expo';
import "react-native-gesture-handler";
import { Platform } from 'react-native';
import App from './App';
import messaging from "@react-native-firebase/messaging";
import NotificationManager from './src/utils/NotificationManager';
import notifee from '@notifee/react-native';

if (Platform.OS === "android") {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("setBackgroundMessageHandler>>>>>>");
      NotificationManager.displayNotification(remoteMessage);
    });
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log("invokeAndroidBackgroundEvent>>>>>>");
      NotificationManager.invokeAndroidBackgroundEvent(type, detail);
    });

  
}



registerRootComponent(App);
