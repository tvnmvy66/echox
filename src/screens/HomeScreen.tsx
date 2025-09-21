import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Vibration,
  Modal,
  FlatList,
  StatusBar,
  Linking,
  TextInput
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {
  requestLocationPermission,
} from '../utils/location';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Navbar from '../components/Navbar';
import { BlurView } from '@react-native-community/blur';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../context/theme';
import SplitText from '../components/SplitText';
import HelpModal from "../components/HelpModal";

type Station = {
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  category: "railway" | "metro";
};

const STORAGE_KEY = 'selected_station';

const stations: Station[] = [
  { name: 'Churchgate', latitude: 18.9352, longitude: 72.8277, status: 'none', category: 'railway' },
  { name: 'Dadar', latitude: 19.0186, longitude: 72.8446, status: 'none', category: 'railway'  },
  { name: 'Bandra', latitude: 19.0544, longitude: 72.8402, status: 'none', category: 'railway'  },
  { name: 'Andheri', latitude: 19.1197, longitude: 72.8468, status: 'none', category: 'railway'  },
  { name: 'Borivali', latitude: 19.229, longitude: 72.8576, status: 'none', category: 'railway'  },
  { name: 'Virar', latitude: 19.4559, longitude: 72.8111, status: 'none', category: 'railway' },
  { name: 'Home', latitude: 19.215784, longitude: 72.817213, status: 'none', category: 'railway'  },
  { name: 'Milan', latitude: 19.215462, longitude: 72.820778, status: 'none', category: 'railway'  },
  { name: 'Khar', latitude: 19.0596, longitude: 72.8365, status: 'none', category: 'railway'  },
  { name: 'Santacruz', latitude: 19.0822, longitude: 72.8365, status: 'none', category: 'railway'  },
  { name: 'Vile Parle', latitude: 19.0973, longitude: 72.8353, status: 'none', category: 'railway'  },
  { name: 'Marol Naka', latitude: 19.1186, longitude: 72.8697, status: 'none', category: 'metro'  },
  { name: 'Airport Road', latitude: 19.1129, longitude: 72.8682, status: 'none', category: 'metro'  },
  { name: 'Western Express Highway', latitude: 19.1255, longitude: 72.8656, status: 'none', category: 'metro'  },
  { name: 'Ghatkopar', latitude: 19.0728, longitude: 72.9081, status: 'none', category: 'metro'  },
  { name: 'Vikhroli', latitude: 19.0901, longitude: 72.9356, status: 'none', category: 'metro'  },
  { name: 'Kanjurmarg', latitude: 19.1133, longitude: 72.9555, status: 'none', category: 'metro'  },
  { name: 'Bhandup', latitude: 19.1504, longitude: 72.9566, status: 'none', category: 'metro'  },
  { name: 'Mulund', latitude: 19.1633, longitude: 73.0726, status: 'none', category: 'railway'  },
  { name: 'Thane', latitude: 19.2183, longitude: 72.9781, status: 'none', category: 'railway'  },
  { name: 'Dombivli', latitude: 19.2165, longitude: 73.0903, status: 'none', category: 'railway'  },
  { name: 'Kalyan', latitude: 19.2403, longitude: 73.1304, status: 'none', category: 'railway'  },
  { name: 'Ulhasnagar', latitude: 19.2185, longitude: 73.1625, status: 'none', category: 'railway'  },
  { name: 'Vasai Road', latitude: 19.3917, longitude: 72.8397, status: 'none', category: 'railway'  },
  { name: 'Dahisar', latitude: 19.3003, longitude: 72.8417, status: 'none', category: 'railway'  },
];

const ringtone = new Sound('ringtone.mp3', Sound.MAIN_BUNDLE, error => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
});

function HomeScreen() {
  const [isBGS, setisBGS] = useState<boolean>(BackgroundService.isRunning());
  // const [helpVisible, setHelpVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [helpVisible, setHelpVisible] = useState<boolean>(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const themeColors = isDark ? darkTheme : lightTheme;
  const [selectedCategory, setSelectedCategory] = useState<"railway" | "metro">("railway");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestLocationPermission();
    } else {
      console.log('ungranted');
    }
  });

  const sleep = (time: any) =>
    new Promise((resolve: any) => setTimeout(() => resolve(), time));

  const veryIntensiveTask = async () => {
    await new Promise(async () => {
      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        try {
          // 1. Fetch destination from AsyncStorage
          const destinationString = await AsyncStorage.getItem(
            'selected_station',
          );
          if (!destinationString) {
            console.log('No destination found in storage');
            return;
          }
          const destination = JSON.parse(destinationString);

          // 2. Get current location
          Geolocation.getCurrentPosition(
            async (position: any) => {
              const { latitude, longitude } = position.coords;
              console.log(`Current Position: ${latitude}, ${longitude}`);

              // 3. Calculate distance
              const R = 6371000; 
              const toRad = (value: number) => (value * Math.PI) / 180;

              const dLat = toRad(destination.latitude - latitude);
              const dLon = toRad(destination.longitude - longitude);

              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(latitude)) *
                Math.cos(toRad(destination.latitude)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const dist =  R * c;
              
              if (dist <= 150) {
                await BackgroundService.updateNotification({
                  taskDesc: `${i} : lat: ${latitude} lon: ${longitude} /n${Math.round(
                    dist,
                  )} metres away... reached!`,
                });
                Vibration.vibrate(4000);
                ringtone.play(success => {
                  if (success) {
                    console.log('successfully finished playing');
                  } else {
                    console.log('playback failed due to audio decoding errors');
                  }
                });
                await BackgroundService.stop();
              } else {
                  await BackgroundService.updateNotification({
                    taskDesc: `${destination.name} : ${Math.round(dist)} metres away...`,
                  });
                  console.log('Not Reached Yet');
                }
              },
            (error: any) => {
              console.log(error.message);
            },
            { enableHighAccuracy: false, timeout: 14500, maximumAge: 0 },
          );
        } catch (err) {
          console.error('Error in getCurrentLocation:', err);
        }
        await sleep(15000);
      }
    });
  };

  const options = {
    taskName: 'service',
    taskTitle: 'App is running in background',
    taskDesc: 'Running...',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#fff',
    linkingURI: 'com.echox://',
  };

  const filteredStations = stations.filter(
    (station) =>
      station.category === selectedCategory &&
      station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const startBackgroundService = async () => {
    setisBGS(true);
    console.log('starting Background Service');
    await BackgroundService.start(veryIntensiveTask, options); // Only Android, iOS will ignore this call
    console.log('started Background Service');
  };

  const stopBackgroundService = async () => {
    await BackgroundService.stop();
    console.log('Stopped Background Service');
    setisBGS(false);
  };

  const handleStationSelect = async (station: Station) => {
    const stationObj: Station = {
      ...station,
      status: 'selected',
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stationObj));
      setModalVisible(false);
      startBackgroundService();
    } catch (err) {
      console.log('Error saving station:', err);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'} // text/icons dark
        backgroundColor={themeColors.background} // background color
      />
      {/* Navbar */}
      <Navbar title="EchoX" />
      {/* Alarm Buttons */}
      <View>
        <View style={styles.splitTextTitleContainer}>
          <SplitText
            text="Never Miss Your"
            splitBy="char"
            duration={420}
            stagger={60}
            translateY={10}
            style={[styles.splitTextTitle, { color: themeColors.text }]}
          />
          <SplitText
            text="Stop Again!"
            splitBy="char"
            duration={420}
            stagger={60}
            translateY={10}
            style={[styles.splitTextTitle, { color: themeColors.text }]}
          />
        </View>
        <View style={[styles.splitTextDespContainer]}>
          <SplitText
            text="Get a sound alert before you arrive"
            splitBy="word"
            duration={420}
            stagger={60}
            translateY={10}
            style={[styles.splitTextDesp, { color: themeColors.text }]}
          />
          <SplitText
            text="at your destination. Simply set"
            splitBy="word"
            duration={420}
            stagger={60}
            translateY={10}
            style={[styles.splitTextDesp, { color: themeColors.text }]}
          />
          <SplitText
            text="your location and go!"
            splitBy="word"
            duration={420}
            stagger={60}
            translateY={10}
            style={[styles.splitTextDesp, { color: themeColors.text }]}
          />
        </View>
        <TouchableOpacity style={styles.helpButtonContainer} onPress={() => setHelpVisible(true)}>
          <Text style={[styles.helpText, { color: themeColors.text }]}>
            Need Help?
          </Text>
          <Icon name="info" size={20} color={themeColors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.alarmButtonContainer}>
        {!isBGS ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.buttonbg }]}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="alarm-add" size={30} color={themeColors.buttoncolor} />
            <Text style={[styles.buttonText,{color : themeColors.buttoncolor}]}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.buttonbg }]}
            onPress={stopBackgroundService}
          >
            <Icon name="alarm-off" size={30} color={themeColors.buttoncolor} />
            <Text style={[styles.buttonText,{color : themeColors.buttoncolor}]}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.footer]}>
        <Text style={[styles.text, {color: themeColors.text}]}>*For queries, features & feedback</Text>
        <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: themeColors.buttonbg }]}
            onPress={() => {Linking.openURL('mailto:tanmay9987@gmail.com').catch((err) => console.error("Failed to open mail app:", err));}}
          >
            <Icon name="mail" size={20} color={themeColors.buttoncolor} />
            <Text style={{color : themeColors.buttoncolor}}> Contact Developer</Text>
          </TouchableOpacity>
      </View>
      {/* Popup Modal */}
<Modal visible={modalVisible} transparent animationType="fade">
      <BlurView
        style={styles.modalBackground}
        blurType={isDark ? "dark" : "light"}
        blurAmount={10}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      >
        <View
          style={[
            styles.modalBox,
            { backgroundColor: themeColors.background, borderColor: themeColors.text },
          ]}
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            Select Destination Station
          </Text>

          {/* Category Toggle */}
          <View style={styles.categoryToggle}>
            {["railway", "metro"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.radioOption,
                  {
                    backgroundColor:
                      selectedCategory === cat
                        ? themeColors.buttonbg
                        : themeColors.background,
                  },
                ]}
                onPress={() => setSelectedCategory(cat as "railway" | "metro")}
              >
                <Text
                  style={{
                    color:
                      selectedCategory === cat
                        ? themeColors.buttoncolor
                        : themeColors.text,
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchInput,
              {
                borderColor: themeColors.linetext,
                color: themeColors.text,
              },
            ]}
            placeholder="Search station..."
            placeholderTextColor={themeColors.linetext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Station List */}
          <FlatList
            data={filteredStations}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.stationItem,
                  { borderBottomColor: themeColors.linetext },
                ]}
                onPress={() => handleStationSelect(item)}
              >
                <Text style={[styles.stationText, { color: themeColors.text }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: themeColors.buttonbg }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: themeColors.buttoncolor }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
    <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        themeColors={themeColors}
        isDark={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  marginBottom: { marginBottom: 20 },
  button: {
    padding: 16,
    borderRadius: 30,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  selectedText: { fontSize: 18, fontWeight: 'bold' },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    maxHeight: '70%',
    elevation: 10,
    borderWidth: 0.1,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  stationItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  stationText: { fontSize: 16 },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
  },
  splitTextTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    textAlign: 'center',
  },
  splitTextDesp: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  splitTextTitleContainer: { alignItems: 'center' },
  splitTextDespContainer: { alignItems: 'center', marginTop: 10 },
  helpText: { fontSize: 12, textDecorationLine: 'underline' },
  helpButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    gap: 2,
  },
  footer: { fontSize: 20, height: 100, alignItems: 'center', justifyContent: 'center' },
  alarmButtonContainer: { alignItems: 'center'},
  contactButton:{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,paddingVertical: 8, borderRadius: 20},
  text:{fontSize: 10},
  buttonText:{fontSize: 20, fontWeight: '600'},
  categoryToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "rgba(72, 70, 70, 0.12)",
    borderRadius: 15,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 12,
    width: '40%',
  },
  
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "white", // will override dynamically
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
  },
});

export default HomeScreen;
