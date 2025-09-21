import { Platform, PermissionsAndroid } from "react-native";
import {promptForEnableLocationIfNeeded} from "react-native-android-location-enabler";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import Sound from 'react-native-sound';

const ringtone = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // If loaded successfully, you can log the duration or other details.
  console.log('duration in seconds: ' + ringtone.getDuration() + 'number of channels: ' + ringtone.getNumberOfChannels());
});

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

      // 3. Prompt user to turn ON GPS if it’s off
      try {
        await promptForEnableLocationIfNeeded({
          interval: 10000,
        });
        return true; // ✅ GPS ON + permissions granted
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

export function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Radius of Earth in metres
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in metres
}

export const checkGPSisON = () => {

}
