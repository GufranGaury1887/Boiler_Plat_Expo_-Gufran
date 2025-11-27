import messaging, {
  getMessaging,
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  getToken
} from "@react-native-firebase/messaging";
import { getApp } from "@react-native-firebase/app";
import { MMKV } from "react-native-mmkv";

import { Platform, PermissionsAndroid, AppState } from "react-native";
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventDetail,
  EventType,
  InitialNotification,
} from "@notifee/react-native";
import { navigationRef } from "../navigation/navigationRef";

const firebaseApp = getApp();
const messagingInstance = getMessaging(firebaseApp);
const storage = new MMKV();

class NotificationManager {
  private notifeeForegroundHandler: (() => void) | null = null;
  private onMessageListener: (() => void) | null = null;
  private pendingNavigationData: any = null; // Store navigation data when app is not ready

  private backgroundAndroidEventHandler:
    | ((type: EventType, detail: EventDetail) => void)
    | null = null;

  public async initialize(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();

      if (hasPermission) {
        await this.setupFCMListeners();
        await this.handleInitialNotification();
        console.log("NotificationManager initialized successfully");
      } else {
        console.log("FCM permissions not granted");
      }
    } catch (error) {
      console.error("Error initializing NotificationManager:", error);
    }
  }

  // Handle navigation from notification data
  private async handleNotificationNavigation(
    notificationData: any
  ): Promise<void> {
    console.log(
      "Navigation from notification:",
      JSON.stringify(notificationData, null, 2)
    );

    // Normalize payload for chat navigation
    const data = notificationData?.data ?? notificationData ?? {};

    console.log("data===>>>>", data);

    const threadId = data?.threadId;
    const threadName = data?.title || data?.ThreadName || data?.title;
    const memberId = 125;
    const teamId = data?.teamId || data?.TeamId || data?.team_id || "";
    const teamName = data?.teamName || data?.TeamName || "";
    const teamProfileImage = data?.teamProfileImage || data?.TeamProfileImage || data?.teamImage || "";
    const totalMembers = data?.totalMembers || data?.TotalMembers || "5";

    if (!threadId || !memberId) {
      console.log("Missing required chat fields (threadId/memberId) in notification data");
      return;
    }

    const navigationParams: any = {
      itemDetails: {
        threadId: threadId,
        threadName: threadName || "",
      },
      memberId: String(memberId),
      teamId: teamId ? String(teamId) : undefined,
      team: {
        teamName: teamName || undefined,
        teamProfileImage: teamProfileImage || undefined,
        totalMembers: totalMembers ? Number(totalMembers) : undefined,
      },
    };

    // Check if navigation is ready
    if (navigationRef.isReady()) {
      // (navigationRef as any).navigate('ChatScreen', navigationParams);
    } else {
      // this.pendingNavigationData = { route: 'ChatScreen', params: navigationParams };

      // Wait for navigation to be ready and then navigate
      const checkNavigation = () => {
        if (navigationRef.isReady() && this.pendingNavigationData) {
          const pending: any = this.pendingNavigationData;
          (navigationRef as any).navigate(pending.route, pending.params);
          this.pendingNavigationData = null;
        } else {
          // Keep checking every 100ms for up to 5 seconds
          setTimeout(checkNavigation, 100);
        }
      };

      setTimeout(checkNavigation, 100);
    }
  }

  // Handle app launch from notification (killed state)
  private async handleInitialNotification(): Promise<void> {
    try {
      // Handle FCM initial notification (when app is opened from notification while killed)
      const initialMessage = await getInitialNotification(messagingInstance);
      if (initialMessage) {
        console.log("App opened from FCM notification:", initialMessage);
        await this.handleNotificationNavigation(initialMessage);
      }

      // Handle Notifee initial notification
      if (Platform.OS === "android") {
        const initialNotification = await notifee.getInitialNotification();
        if (initialNotification) {
          console.log(
            "App opened from Notifee notification:",
            initialNotification
          );
          const notificationData =
            initialNotification.notification.data?.originalMessage ||
            initialNotification.notification.data;
          await this.handleNotificationNavigation(notificationData);
        }
      }
    } catch (error) {
      console.error("Error handling initial notification:", error);
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === "ios") {
      return this.requestIOSPermission();
    } else if (Platform.OS === "android") {
      return this.requestAndroidPermission();
    }
    return false;
  }

  private async requestIOSPermission(): Promise<boolean> {
    try {
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("iOS FCM authorization status:", authStatus);
      } else {
        console.log("iOS FCM permission denied");
      }

      return enabled;
    } catch (error) {
      console.error("Error requesting iOS FCM permission:", error);
      return false;
    }
  }

  private async requestAndroidPermission(): Promise<boolean> {
    try {
      if (typeof Platform.Version === "number" && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log("Android POST_NOTIFICATIONS permission status:", granted);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Android POST_NOTIFICATIONS permission denied");
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error requesting Android FCM permission:", error);
      return false;
    }
  }

  public async getFCMToken(): Promise<string | null> {
    try {
      let fcmToken = storage.getString("fcmToken");
      if (!fcmToken) {
        fcmToken = await getToken(messagingInstance);
        console.log("FCM token:", fcmToken);
        if (fcmToken) {
          storage.set("fcmToken", fcmToken);
        }
      }
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  private async setupFCMListeners(): Promise<void> {
    // Handle foreground messages (when app is active)
    this.onMessageListener = onMessage(messagingInstance, async (remoteMessage) => {
      console.log("Foreground FCM message received");

      // ONLY display custom notification for data-only messages
      if (remoteMessage.data) {
        try {
          await this.displayNotification(remoteMessage);
        } catch (error) {
          console.error("Error displaying foreground notification:", error);
        }
      }
    });

    // Handle notification opened from background/killed state
    onNotificationOpenedApp(messagingInstance, async (remoteMessage) => {
      console.log("App opened from background via notification");
      await this.handleNotificationNavigation(remoteMessage);
    });
  }

  public setForegroundEventListener(
    handler: (type: EventType, detail: EventDetail) => void
  ): void {
    this.notifeeForegroundHandler = notifee.onForegroundEvent(
      async ({ type, detail }: any) => {
        console.log(
          "Notifee Foreground Event:",
          `Type: ${type}`,
          JSON.stringify(detail, null, 2)
        );

        // Handle notification dismissal
        if (type === EventType.DISMISSED) {
          console.log("Notification dismissed:", detail.notification?.id);
          return;
        }

        // Handle notification press (FOREGROUND state)
        if (type === EventType.PRESS && detail.notification?.data) {
          console.log("Notification pressed in foreground");
          const notificationData =
            detail?.notification?.data?.originalMessage ||
            detail?.notification?.data;
          await this.handleNotificationNavigation(notificationData);
        }

        if (handler) handler(type, detail);
      }
    );
  }

  public setInitialNotificationAndroidEvent(
    handler: (notification: InitialNotification) => void
  ): void {
    if (Platform.OS === "android") {
      notifee
        .getInitialNotification()
        .then((initialNotification) => {
          console.log(
            "Initial notification",
            JSON.stringify(initialNotification)
          );

          if (initialNotification) {
            handler(initialNotification);
          }
        })
        .catch((error: Error) => {
          console.log("error in getInitial notification", error);
        });
    }
  }

  public setBackgroundEventListener(
    handler: (type: EventType, detail: EventDetail) => void
  ): void {
    if (Platform.OS === "android") {
      this.backgroundAndroidEventHandler = (
        type: EventType,
        detail: EventDetail
      ) => {
        console.log("Android Background Event:", type, detail);

        // Handle notification press (BACKGROUND state)
        if (type === EventType.PRESS && detail.notification?.data) {
          console.log("Notification pressed in background (Android)");
          const notificationData =
            detail?.notification?.data?.originalMessage ||
            detail?.notification?.data;
          this.handleNotificationNavigation(notificationData);
        }

        if (handler) handler(type, detail);
      };
    }

    if (Platform.OS === "ios") {
      notifee.onBackgroundEvent(async ({ type, detail }: any) => {
        console.log("iOS Background event:", type, detail);

        // Handle notification dismissal in background
        if (type === EventType.DISMISSED) {
          console.log(
            "Background notification dismissed:",
            detail?.notification?.id
          );
          return;
        }

        // Handle notification press (BACKGROUND state - iOS)
        if (type === EventType.PRESS && detail.notification?.data) {
          console.log("Notification pressed in background (iOS)");
          const notificationData =
            detail?.notification?.data?.originalMessage ||
            detail?.notification?.data;
          await this.handleNotificationNavigation(notificationData);
        }

        if (handler) handler(type, detail);
      });
    }
  }
  //invoked from root index file to delegate method call
  public invokeAndroidBackgroundEvent(
    type: EventType,
    detail: EventDetail
  ): void {
    if (this.backgroundAndroidEventHandler) {
      this.backgroundAndroidEventHandler(type, detail);
    }
  }

  displayNotification = async (notifData: any) => {
    try {
      console.log("Processing notification display");

      // Extract title and body from EITHER notification payload OR data payload
      let title, body;

      if (notifData?.notification) {
        // Message has notification payload (FCM format)
        title = notifData.notification.title;
        body = notifData.notification.body;
      } else if (notifData?.data) {
        // Data-only message (preferred format)
        title = notifData.data.title;
        body = notifData.data.body;
      } else {
        console.log("No valid content found in message - skipping");
        return;
      }

      // Fallback to defaults if needed
      title = title || "HomeSafeAlert";
      body = body || "New incident notification";

      // Create notification channel with more explicit configuration
      const channelId = await notifee.createChannel({
        id: "homesafealert_incidents",
        name: "HomeSafeAlert Incidents",
        importance: AndroidImportance.HIGH,
        sound: "default",
        vibration: true,
        description: "Notifications for HomeSafeAlert incidents",
      });

      const notificationId = `hsa_${Date.now()}`;

      const notificationData = {
        ...notifData?.data,
        originalMessage: notifData,
        timestamp: Date.now(),
      };

      // Try with basic configuration first
      await notifee.displayNotification({
        id: notificationId,
        title: title,
        body: body,
        data: notificationData,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          autoCancel: true,
          ongoing: false,
          smallIcon: "ic_launcher_background",

          // colorized: true,
          visibility: AndroidVisibility.PUBLIC,
          showTimestamp: true,
          pressAction: {
            id: "default",
          },
          style: {
            type: 1, // BigTextStyle
            text: body,
          },
        },
      });
    } catch (error) {
      console.error("Error displaying notification:", error);

      // Emergency fallback notification with minimal configuration
      try {
        console.log("Attempting emergency fallback notification...");

        // Create a default channel first
        await notifee.createChannel({
          id: "default",
          name: "Default",
          importance: AndroidImportance.DEFAULT,
        });

        await notifee.displayNotification({
          title: "HomeSafeAlert",
          body: "New notification (fallback)",
          android: {
            channelId: "default",
            importance: AndroidImportance.DEFAULT,
            smallIcon: "ic_notification",
            color: "#FF6B35",
            visibility: AndroidVisibility.PUBLIC,
          },
        });
        console.log("Fallback notification displayed");
      } catch (fallbackError) {
        console.error("Fallback notification failed:", fallbackError);
      }
    }
  };

  // Test method to display a sample notification for debugging
  public async displayTestNotification(): Promise<void> {
    console.log("Displaying test notification");

    const testData = {
      notification: {
        title: "Test Notification",
        body: "This is a test notification from HomeSafeAlert",
      },
      data: {
        NotificationId: "12345",
        incidentId: "12345",
      },
    };

    await this.displayNotification(testData);
  }

  // Check and execute any pending navigation from notifications
  // Call this method when navigation becomes ready
  public executePendingNavigation(): void {
    if (this.pendingNavigationData && navigationRef.isReady()) {
      console.log("Executing pending notification navigation");
      const pending: any = this.pendingNavigationData;
      if (pending?.route) {
        (navigationRef as any).navigate(pending.route, pending.params);
      } else {
        // (navigationRef as any).navigate('ChatScreen', pending);
      }
      this.pendingNavigationData = null;
    }
  }

  public async clearAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  public async clearNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log("Notification cleared:", notificationId);
    } catch (error) {
      console.error("Error clearing notification:", error);
    }
  }

  public removeListeners(): void {
    if (this.onMessageListener) {
      this.onMessageListener();
    }
    if (this.notifeeForegroundHandler) {
      this.notifeeForegroundHandler();
    }
  }
}

export default new NotificationManager();
