import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  AccessibilityInfo,
} from "react-native";
import { BlurView } from "@react-native-community/blur";

type ThemeColors = {
  background: string;
  text: string;
  buttonbg: string;
  buttoncolor: string;
  border?: string;
};

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  themeColors: ThemeColors;
  isDark?: boolean;
}

interface Step {
  title: string;
  desc: string;
}

const steps: Step[] = [
  {
    title: "Allow location permission\n > Allow all the time",
    desc: "When prompted, choose 'Allow all time' so the app can show your position even when its closed and detect if you are nearby your destination stations.",
  },
  {
    title: "Turn on GPS",
    desc: "Enable device GPS/location services for accurate station detection.",
  },
  {
    title: "Choose category",
    desc: "Switch between 'metro' and 'railway' to filter the stations displayed.",
  },
  {
    title: "How it works...",
    desc: "(**All thing are locally we never send any location outside your phone, which is why it also works offline)\nUse the GPS to fetch your current location and calculate distance between you and the destination station. When its less than 1KM, an alert will be sent.",
  },
  {
    title: "For queries, features & feedback",
    desc: "Reach out via the email provided in the app by pressing the Contact button on the home screen.",
  },
];

export default function HelpModal({
  visible,
  onClose,
  themeColors,
  isDark = false,
}: HelpModalProps) {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView
        style={styles.modalBackground}
        blurType={isDark ? "light" : "dark"}
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      >
        <View
          style={[
            styles.modalBox,
            {
              backgroundColor: themeColors.background,
              borderColor: themeColors.border ?? themeColors.text,
            },
          ]}
          accessible
          accessibilityLabel="Help guide"
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            Quick Guide
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {steps.map((s, i) => (
              <StepItem
                key={s.title}
                index={i + 1}
                title={s.title}
                desc={s.desc}
                textColor={themeColors.text}
                screenReaderEnabled={screenReaderEnabled}
              />
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: themeColors.buttonbg, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.closeText, { color: themeColors.buttoncolor }]}>
              Got it!
            </Text>
          </Pressable>
        </View>
      </BlurView>
    </Modal>
  );
}

interface StepItemProps {
  index: number;
  title: string;
  desc: string;
  textColor: string;
  screenReaderEnabled: boolean;
}

function StepItem({
  index,
  title,
  desc,
  textColor,
  screenReaderEnabled,
}: StepItemProps) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.badge} accessible accessibilityLabel={`Step ${index}`}>
        <Text style={styles.badgeText}>{index}</Text>
      </View>

      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { color: textColor }]}>{title}</Text>
        <Text
          style={[styles.stepDesc, { color: textColor }]}
          accessibilityLabel={screenReaderEnabled ? `${title}. ${desc}` : undefined}
        >
          {desc}
        </Text>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");
const modalWidth = Math.min(760, width - 40);

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: modalWidth,
    maxHeight: "80%",
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  scroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#efefef",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 8,
  },
  closeText: {
    fontWeight: "700",
  },
});
