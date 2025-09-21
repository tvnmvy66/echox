import { Platform, PermissionsAndroid } from "react-native";
import {promptForEnableLocationIfNeeded} from "react-native-android-location-enabler";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      // 1. Request FOREGROUND permission
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need your location for better experience.",
          buttonPositive: "OK",
        }
      );

      if (fine !== PermissionsAndroid.RESULTS.GRANTED) {
        return false; // Foreground denied → exit silently
      }

      // 2. Request BACKGROUND permission (Android 10+)
      if (Platform.Version >= 29) {
        const background = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: "Background Location Permission",
            message:
              "Allow background location to keep tracking even when the app is closed.",
            buttonPositive: "OK",
          }
        );
        if (background !== PermissionsAndroid.RESULTS.GRANTED) {
          return false; // Background denied → exit silently
        }
      }
      
      // 🔹 NOTIFICATION FLOW (Android 13+ needs POST_NOTIFICATIONS)
      if (Platform.Version >= 33) {
        const notif = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notification Permission",
            message: "We need permission to send you alerts & updates.",
            buttonPositive: "OK",
          }
        );
        if (notif !== PermissionsAndroid.RESULTS.GRANTED) {
          return false; // Background denied → exit silently
        }
      } else {
        return true; 
      }

      // 3. Prompt user to turn ON GPS if it’s off
      try {
        await promptForEnableLocationIfNeeded({
          interval: 10000,
        });
        return true; // GPS enabled
      } catch {
        return false; // GPS refused
      }
    } else {
      // iOS flow
      const whenInUse = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (whenInUse !== RESULTS.GRANTED) {
        return false; // Foreground denied
      }

      const background = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      if (background !== RESULTS.GRANTED) {
        return false; // Background denied
      }

      return true; // ✅ All permissions granted
    }
  } catch {
    return false; // Fail-safe: don’t crash
  }
}