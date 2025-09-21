// PermissionGuideBox.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
// import { ensureLocationEnabled, openAppSettings } from "./locationUtils";

type Props = {
  title?: string;
};

export default function PermissionGuideBox({ title = "Location setup guide" }: Props) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function onCheckEnable() {
    // setLoading(true);
    // setStatusMsg(null);
    // const ok = await ensureLocationEnabled();
    // setLoading(false);

    // if (ok) {
    //   setStatusMsg("✅ Location permissions granted and GPS is ON");
    // } else {
    //   setStatusMsg("⚠️ Location not ready — permissions or GPS not enabled");
    // }
  }

  function onOpenSettings() {
    Alert.alert(
      "Open Settings",
      "Open app settings to enable permissions.",
      [
        { text: "Cancel", style: "cancel" },
        // { text: "Open Settings", onPress: () => openAppSettings() },
      ],
      { cancelable: true }
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.box}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>

        <ScrollView style={styles.content} nestedScrollEnabled>
          <Step
            number={1}
            title="Install required packages"
            body={`npm install react-native-permissions react-native-geolocation-service react-native-android-location-enabler\nnpx pod-install`}
          />

          <Step
            number={2}
            title="Android: Manifest permissions"
            body={`Add to android/app/src/main/AndroidManifest.xml:\n\n<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />`}
          />

          <Step
            number={3}
            title="iOS: Info.plist"
            body={`Add to Info.plist:\n\nNSLocationWhenInUseUsageDescription\nNSLocationAlwaysAndWhenInUseUsageDescription\nUIBackgroundModes -> location`}
          />

          <Step
            number={4}
            title="Request runtime permissions"
            body={`Call ensureLocationEnabled() before starting tracking. On Android it will request foreground + background and prompt user to enable GPS; on iOS it requests WhenInUse -> Always.\n\nBehavior: If the user denies, the function returns false (no throw).`}
          />

          <Step
            number={5}
            title="How to use in code"
            body={`import { ensureLocationEnabled } from './locationUtils'\n\nconst ready = await ensureLocationEnabled();\nif (ready) { /* start location tracking */ }`}
          />

          <Step
            number={6}
            title="Troubleshooting"
            body={`• If "Don't ask again" selected on Android -> open Settings.\n• iOS requires adding keys to Info.plist; otherwise requests silently fail.\n• Background permission (Android 10+/iOS) may show extra system dialogs.`}
          />

          <View style={{ height: 8 }} />
          {statusMsg ? <Text style={styles.status}>{statusMsg}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.primary]}
            onPress={onCheckEnable}
            accessibilityLabel="Check and enable location"
            testID="check-enable-btn"
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Check & Enable</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.ghost]}
            onPress={onOpenSettings}
            accessibilityLabel="Open app settings"
            testID="open-settings-btn"
            activeOpacity={0.8}
          >
            <Text style={[styles.btnText, styles.ghostText]}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Step({ number, title, body }: { number: number; title: string; body: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepLeft}>
        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View>
      </View>
      <View style={styles.stepRight}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    // Android elevation
    elevation: 4,
    maxHeight: 520,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  content: {
    marginBottom: 12,
  },
  step: {
    flexDirection: "row",
    marginBottom: 12,
  },
  stepLeft: {
    width: 34,
    alignItems: "center",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#2A4BF5",
    fontWeight: "700",
  },
  stepRight: {
    flex: 1,
    paddingLeft: 8,
  },
  stepTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  stepBody: {
    color: "#444",
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  primary: {
    backgroundColor: "#2A4BF5",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  ghostText: {
    color: "#333",
  },
  status: {
    paddingVertical: 6,
    fontWeight: "600",
  },
});
