import { Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {Vibration} from 'react-native';
import BackgroundService from 'react-native-background-actions';

export const requestLocationPermission = async () => {
    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (fine === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Fine location granted');

        // Now request background
        if (Number(Platform.Version) >= 29) {
          const bg = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message: 'This app needs background location to work properly.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (bg === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Background location granted ');
          } else {
            console.log('Background location denied ');
          }
        }
      } else {
        console.log('Fine location denied ');
      }
    } catch (err) {
      console.warn(err);
    }
  };


export const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
     async (position) => {
        const { latitude, longitude } = position.coords;
        const dist = getDistanceFromLatLonInM(
          latitude,
          longitude,
          destination.latitude,
          destination.longitude
        );
        console.log(`Distance to destination: ${Math.round(dist)} meters`);
        if (dist < 100) {
            Vibration.vibrate(5000); // Vibrate for 5 seconds
            console.log("Vibrating")
            console.log('Stopping Background Service');
            await BackgroundService.stop();
            console.log('Stopped Background Service');
        }else{
            console.log("Not Reached Yet")
        }

      },
      (error) => {
        console.log(error.message);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
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

    const destination = {
      latitude: 19.215784, // example: HOME
      longitude: 72.817213,
    };